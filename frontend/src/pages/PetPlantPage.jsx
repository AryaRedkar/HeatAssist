import { useNavigate } from "react-router-dom";
import { useAutoRisk } from "../hooks/useAutoRisk";
import PetAdvisor from "../components/PetAdvisor";
import PlantAdvisor from "../components/PlantAdvisor";

const RISK_COLOR = {
  low:      { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  moderate: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  high:     { bg: "#ffedd5", text: "#9a3412", dot: "#f97316" },
  extreme:  { bg: "#fee2e2", text: "#7f1d1d", dot: "#ef4444" },
};

export default function PetPlantPage() {
  const navigate = useNavigate();
  const { userData, riskData, loading, error, isProfileComplete } = useAutoRisk();

  /* ── No profile ── */
  if (!isProfileComplete && !loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
          Complete Your Profile First
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
          Add your pet and plant info in your profile to get tailored advice.
        </p>
        <button onClick={() => navigate("/app/profile")} style={{
          padding: "12px 28px", borderRadius: 12,
          border: "none", background: "#ef4444",
          color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
        }}>
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
          border: "3px solid #f3f4f6", borderTopColor: "#10b981",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading pet & plant advice...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#991b1b" }}>{error}</p>
      </div>
    );
  }

  if (!riskData || !userData) return null;

  const { risk, pet_advice, plant_advice, road_temp } = riskData;
  const rc = RISK_COLOR[risk] || RISK_COLOR.low;

  if (!pet_advice && !plant_advice) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🐾</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#374151", margin: "0 0 8px" }}>
          No Pet or Plant Data
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
          Go to your profile and select a pet or plant type to receive tailored heat advice.
        </p>
        <button onClick={() => navigate("/app/profile")} style={{
          padding: "10px 24px", borderRadius: 10,
          border: "1px solid #e5e7eb", background: "#fff",
          fontSize: 14, cursor: "pointer", color: "#374151",
        }}>
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: "center", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1px solid #bae6fd", borderRadius: 20, fontSize: 24, marginBottom: 12, boxShadow: "0 8px 20px rgba(14,165,233,0.15)" }}>🐾</div>
        <h2 style={{ fontSize: 26, fontFamily: "'Orbitron', sans-serif", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
          Pet & Plant Advisor
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Heat safety advice specifically for your animals and plants
        </p>
      </div>

      {/* Road temp card */}
      {road_temp !== undefined && (
        <div style={{
          background: rc.bg, border: `1px solid ${rc.dot}33`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 16,
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

      {pet_advice && <PetAdvisor advice={pet_advice} pet={userData.pet} roadTemp={road_temp} />}
      {plant_advice && <PlantAdvisor advice={plant_advice} />}
    </div>
  );
}
