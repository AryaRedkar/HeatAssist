const COLORS = { low: "#22c55e", moderate: "#eab308", high: "#f97316", extreme: "#ef4444" };
const EMOJI  = { low: "🟢", moderate: "🟡", high: "🟠", extreme: "🔴" };

export default function RiskCard({ score, risk, suggestion }) {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.7)", 
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: `2px solid ${COLORS[risk]}66`,
      boxShadow: `0 8px 32px ${COLORS[risk]}33`,
      borderRadius: 24, padding: "24px 28px", marginBottom: 24
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Your heat score</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: COLORS[risk], textShadow: "0 2px 10px rgba(255,255,255,0.8)" }}>{score}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 32, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}>{EMOJI[risk]}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS[risk], textTransform: "uppercase", letterSpacing: "0.05em" }}>{risk}</div>
        </div>
      </div>
      <p style={{ marginTop: 16, color: "#0f172a", fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>{suggestion}</p>
    </div>
  );
}
