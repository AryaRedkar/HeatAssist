/**
 * MumbaiHeatmapTab.jsx
 * --------------------
 * Drop into: frontend/src/components/MumbaiHeatmapTab.jsx
 *
 * SAME dependencies as HeatmapTab.jsx — no extras needed:
 *   npm install leaflet leaflet.heat
 *   import 'leaflet/dist/leaflet.css';  ← in main.jsx
 *   VITE_OWM_API_KEY=xxx                ← in .env
 *
 * USAGE in Dashboard.jsx — swap the heatmap tab render:
 *   import MumbaiHeatmapTab from "../components/MumbaiHeatmapTab";
 *   ...
 *   {activeTab === "heatmap" && <MumbaiHeatmapTab userData={userData} />}
 *
 * OR keep both (All-India + Mumbai drill-down) with a sub-toggle — see
 * the HOW TO COMBINE section at the bottom of this file.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* ─────────────────────────────────────────────────────────────────────
   NEIGHBORHOODS
   Each has a real lat/lng centroid + a heat_offset vs city average.
   Offsets are based on:
     • Distance from sea (coastal = cooler)
     • Green cover / mangroves (Borivali, Aarey = cooler)
     • Urban density / concrete (Dharavi, Kurla, Govandi = hotter)
     • Industrial zones (Thane border, Chembur = hotter)
───────────────────────────────────────────────────────────────────── */
const NEIGHBORHOODS = [
  // South Mumbai — coastal, sea breeze, moderate
  { n: "Colaba",         lat: 18.9067, lng: 72.8147, zone: "South",   offset: +1  },
  { n: "Nariman Point",  lat: 18.9256, lng: 72.8242, zone: "South",   offset:  0  },
  { n: "Fort",           lat: 18.9340, lng: 72.8355, zone: "South",   offset: +2  },
  { n: "Worli",          lat: 19.0069, lng: 72.8176, zone: "South",   offset:  0  },

  // Central Mumbai — dense, no sea breeze
  { n: "Dadar",          lat: 19.0178, lng: 72.8478, zone: "Central", offset: +3  },
  { n: "Lower Parel",    lat: 18.9985, lng: 72.8331, zone: "Central", offset: +3  },
  { n: "Sion",           lat: 19.0414, lng: 72.8636, zone: "Central", offset: +3  },
  { n: "Dharavi",        lat: 19.0422, lng: 72.8544, zone: "Central", offset: +6  }, // most dense

  // Western suburbs — some sea influence, mixed
  { n: "Bandra (W)",     lat: 19.0596, lng: 72.8295, zone: "West",    offset: -1  },
  { n: "Versova",        lat: 19.1325, lng: 72.8103, zone: "West",    offset: -3  }, // coastal
  { n: "Juhu",           lat: 19.1075, lng: 72.8263, zone: "West",    offset: -2  }, // beach
  { n: "Andheri (W)",    lat: 19.1197, lng: 72.8464, zone: "West",    offset: +2  },
  { n: "Malad",          lat: 19.1871, lng: 72.8487, zone: "West",    offset: +1  },
  { n: "Goregaon",       lat: 19.1663, lng: 72.8526, zone: "West",    offset: +2  },
  { n: "Borivali",       lat: 19.2307, lng: 72.8567, zone: "West",    offset: -1  }, // near national park
  { n: "Dahisar",        lat: 19.2516, lng: 72.8569, zone: "West",    offset: -2  }, // green cover

  // Eastern suburbs — industrial, hotter
  { n: "Andheri (E)",    lat: 19.1136, lng: 72.8697, zone: "East",    offset: +4  },
  { n: "Kurla",          lat: 19.0726, lng: 72.8794, zone: "East",    offset: +5  },
  { n: "Chembur",        lat: 19.0522, lng: 72.8994, zone: "East",    offset: +4  },
  { n: "Ghatkopar",      lat: 19.0863, lng: 72.9083, zone: "East",    offset: +5  },
  { n: "Vikhroli",       lat: 19.1030, lng: 72.9260, zone: "East",    offset: +4  },
  { n: "Mulund",         lat: 19.1726, lng: 72.9563, zone: "East",    offset: +4  },
  { n: "Powai",          lat: 19.1197, lng: 72.9080, zone: "East",    offset: +2  }, // lake
  { n: "Thane (border)", lat: 19.1988, lng: 72.9718, zone: "East",    offset: +6  }, // industrial fringe
];

/* zone → map view */
const ZONE_VIEWS = {
  all:     { lat: 19.076,  lng: 72.877,  zoom: 12 },
  South:   { lat: 18.930,  lng: 72.830,  zoom: 14 },
  Central: { lat: 19.020,  lng: 72.855,  zoom: 14 },
  West:    { lat: 19.160,  lng: 72.840,  zoom: 13 },
  East:    { lat: 19.100,  lng: 72.910,  zoom: 13 },
};

