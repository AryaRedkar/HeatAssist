import { useEffect, useRef } from "react";

const COLORS = { low: "#22c55e", moderate: "#eab308", high: "#f97316", extreme: "#ef4444" };

export default function HeatClock({ windows }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const W = 260, CX = 130, CY = 130, R = 110, IR = 55;
    ctx.clearRect(0, 0, W, W);

    windows.forEach(({ hour, risk }) => {
      const a1 = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((hour + 1) / 24) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, a1, a2);
      ctx.closePath();
      ctx.fillStyle = COLORS[risk];
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.beginPath();
    ctx.arc(CX, CY, IR, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Current time needle
    const now  = new Date();
    const curH = now.getHours() + now.getMinutes() / 60;
    const na   = (curH / 24) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(CX + (IR + 4) * Math.cos(na), CY + (IR + 4) * Math.sin(na));
    ctx.lineTo(CX + (R - 6) * Math.cos(na), CY + (R - 6) * Math.sin(na));
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Hour labels
    [0, 6, 12, 18].forEach(h => {
      const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
      const lx = CX + (R + 14) * Math.cos(a);
      const ly = CY + (R + 15) * Math.sin(a);
      ctx.font = "bold 12px 'Inter', sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = h === 0 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`;
      ctx.fillText(label, lx, ly);
    });
  }, [windows]);

  // Group safe hours into realistic waking daytime blocks (5 AM to 10 PM)
  const safeHours = (windows || [])
    .filter(w => w.risk === "low" && w.hour >= 5 && w.hour <= 22)
    .map(w => w.hour);
    
  let blocks = [];
  if (safeHours.length > 0) {
    let start = safeHours[0];
    let prev = safeHours[0];
    for (let i = 1; i < safeHours.length; i++) {
      if (safeHours[i] === prev + 1) {
        prev = safeHours[i];
      } else {
        blocks.push([start, prev]);
        start = safeHours[i];
        prev = safeHours[i];
      }
    }
    blocks.push([start, prev]);
  }

  const formatHour = (h) => {
    const isNextDay = h >= 24;
    const hour = h % 24;
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const formatBlock = ([start, end]) => {
    return `${formatHour(start)} - ${formatHour(end + 1)}`;
  };

  return (
    <div style={{ 
      textAlign: "center", margin: "24px 0",
      background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.8)", borderRadius: 24, padding: "24px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>24-Hour Heat Danger Clock</div>
      <canvas ref={ref} width={260} height={260} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.4)", boxShadow: "inset 0 4px 10px rgba(0,0,0,0.05)" }} />
      
      {/* Safe Windows Display */}
      <div style={{ marginTop: 24, padding: "16px", background: "rgba(255, 255, 255, 0.5)", borderRadius: 16, border: "1.5px solid rgba(34, 197, 94, 0.3)" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          ✓ Safest Times To Go Out
        </div>
        {blocks.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {blocks.map((b, i) => (
              <span key={i} style={{ background: "rgba(255, 255, 255, 0.8)", padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#15803d", boxShadow: "0 2px 4px rgba(0,0,0,0.03)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                {formatBlock(b)}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b" }}>No highly safe windows today. Avoid prolonged outdoor activity.</div>
        )}
      </div>
    </div>
  );
}
