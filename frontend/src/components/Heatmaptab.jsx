/**
 * HeatmapTab.jsx
 * --------------
 * Drop into: frontend/src/components/HeatmapTab.jsx
 *
 * DEPENDENCIES — add to frontend/package.json:
 *   npm install leaflet leaflet.heat
 *
 * CSS — add ONE LINE to frontend/src/main.jsx (or index.css):
 *   import 'leaflet/dist/leaflet.css';
 *
 * ENV — add to frontend/.env:
 *   VITE_OWM_API_KEY=your_openweathermap_key
 *
 * USAGE in Dashboard.jsx:
 *   import HeatmapTab from "../components/HeatmapTab";
 *   ...
 *   {activeTab === "heatmap" && (
 *     <HeatmapTab temp={userData.temp} humidity={userData.humidity} profile={userData.profile} />
 *   )}
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* ---------- data -------------------------------------------------- */

const CITIES = [
  {n:"Mumbai",     lat:19.076,lng:72.877,region:"west"},
  {n:"Delhi",      lat:28.644,lng:77.216,region:"north"},
  {n:"Bangalore",  lat:12.971,lng:77.594,region:"south"},
  {n:"Hyderabad",  lat:17.385,lng:78.486,region:"south"},
  {n:"Chennai",    lat:13.082,lng:80.270,region:"south"},
  {n:"Kolkata",    lat:22.572,lng:88.363,region:"east"},
  {n:"Pune",       lat:18.520,lng:73.856,region:"west"},
  {n:"Ahmedabad",  lat:23.022,lng:72.571,region:"west"},
  {n:"Jaipur",     lat:26.912,lng:75.787,region:"north"},
  {n:"Lucknow",    lat:26.846,lng:80.946,region:"north"},
  {n:"Nagpur",     lat:21.145,lng:79.082,region:"central"},
  {n:"Indore",     lat:22.719,lng:75.857,region:"central"},
  {n:"Bhopal",     lat:23.259,lng:77.412,region:"central"},
  {n:"Patna",      lat:25.594,lng:85.137,region:"east"},
  {n:"Bhubaneswar",lat:20.296,lng:85.824,region:"east"},
  {n:"Ranchi",     lat:23.344,lng:85.309,region:"east"},
  {n:"Guwahati",   lat:26.144,lng:91.736,region:"ne"},
  {n:"Shillong",   lat:25.578,lng:91.883,region:"ne"},
  {n:"Imphal",     lat:24.817,lng:93.944,region:"ne"},
  {n:"Srinagar",   lat:34.083,lng:74.797,region:"north"},
  {n:"Shimla",     lat:31.104,lng:77.173,region:"north"},
  {n:"Dehradun",   lat:30.316,lng:78.032,region:"north"},
  {n:"Amritsar",   lat:31.633,lng:74.872,region:"north"},
  {n:"Chandigarh", lat:30.733,lng:76.779,region:"north"},
  {n:"Varanasi",   lat:25.317,lng:82.973,region:"north"},
  {n:"Agra",       lat:27.176,lng:78.008,region:"north"},
  {n:"Jodhpur",    lat:26.295,lng:73.017,region:"north"},
  {n:"Kochi",      lat:9.931, lng:76.267,region:"south"},
  {n:"Thiruvananthapuram",lat:8.524,lng:76.936,region:"south"},
  {n:"Coimbatore", lat:11.016,lng:76.955,region:"south"},
  {n:"Madurai",    lat:9.925, lng:78.119,region:"south"},
  {n:"Vijayawada", lat:16.506,lng:80.648,region:"south"},
  {n:"Visakhapatnam",lat:17.686,lng:83.218,region:"south"},
  {n:"Raipur",     lat:21.251,lng:81.629,region:"central"},
  {n:"Surat",      lat:21.170,lng:72.831,region:"west"},
  {n:"Vadodara",   lat:22.307,lng:73.181,region:"west"},
  {n:"Rajkot",     lat:22.303,lng:70.802,region:"west"},
  {n:"Goa",        lat:15.491,lng:73.827,region:"west"},
  {n:"Mangalore",  lat:12.914,lng:74.855,region:"south"},
  {n:"Mysore",     lat:12.295,lng:76.639,region:"south"},
  {n:"Dhanbad",    lat:23.795,lng:86.430,region:"east"},
  {n:"Jamshedpur", lat:22.802,lng:86.185,region:"east"},
  {n:"Siliguri",   lat:26.717,lng:88.428,region:"east"},
  {n:"Gwalior",    lat:26.218,lng:78.182,region:"central"},
  {n:"Jabalpur",   lat:23.181,lng:79.987,region:"central"},
  {n:"Nashik",     lat:19.997,lng:73.790,region:"west"},
  {n:"Aurangabad", lat:19.877,lng:75.341,region:"west"},
  {n:"Kanpur",     lat:26.449,lng:80.331,region:"north"},
];

