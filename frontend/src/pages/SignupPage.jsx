import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/app/profile");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pw) => {
    if (pw.length === 0) return { score: 0, color: "transparent" };
    if (pw.length < 6) return { score: 1, color: "#ef4444" };
    if (pw.length < 8) return { score: 2, color: "#f59e0b" };
    return { score: 3, color: "#10b981" };
  };
  const strength = getStrength(password);

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
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
        top: "-10%", left: "-10%", filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
        bottom: "-10%", right: "-5%", filter: "blur(60px)", pointerEvents: "none",
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

        {/* Signup Card */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(14, 165, 233, 0.2)",
          borderRadius: 24,
          padding: "3rem 2.5rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
        }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#0f172a" }}>Create Account</h2>
          <p style={{ color: "#64748b", margin: "0 0 2rem", fontSize: "0.95rem" }}>Join HeatAssist to get personalized alerts.</p>

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

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
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
                placeholder="Minimum 6 characters"
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
              
              {/* Password strength indicator */}
              <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                {[1, 2, 3].map(level => (
                  <div key={level} style={{
                    height: "4px", flex: 1, borderRadius: "2px",
                    background: strength.score >= level ? strength.color : "#e2e8f0",
                    transition: "all 0.3s"
                  }} />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: 12,
                fontSize: "1rem",
                fontWeight: 600,
                cursor: loading || password.length < 6 ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
                boxShadow: loading || password.length < 6 ? "none" : "0 8px 20px rgba(14, 165, 233, 0.3)",
                transition: "all 0.2s",
                opacity: password.length > 0 && password.length < 6 ? 0.6 : 1,
              }}
              onMouseEnter={e => { if(!loading && password.length >= 6) e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { if(!loading && password.length >= 6) e.currentTarget.style.transform = "translateY(0)" }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 600 }}>
              Log in
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