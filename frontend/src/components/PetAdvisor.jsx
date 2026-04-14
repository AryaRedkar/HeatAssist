export default function PetAdvisor({ advice, pet, roadTemp }) {
  return (
    <div style={{ 
      background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: "1.5px solid rgba(245, 158, 11, 0.5)", borderRadius: 20, padding: "20px 24px", marginBottom: 20,
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{pet === "dog" ? "🐶" : pet === "cat" ? "🐱" : "🐦"}</span> {pet?.charAt(0).toUpperCase() + pet?.slice(1)} Advisor
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", lineHeight: 1.5 }}>{advice}</p>
      {roadTemp && (
        <p style={{ fontSize: 14, fontWeight: 600, color: "#9a3412", marginTop: 12, display: "flex", alignItems: "center", gap: 6, background: "rgba(254, 243, 199, 0.6)", padding: "8px 12px", borderRadius: 8 }}>
          🌡️ Road surface: <strong style={{ color: "#c2410c" }}>{roadTemp}°C</strong>
          {roadTemp > 50 ? " — dangerously hot for paws" : ""}
        </p>
      )}
    </div>
  );
}
