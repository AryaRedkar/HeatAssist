import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

const NAV_TABS = [
  { to: "/app",        label: "Risk Score",  icon: "🌡️", end: true  },
  { to: "/app/heatmap", label: "Heat Map",   icon: "🗺️", end: false },
  { to: "/app/pet",     label: "Pet & Plant", icon: "🐾", end: false },
  { to: "/app/chat",    label: "Chat",        icon: "💬", end: false },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Get user initials for avatar
  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/app-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative"
    }}>
      {/* Light Glass Overlay over the whole background so dark text is readable */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255, 255, 255, 0.35)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 0,
        pointerEvents: "none"
      }} />

      {/* ── Top Navbar ── */}
      <nav style={{
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          padding: "0 2.5rem",
          height: 68,
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", marginRight: "3rem",
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
            }}>🌤️</div>
            <span style={{
              fontWeight: 800, fontSize: "1.15rem", color: "#0ea5e9",
              letterSpacing: "-0.01em", fontFamily: "'Orbitron', sans-serif"
            }}>HeatAssist</span>
          </div>

          {/* Nav Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
            {NAV_TABS.map(tab => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#bd4a00" : "#334155",
                  background: isActive ? "rgba(255, 255, 255, 0.65)" : "transparent",
                  boxShadow: isActive ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                })}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                {tab.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Profile + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "1rem" }}>
            {/* User email */}
            <span style={{
              fontSize: 13, color: "#64748b",
              fontWeight: 500,
              maxWidth: 160, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.email}
            </span>

            {/* Profile icon */}
            <button
              onClick={() => navigate("/app/profile")}
              title="Edit Profile"
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "2px solid #e0f2fe",
                background: profile ? "linear-gradient(135deg, #0ea5e9, #38bdf8)" : "#f1f5f9",
                color: profile ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                fontSize: 15, fontWeight: 700,
                transition: "all 0.2s",
                position: "relative",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#0ea5e9";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e0f2fe";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {initials}
              {/* Green dot if profile complete */}
              {profile && (
                <span style={{
                  position: "absolute", bottom: -2, right: -2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: "#22c55e",
                  border: "2px solid #fff",
                }} />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              style={{
                padding: "8px 16px", borderRadius: 10,
                border: "1px solid #bae6fd", background: "#fff",
                cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0284c7",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#e0f2fe";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main style={{ maxWidth: 850, margin: "0 auto", padding: "2rem 1.5rem", position: "relative", zIndex: 1 }}>
        <Outlet />
      </main>

      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@700;800;900&display=swap');
      `}</style>
    </div>
  );
}
