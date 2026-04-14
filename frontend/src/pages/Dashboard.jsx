import { useState } from "react";
import HeatmapTab       from "../components/HeatmapTab";
import MumbaiHeatmapTab from "../components/MumbaiHeatmapTab";
import RiskCard         from "../components/RiskCard";
import PetAdvisor       from "../components/PetAdvisor";
import PlantAdvisor     from "../components/PlantAdvisor";
import HeatClock        from "../components/HeatClock";

const RISK_COLOR = {
  low:      { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  moderate: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  high:     { bg: "#ffedd5", text: "#9a3412", dot: "#f97316" },
  extreme:  { bg: "#fee2e2", text: "#7f1d1d", dot: "#ef4444" },
};

/* ── Combined heatmap section with India / Mumbai sub-toggle ── */
function HeatmapSection({ userData }) {
  const [view, setView] = useState("india");

  return (
    <div>
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
        background: "#f3f4f6", borderRadius: 12, padding: 4,
      }}>
        {[
          { id: "india",  label: "🗺️ All India" },
          { id: "mumbai", label: "🏙️ Mumbai Zones" },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 10,
              border: "none", cursor: "pointer", fontSize: 13,
              fontWeight: view === v.id ? 700 : 400,
              background: view === v.id ? "#fff" : "transparent",
              color: view === v.id ? "#111827" : "#6b7280",
              boxShadow: view === v.id ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              transition: "all 0.15s",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "india"  && <HeatmapTab />}
      {view === "mumbai" && <MumbaiHeatmapTab userData={userData} />}
    </div>
  );
}

/* ── Tab 1: Risk Score — uses RiskCard + HeatClock from old Dashboard ── */
function RiskTab({ riskData, userData, onChat }) {
  const {
    score, risk, suggestion,
    pet_advice, plant_advice,
    safe_windows, road_temp,
  } = riskData;

  return (
    <div>
      {/* RiskCard component (from old Dashboard) */}
      <RiskCard score={score} risk={risk} suggestion={suggestion} />

      {/* HeatClock / safe windows (from old Dashboard) */}
      <HeatClock windows={safe_windows} />

      {/* Pet & Plant advice inline when available (from old Dashboard) */}
      {pet_advice   && <PetAdvisor  advice={pet_advice}   pet={userData.pet} roadTemp={road_temp} />}
      {plant_advice && <PlantAdvisor advice={plant_advice} />}

      {/* Chat CTA button (from old Dashboard) */}
      <button
        onClick={onChat}
        style={{
          width: "100%", marginTop: 24, padding: "14px",
          borderRadius: 12, border: "none", background: "#1f2937",
          color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer",
        }}
      >
        Ask the Heat Assistant 💬
      </button>
    </div>
  );
}

/* ── Tab 3: Pet & Plant full tab (for dedicated tab view) ── */
function PetPlantTab({ riskData, userData }) {
  const { score, risk, pet_advice, plant_advice, road_temp } = riskData;
  const rc = RISK_COLOR[risk];

  if (!pet_advice && !plant_advice) {
    return (
      <ComingSoon
        label="No pet or plant data"
        icon="🐾"
        subtitle="Go back and select a pet or plant type to see advice here."
      />
    );
  }

  return (
    <div>
      {/* Road temp warning card */}
      {road_temp !== undefined && (
        <div style={{
          background: rc.bg, border: `1px solid ${rc.dot}33`,
          borderRadius: 14, padding: "12px 16px", marginBottom: 16,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: rc.text, textTransform: "uppercase", fontWeight: 600 }}>
            Pavement temperature
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 800, color: rc.text }}>
            {road_temp}°C
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: rc.text }}>
            {road_temp > 50
              ? "Dangerously hot — can burn paws in seconds."
              : road_temp > 40
              ? "Too hot for bare paws — check before walking."
              : "Warm but manageable with short walks."}
          </p>
        </div>
      )}

      {pet_advice   && <PetAdvisor  advice={pet_advice}   pet={userData.pet} roadTemp={road_temp} />}
      {plant_advice && <PlantAdvisor advice={plant_advice} />}
    </div>
  );
}

/* ── Coming Soon placeholder ── */
function ComingSoon({ label, icon, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#374151" }}>{label}</p>
      <p style={{ fontSize: 14, marginTop: 8 }}>{subtitle ?? "Coming soon"}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   Props:
     userData  — { city, temp, humidity, feels_like, uvi,
                   wind_speed, aqi, pet, neighbourhood }
     riskData  — { score, risk, suggestion, pet_advice,
                   plant_advice, safe_windows, road_temp,
                   pet_score, factors_used }
     onChat    — () => void   (navigate to chat screen)
     onBack    — () => void   (navigate back to form)
════════════════════════════════════════════════════════════ */
export default function Dashboard({ userData, riskData, onChat, onBack }) {
  const [activeTab, setActiveTab] = useState("risk");

  const tabs = [
    { id: "risk",    label: "Risk Score", icon: "🌡️" },
    { id: "heatmap", label: "Heatmap",    icon: "🗺️" },
    { id: "pet",     label: "Pet & Plant",icon: "🐾" },
    { id: "chat",    label: "Chatbot",    icon: "💬" },
  ];

  if (!riskData) return null;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── sticky navbar ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "0.75rem 1rem 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6b7280", fontSize: 14, padding: 0,
            }}
          >
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {userData.city} — Heat Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              {userData.temp}°C · {userData.humidity}% humidity
              {userData.neighbourhood ? ` · ${userData.neighbourhood}` : ""}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: "8px 4px",
                border: "none", background: "none",
                cursor: "pointer", fontSize: 12,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? "#111827" : "#6b7280",
                borderBottom: activeTab === tab.id
                  ? "2px solid #111827"
                  : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ display: "block", fontSize: 16, marginBottom: 2 }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── tab content ── */}
      <div style={{ padding: "1.5rem 1rem" }}>
        {activeTab === "risk" && (
          <RiskTab riskData={riskData} userData={userData} onChat={onChat} />
        )}
        {activeTab === "heatmap" && (
          <HeatmapSection userData={userData} />
        )}
        {activeTab === "pet" && (
          <PetPlantTab riskData={riskData} userData={userData} />
        )}
        {activeTab === "chat" && (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>
              Heat Assistant
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>
              Ask anything about heat safety, safe times to go out, and more.
            </p>
            <button
              onClick={onChat}
              style={{
                padding: "14px 32px", borderRadius: 12,
                border: "none", background: "#1f2937",
                color: "white", fontSize: 16,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Open Chat 💬
            </button>
          </div>
        )}
      </div>
    </div>
  );
}