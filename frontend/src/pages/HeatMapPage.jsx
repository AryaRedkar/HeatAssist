import { useState } from "react";
import HeatmapTab from "../components/HeatmapTab";
import MumbaiHeatmapTab from "../components/MumbaiHeatmapTab";
import { useProfile } from "../context/ProfileContext";

export default function HeatMapPage() {
  const [view, setView] = useState("india");
  const { profile } = useProfile();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1px solid #bae6fd", borderRadius: 20, fontSize: 24, marginBottom: 12, boxShadow: "0 8px 20px rgba(14,165,233,0.15)" }}>🗺️</div>
        <h2 style={{ fontSize: 26, fontFamily: "'Orbitron', sans-serif", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
          Live Heat Map
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Satellite-grade thermal overlays across Indian cities
        </p>
      </div>

      {/* View Toggle */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px",
        background: "#fff", borderRadius: 16, padding: 6,
        boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #e0f2fe",
      }}>
        {[
          { id: "india",  label: "🗺️ All India" },
          { id: "mumbai", label: "🏙️ Mumbai Zones" },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 12,
              border: "none", cursor: "pointer", fontSize: 14,
              fontWeight: view === v.id ? 700 : 500,
              background: view === v.id ? "linear-gradient(135deg, #0ea5e9, #38bdf8)" : "transparent",
              color: view === v.id ? "#fff" : "#64748b",
              boxShadow: view === v.id ? "0 4px 12px rgba(14,165,233,0.3)" : "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Map Content */}
      {view === "india" && <HeatmapTab />}
      {view === "mumbai" && <MumbaiHeatmapTab userData={profile} />}
    </div>
  );
}
