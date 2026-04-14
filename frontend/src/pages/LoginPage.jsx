import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app");
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#f0f9ff",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative Orbs */}
      <div style={{
        position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
        top: "-10%", left: "-5%", filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
        bottom: "-10%", right: "-10%", filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        zIndex: 10,
      }}>
        {/* Simple Top Nav */}
        <div 
          onClick={() => navigate("/")}
          style={{ position: "absolute", top: "2rem", left: "2.5rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #f97316, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
          }}>🌤️</div>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0ea5e9" }}>HeatAssist</span>
        </div>

        {/* Login Card */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(14, 165, 233, 0.2)",
          borderRadius: 24,
          padding: "3rem 2.5rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
        }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#0f172a" }}>Welcome back</h2>
          <p style={{ color: "#64748b", margin: "0 0 2rem", fontSize: "0.95rem" }}>Log in to access your heat dashboard.</p>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "1rem",
              borderRadius: 12,
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12, color: "#0f172a",
                  fontSize: "0.95rem", outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#0ea5e9"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12, color: "#0f172a",
                  fontSize: "0.95rem", outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#0ea5e9"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: 12,
                fontSize: "1rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
                boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = "translateY(0)" }}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@800&display=swap');
      `}</style>
    </div>
  );
}