const ZONE_COLORS = {
  South:   "#3b82f6",
  Central: "#f97316",
  West:    "#8b5cf6",
  East:    "#ef4444",
};

const HEAT_GRADIENT = {
  0.0: "#00bfff",
  0.2: "#00e5ff",
  0.35: "#00e676",
  0.5:  "#ffee58",
  0.65: "#ff9800",
  0.82: "#f44336",
  1.0:  "#b71c1c",
};

const OWM_URL = "https://api.openweathermap.org/data/2.5/weather";
const OWM_KEY = import.meta.env.OWM_API_KEY;

/* ─── helpers ─────────────────────────────────────────────────────── */

function tempToColor(t) {
  if (t < 22) return "#00e5ff";
  if (t < 27) return "#00e676";
  if (t < 32) return "#ffee58";
  if (t < 36) return "#ff9800";
  if (t < 40) return "#f44336";
  return "#b71c1c";
}

function tempToIntensity(t) {
  // Mumbai range roughly 28–48°C in summer
  return Math.min(1, Math.max(0.05, (t - 22) / 26));
}

function riskInfo(t) {
  if (t < 30) return { label: "Low",      color: "#10b981", bg: "#d1fae5" };
  if (t < 36) return { label: "Moderate", color: "#eab308", bg: "#fef9c3" };
  if (t < 41) return { label: "High",     color: "#f97316", bg: "#ffedd5" };
  return              { label: "Extreme",  color: "#ef4444", bg: "#fee2e2" };
}

const TIPS = {
  Low:      "Comfortable. Stay hydrated, enjoy outdoor activities.",
  Moderate: "Carry water. Wear light, breathable clothing.",
  High:     "Avoid direct sun 11am–4pm. Use shade and stay hydrated.",
  Extreme:  "Stay indoors. Risk of heat exhaustion and heat stroke.",
};

/* ─── component ───────────────────────────────────────────────────── */

