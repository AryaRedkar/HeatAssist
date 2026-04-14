import { useAutoRisk } from "../hooks/useAutoRisk";
import { useNavigate } from "react-router-dom";
import RiskCard from "../components/RiskCard";
import HeatClock from "../components/HeatClock";
import PetAdvisor from "../components/PetAdvisor";
import PlantAdvisor from "../components/PlantAdvisor";

export default function RiskScorePage() {
  const navigate = useNavigate();
  const { userData, riskData, loading, error, refetch, isProfileComplete } = useAutoRisk();

  /* ── No profile yet ── */
  if (!isProfileComplete && !loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(24px)", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid rgba(255, 255, 255, 0.6)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, background: "rgba(255, 255, 255, 0.7)", border: "2px solid rgba(255, 255, 255, 0.8)", borderRadius: 24, fontSize: 36, marginBottom: 20, boxShadow: "0 10px 25px rgba(14,165,233,0.15)" }}>📋</div>
        <h2 style={{ fontSize: 24, fontFamily: "'Orbitron', sans-serif", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
          Complete Your Profile
        </h2>
        <p style={{ fontSize: 15, color: "#64748b", marginBottom: 30, maxWidth: 420, margin: "0 auto 30px", lineHeight: 1.6 }}>
          We need your location and health info to calculate a highly personalized heat risk score for you.
        </p>
        <button
          onClick={() => navigate("/app/profile")}
          style={{
            padding: "14px 32px", borderRadius: 14,
            border: "none", background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 8px 20px rgba(14,165,233,0.3)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          Set Up Profile →
        </button>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid #f3f4f6",
          borderTopColor: "#ef4444",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Calculating your heat risk...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>
          Could not fetch risk data
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
          {error}
        </p>
        <button onClick={refetch} style={{
          padding: "10px 24px", borderRadius: 10, border: "1px solid #e5e7eb",
          background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151",
        }}>
          Try Again
        </button>
      </div>
    );
  }

  if (!riskData || !userData) return null;

  const { score, risk, suggestion, pet_advice, plant_advice, safe_windows, road_temp } = riskData;

  return (
    <div>
      {/* Weather summary bar */}
      <div style={{
        background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: 20, padding: "16px 24px",
        marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 20,
        alignItems: "center", border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)"
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>LOCATION</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            📍 {userData.city}{userData.neighbourhood ? ` · ${userData.neighbourhood}` : ""}
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: "rgba(14, 165, 233, 0.15)", margin: "0 4px" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>TEMPERATURE</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>🌡️ {userData.temp}°C</div>
        </div>
        <div style={{ width: 1, height: 32, background: "rgba(14, 165, 233, 0.15)", margin: "0 4px" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>HUMIDITY</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0ea5e9" }}>💧 {userData.humidity}%</div>
        </div>
        <div style={{ width: 1, height: 32, background: "rgba(14, 165, 233, 0.15)", margin: "0 4px" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>FEELS LIKE</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#f97316" }}>🔥 {userData.feels_like}°C</div>
        </div>
        <button onClick={refetch} style={{
          marginLeft: "auto", padding: "8px 16px", borderRadius: 12,
          border: "1px solid #bae6fd", background: "#f0f9ff",
          fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#0284c7",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.borderColor = "#7dd3fc"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#f0f9ff"; e.currentTarget.style.borderColor = "#bae6fd"; }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Risk Card */}
      <RiskCard score={score} risk={risk} suggestion={suggestion} />

      {/* Heat Clock */}
      {safe_windows && <HeatClock windows={safe_windows} />}

      {/* Pet & Plant inline */}
      {pet_advice && <PetAdvisor advice={pet_advice} pet={userData.pet} roadTemp={road_temp} />}
      {plant_advice && <PlantAdvisor advice={plant_advice} />}

      {/* Chat CTA */}
      <button
        onClick={() => navigate("/app/chat")}
        style={{
          width: "100%", marginTop: 28, padding: "16px",
          borderRadius: 16, border: "none", 
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 10px 25px rgba(15,23,42,0.2)", transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        <span style={{ fontSize: 20 }}>💬</span> Ask HeatAssistant AI
      </button>
    </div>
  );
}