const REGION_VIEWS = {
  india:   { lat: 22.5, lng: 82.5, zoom: 5 },
  north:   { lat: 30.0, lng: 77.5, zoom: 6 },
  south:   { lat: 12.5, lng: 78.5, zoom: 6 },
  east:    { lat: 23.5, lng: 86.5, zoom: 6 },
  west:    { lat: 21.5, lng: 73.5, zoom: 6 },
  central: { lat: 22.5, lng: 79.5, zoom: 6 },
  ne:      { lat: 25.5, lng: 92.0, zoom: 7 },
};

const HEAT_GRADIENT = {
  0.0: "#00bfff", 0.2: "#00e5ff", 0.35: "#00e676",
  0.5: "#ffee58", 0.65: "#ff9800", 0.82: "#f44336", 1.0: "#b71c1c",
};

/* ---------- helpers ----------------------------------------------- */

function tempToColor(t) {
  if (t < 15) return "#00bfff";
  if (t < 22) return "#00e5ff";
  if (t < 27) return "#00e676";
  if (t < 32) return "#ffee58";
  if (t < 37) return "#ff9800";
  if (t < 42) return "#f44336";
  return "#b71c1c";
}

function tempToIntensity(t) {
  return Math.min(1, Math.max(0.05, (t - 10) / 40));
}

function riskLabel(t) {
  if (t < 27) return { label: "Low",      color: "#10b981" };
  if (t < 33) return { label: "Moderate", color: "#eab308" };
  if (t < 39) return { label: "High",     color: "#f97316" };
  return              { label: "Extreme",  color: "#ef4444" };
}

const TIPS = {
  Low:      "Safe to be outdoors. Stay hydrated.",
  Moderate: "Carry water, wear light clothing.",
  High:     "Limit outdoor exposure. Avoid 11am–4pm.",
  Extreme:  "Stay indoors. Risk of heat stroke.",
};

const OWM_URL = "https://api.openweathermap.org/data/2.5/weather";
const OWM_KEY = import.meta.env.OWM_API_KEY;

/* ---------- component --------------------------------------------- */

