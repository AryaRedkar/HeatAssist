export default function PlantAdvisor({ advice }) {
  return (
    <div style={{ 
      background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: "1.5px solid rgba(74, 222, 128, 0.5)", borderRadius: 20, padding: "20px 24px", marginBottom: 20,
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>🌿</span> Plant Advisor
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", lineHeight: 1.5 }}>{advice}</p>
    </div>
  );
}