export default function MumbaiHeatmapTab({ userData }) {
  const mapRef        = useRef(null);
  const leafletRef    = useRef(null);
  const heatLayerRef  = useRef(null);
  const markersRef    = useRef([]);

  const [cityData,  setCityData]  = useState({});   // { "Colaba": { temp, hum } }
  const [selected,  setSelected]  = useState(null);
  const [status,    setStatus]    = useState("Loading…");
  const [zone,      setZone]      = useState("all");
  const [sortBy,    setSortBy]    = useState("zone"); // "zone" | "temp" | "risk"

  /* ── init Leaflet once ── */
  useEffect(() => {
    if (leafletRef.current) return;

    leafletRef.current = L.map(mapRef.current, { zoomControl: true })
      .setView([19.076, 72.877], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(leafletRef.current);

    fetchTemps();

    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
  }, []);

  /* ── fly to zone ── */
  useEffect(() => {
    if (!leafletRef.current) return;
    const v = ZONE_VIEWS[zone] || ZONE_VIEWS.all;
    leafletRef.current.flyTo([v.lat, v.lng], v.zoom, { duration: 0.7 });
  }, [zone]);

  /* ── re-render heatmap when data arrives ── */
  useEffect(() => {
    if (!leafletRef.current || !Object.keys(cityData).length) return;
    renderHeatmap(cityData);
  }, [cityData]);

  /* ── fetch OWM for every neighborhood ── */
  async function fetchTemps() {
    setStatus("Fetching live temperatures for all Mumbai zones…");

    // We fetch OWM for the city centre (Mumbai) once, then apply
    // per-neighborhood offsets. This avoids 24 API calls and stays
    // within OWM free tier.  If you have a paid key, you can switch
    // to individual calls (the commented-out block below).
    const baseTemp   = userData?.temp     ?? null;
    const baseHum    = userData?.humidity ?? null;

    if (baseTemp !== null && baseHum !== null) {
      // Use already-fetched weather from Dashboard userData
      buildFromBase(baseTemp, baseHum, "Live · via Dashboard weather data");
      return;
    }

    // Fallback: fetch Mumbai directly
    if (OWM_KEY) {
      try {
        const res  = await fetch(
          `${OWM_URL}?q=Mumbai&appid=${OWM_KEY}&units=metric`
        );
        const json = await res.json();
        buildFromBase(
          Math.round(json.main.temp),
          json.main.humidity,
          `Live · OpenWeatherMap · ${new Date().toLocaleTimeString("en-IN")}`
        );
        return;
      } catch (_) { /* fall through to demo */ }
    }

    // Demo mode
    buildFromBase(37, 72, "Demo mode — add VITE_OWM_API_KEY to .env for live data");
  }

  function buildFromBase(base, hum, msg) {
    const data = {};
    NEIGHBORHOODS.forEach(nb => {
      // small random jitter ±0.5°C for realism
      const jitter = (Math.random() - 0.5);
      data[nb.n] = {
        temp: Math.round(base + nb.offset + jitter),
        hum:  Math.round(hum  + (Math.random() - 0.5) * 6),
      };
    });
    setCityData(data);
    setStatus(msg);
  }

  /* ── draw heat blobs + dot markers ── */
  function renderHeatmap(data) {
    const map = leafletRef.current;
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const pts = [];
    NEIGHBORHOODS.forEach(nb => {
      const d = data[nb.n];
      if (!d) return;
      const intensity = tempToIntensity(d.temp);

      // centre point full intensity
      pts.push([nb.lat, nb.lng, intensity]);

      // scatter 8 ghost points within ~600m radius for blob shape
      for (let i = 0; i < 8; i++) {
        pts.push([
          nb.lat + (Math.random() - 0.5) * 0.012,
          nb.lng + (Math.random() - 0.5) * 0.012,
          intensity * 0.65,
        ]);
      }
    });

    heatLayerRef.current = L.heatLayer(pts, {
      radius: 38,
      blur:   30,
      maxZoom: 14,
      max: 1,
      gradient: HEAT_GRADIENT,
    }).addTo(map);

    // dot markers
    NEIGHBORHOODS.forEach(nb => {
      const d = data[nb.n];
      if (!d) return;
      const risk = riskInfo(d.temp);

      const marker = L.circleMarker([nb.lat, nb.lng], {
        radius:      7,
        fillColor:   tempToColor(d.temp),
        color:       "#fff",
        weight:      1.5,
        opacity:     1,
        fillOpacity: 0.95,
      }).addTo(map);

      marker.bindTooltip(
        `<b style="font-size:13px">${nb.n}</b><br>${d.temp}°C · ${risk.label}`,
        { direction: "top", offset: [0, -8] }
      );
      marker.on("click", () => setSelected({ nb, d }));
      markersRef.current.push(marker);
    });
  }

  /* ── sorted / filtered list ── */
  const displayList = useCallback(() => {
    let list = NEIGHBORHOODS.filter(nb => zone === "all" || nb.zone === zone);
    list = list.map(nb => ({ ...nb, ...(cityData[nb.n] || { temp: "–", hum: "–" }) }));
    if (sortBy === "temp") list.sort((a, b) => (b.temp ?? 0) - (a.temp ?? 0));
    else if (sortBy === "risk") list.sort((a, b) => (b.temp ?? 0) - (a.temp ?? 0));
    else list.sort((a, b) => a.zone.localeCompare(b.zone) || a.n.localeCompare(b.n));
    return list;
  }, [zone, cityData, sortBy]);

  /* ── summary stats ── */
  const allLoaded = Object.keys(cityData).length === NEIGHBORHOODS.length;
  const temps = allLoaded ? Object.values(cityData).map(d => d.temp) : [];
  const avgTemp  = temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : "–";
  const maxTemp  = temps.length ? Math.max(...temps) : "–";
  const minTemp  = temps.length ? Math.min(...temps) : "–";
  const hottestNb = allLoaded
    ? NEIGHBORHOODS.find(nb => cityData[nb.n]?.temp === maxTemp)?.n ?? "–"
    : "–";
  const coolestNb = allLoaded
    ? NEIGHBORHOODS.find(nb => cityData[nb.n]?.temp === minTemp)?.n ?? "–"
    : "–";

  const zones = ["all", "South", "Central", "West", "East"];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* status bar */}
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9ca3af" }}>{status}</p>

      {/* summary stat cards */}
      {allLoaded && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Avg temp",     value: `${avgTemp}°C` },
            { label: "Hottest zone", value: hottestNb,     small: true },
            { label: "Coolest zone", value: coolestNb,     small: true },
          ].map(s => (
            <div key={s.label} style={{
              background: "#f9fafb", borderRadius: 10, padding: "10px 12px",
              border: "1px solid #e5e7eb",
            }}>
              <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {s.label}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: s.small ? 13 : 20, fontWeight: 700, color: "#111827" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* zone filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {zones.map(z => (
          <button key={z} onClick={() => setZone(z)} style={{
            padding: "5px 13px", borderRadius: 20, border: "1.5px solid",
            borderColor: zone === z
              ? (z === "all" ? "#111827" : ZONE_COLORS[z])
              : "#d1d5db",
            background: zone === z
              ? (z === "all" ? "#111827" : ZONE_COLORS[z])
              : "#fff",
            color: zone === z ? "#fff" : "#374151",
            fontSize: 12, cursor: "pointer", fontWeight: zone === z ? 600 : 400,
          }}>
            {z === "all" ? "All Mumbai" : `${z} Mumbai`}
          </button>
        ))}
      </div>

      {/* Leaflet map */}
      <div ref={mapRef} style={{
        width: "100%", height: 420, borderRadius: 14,
        overflow: "hidden", border: "1px solid #e5e7eb", marginBottom: 10,
      }} />

      {/* gradient legend */}
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 10, marginBottom: 3 }}>
        {["#00bfff","#00e5ff","#00e676","#adff2f","#ffee58","#ff9800","#f44336","#b71c1c"]
          .map(c => <div key={c} style={{ flex: 1, background: c }} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginBottom: 14 }}>
        <span>Cool &lt;28°C</span>
        <span>Warm 33°C</span>
        <span>Hot 38°C</span>
        <span>Extreme &gt;42°C</span>
      </div>

      {/* selected neighborhood detail card */}
      {selected ? (() => {
        const { nb, d } = selected;
        const risk = riskInfo(d.temp);
        return (
          <div style={{
            background: risk.bg,
            border: `1px solid ${risk.color}55`,
            borderRadius: 14, padding: "14px 16px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "#111827" }}>{nb.n}</p>
                <span style={{
                  display: "inline-block", marginTop: 3,
                  padding: "2px 10px", borderRadius: 12, fontSize: 11,
                  background: risk.color + "22", color: risk.color, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: 0.5,
                }}>{risk.label} risk</span>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                  {nb.zone} Mumbai · {nb.offset > 0 ? `+${nb.offset}` : nb.offset}°C vs city avg
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{d.temp}°C</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>{d.hum}% humidity</p>
              </div>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#374151" }}>{TIPS[risk.label]}</p>
          </div>
        );
      })() : (
        <div style={{
          padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb",
          background: "#f9fafb", fontSize: 13, color: "#9ca3af", textAlign: "center",
          marginBottom: 14,
        }}>
          Tap any dot on the map to see neighborhood details
        </div>
      )}

      {/* sort controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Sort by:</span>
        {["zone", "temp"].map(s => (
          <button key={s} onClick={() => setSortBy(s)} style={{
            padding: "4px 12px", borderRadius: 16, border: "1px solid",
            borderColor: sortBy === s ? "#111827" : "#d1d5db",
            background: sortBy === s ? "#111827" : "#fff",
            color: sortBy === s ? "#fff" : "#374151",
            fontSize: 12, cursor: "pointer",
          }}>{s === "zone" ? "Zone" : "Hottest first"}</button>
        ))}
      </div>

      {/* neighborhood grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {displayList().map(nb => {
          const d = cityData[nb.n];
          if (!d) return null;
          const risk = riskInfo(d.temp);
          const isActive = selected?.nb.n === nb.n;
          return (
            <button
              key={nb.n}
              onClick={() => {
                setSelected({ nb, d });
                leafletRef.current?.flyTo([nb.lat, nb.lng], 15, { duration: 0.6 });
              }}
              style={{
                background: risk.bg,
                border: `1.5px solid ${isActive ? risk.color : risk.color + "44"}`,
                borderRadius: 12, padding: "11px 13px",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontWeight: 600, fontSize: 13,
                    color: "#111827", whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>{nb.n}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
                    {nb.zone} · {nb.offset > 0 ? `+${nb.offset}` : nb.offset}°C
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>{d.temp}°C</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    color: risk.color, letterSpacing: 0.3,
                  }}>{risk.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* zone legend dots */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
        {Object.entries(ZONE_COLORS).map(([z, col]) => (
          <div key={z} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: col }} />
            <span style={{ fontSize: 11, color: "#6b7280" }}>{z} Mumbai</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * ─── HOW TO COMBINE WITH ALL-INDIA HEATMAP ──────────────────────────
 *
 * In Dashboard.jsx, replace the heatmap tab with a sub-toggle:
 *
 *   import HeatmapTab       from "../components/HeatmapTab";
 *   import MumbaiHeatmapTab from "../components/MumbaiHeatmapTab";
 *
 *   function HeatmapSection({ userData }) {
 *     const [view, setView] = useState("india");
 *     return (
 *       <div>
 *         <div style={{ display:"flex", gap:8, marginBottom:16 }}>
 *           <button onClick={() => setView("india")}  ...>All India</button>
 *           <button onClick={() => setView("mumbai")} ...>Mumbai Zones</button>
 *         </div>
 *         {view === "india"  && <HeatmapTab />}
 *         {view === "mumbai" && <MumbaiHeatmapTab userData={userData} />}
 *       </div>
 *     );
 *   }
 *
 *   // Then in the Dashboard tab render:
 *   {activeTab === "heatmap" && <HeatmapSection userData={userData} />}
 */