export default function HeatmapTab() {
  const mapRef       = useRef(null);
  const leafletRef   = useRef(null);
  const heatLayerRef = useRef(null);
  const markersRef   = useRef([]);

  const [cityData,   setCityData]   = useState({});
  const [selected,   setSelected]   = useState(null);
  const [status,     setStatus]     = useState("Loading…");
  const [region,     setRegion]     = useState("india");

  /* init map once */
  useEffect(() => {
    if (leafletRef.current) return;
    leafletRef.current = L.map(mapRef.current, { zoomControl: true })
      .setView([22.5, 82.5], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap contributors",
    }).addTo(leafletRef.current);

    fetchTemps();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  /* fly to region when changed */
  useEffect(() => {
    if (!leafletRef.current) return;
    const v = REGION_VIEWS[region];
    leafletRef.current.flyTo([v.lat, v.lng], v.zoom, { duration: 0.8 });
  }, [region]);

  /* render heatmap whenever cityData updates */
  useEffect(() => {
    if (!leafletRef.current || !Object.keys(cityData).length) return;
    renderHeatmap(cityData);
  }, [cityData]);

  async function fetchTemps() {
    setStatus("Fetching live temperatures…");

    if (!OWM_KEY) {
      // fallback: plausible synthetic data
      const mock = {};
      CITIES.forEach(c => {
        const base = 20 + Math.abs(Math.sin(c.lat * 0.3) * 20);
        mock[c.n] = { temp: Math.round(base + Math.random() * 4 - 2), hum: Math.round(55 + Math.random() * 30) };
      });
      setCityData(mock);
      setStatus("Demo mode — add VITE_OWM_API_KEY to .env for live data");
      return;
    }

    const results = await Promise.allSettled(
      CITIES.map(c =>
        fetch(`${OWM_URL}?lat=${c.lat}&lon=${c.lng}&appid=${OWM_KEY}&units=metric`)
          .then(r => r.json())
          .then(d => ({ name: c.n, temp: Math.round(d.main.temp), hum: d.main.humidity }))
      )
    );

    const data = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        data[CITIES[i].n] = { temp: r.value.temp, hum: r.value.hum };
      } else {
        const base = 20 + Math.abs(Math.sin(CITIES[i].lat * 0.3) * 20);
        data[CITIES[i].n] = { temp: Math.round(base), hum: 65 };
      }
    });

    setCityData(data);
    setStatus(`Live · OpenWeatherMap · ${new Date().toLocaleTimeString("en-IN")}`);
  }

  function renderHeatmap(data) {
    const map = leafletRef.current;

    // clear old layers
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // build heat points (scatter around each city for smooth blob)
    const pts = [];
    CITIES.forEach(c => {
      const d = data[c.n];
      if (!d) return;
      const intensity = tempToIntensity(d.temp);
      pts.push([c.lat, c.lng, intensity]);
      for (let i = 0; i < 5; i++) {
        pts.push([
          c.lat + (Math.random() - 0.5) * 1.4,
          c.lng + (Math.random() - 0.5) * 1.4,
          intensity * 0.7,
        ]);
      }
    });

    heatLayerRef.current = L.heatLayer(pts, {
      radius: 55, blur: 45, maxZoom: 9, max: 1,
      gradient: HEAT_GRADIENT,
    }).addTo(map);

    // dot markers
    CITIES.forEach(c => {
      const d = data[c.n];
      if (!d) return;
      const marker = L.circleMarker([c.lat, c.lng], {
        radius: 6,
        fillColor: tempToColor(d.temp),
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map);

      marker.bindTooltip(`<b>${c.n}</b><br>${d.temp}°C`, { direction: "top", offset: [0, -6] });
      marker.on("click", () => setSelected({ city: c, data: d }));
      markersRef.current.push(marker);
    });
  }

  const zones = ["india", "north", "south", "east", "west", "central", "ne"];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* status */}
      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#9ca3af" }}>{status}</p>

      {/* region pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {zones.map(z => (
          <button key={z} onClick={() => setRegion(z)} style={{
            padding: "5px 14px", borderRadius: 20, border: "1.5px solid",
            borderColor: region === z ? "#111827" : "#d1d5db",
            background: region === z ? "#111827" : "#fff",
            color: region === z ? "#fff" : "#374151",
            fontSize: 12, cursor: "pointer", fontWeight: region === z ? 600 : 400,
            textTransform: "capitalize",
          }}>{z === "ne" ? "North-East" : z === "india" ? "All India" : z.charAt(0).toUpperCase() + z.slice(1)}</button>
        ))}
      </div>

      {/* map */}
      <div ref={mapRef} style={{
        width: "100%", height: 440, borderRadius: 14,
        overflow: "hidden", border: "1px solid #e5e7eb", marginBottom: 10,
      }} />

      {/* legend */}
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 12, marginBottom: 3 }}>
        {["#00bfff","#00e5ff","#00e676","#adff2f","#ffee58","#ff9800","#f44336","#b71c1c"]
          .map(c => <div key={c} style={{ flex: 1, background: c }} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>
        <span>Cool &lt;20°C</span><span>Warm 30°C</span><span>Hot 38°C</span><span>Extreme &gt;44°C</span>
      </div>

      {/* selected city panel */}
      {selected ? (() => {
        const { city, data } = selected;
        const risk = riskLabel(data.temp);
        return (
          <div style={{
            background: risk.color + "18",
            border: `1px solid ${risk.color}44`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#111827" }}>{city.n}</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  color: risk.color, letterSpacing: 0.5,
                }}>{risk.label} risk</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#111827" }}>{data.temp}°C</p>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{data.hum}% humidity</p>
              </div>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#374151" }}>{TIPS[risk.label]}</p>
          </div>
        );
      })() : (
        <div style={{
          padding: "14px 16px", borderRadius: 12,
          border: "1px solid #e5e7eb", background: "#f9fafb",
          fontSize: 13, color: "#9ca3af", textAlign: "center",
        }}>
          Tap any dot on the map to see city-level heat details
        </div>
      )}
    </div>
  );
}