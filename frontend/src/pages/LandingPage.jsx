import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "risk",    label: "Risk Score",  icon: "🌡️",  path: "/app" },
  { id: "heatmap", label: "Heat Map",    icon: "🗺️", path: "/app/heatmap" },
  { id: "pet",     label: "Pet & Plant", icon: "🐾", path: "/app/pet" },
  { id: "chat",    label: "Chat",        icon: "💬", path: "/app/chat" },
];

const FEATURES = [
  {
    icon: "🌤️",
    title: "Personalized Risk Score",
    desc: "Bio-metric heat risk scoring tailored to your age, health profile, and activity level. Real-time updates as conditions change throughout the day.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  },
  {
    icon: "🗺️",
    title: "Live Heat Map",
    desc: "Satellite-grade thermal overlays across Indian cities. Track urban heat islands, cool corridors, and dangerous micro-zones in real time.",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  },
  {
    icon: "🌿",
    title: "Pet & Plant Advisor",
    desc: "Species-specific thermal advisories for your animals and plants. Know exactly when to shelter, water, or move them indoors.",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
  },
  {
    icon: "💬",
    title: "AI Heat Assistant",
    desc: "Ask anything about heat safety, climate adaptation, or local risk. Our AI answers in real-time with location-aware, personalized context.",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  },
];

const STATS = [
  { value: "48.7°C", label: "Highest recorded in India", icon: "🌡️" },
  { value: "300+", label: "Cities monitored", icon: "🏙️" },
  { value: "24/7", label: "Real-time tracking", icon: "⏱️" },
  { value: "1M+", label: "Lives protected", icon: "🛡️" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Enter Your Profile", desc: "Age, health conditions, activity & location", icon: "📋" },
  { step: "02", title: "Get Risk Analysis", desc: "AI-powered personalized heat risk scoring", icon: "🧠" },
  { step: "03", title: "View Heat Map", desc: "See thermal hotspots across your city", icon: "🗺️" },
  { step: "04", title: "Stay Protected", desc: "Real-time alerts & safe outdoor windows", icon: "✅" },
];

/* ─── Floating Particles Component ──────────────────────────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.id % 3 === 0 ? "#f97316" : p.id % 3 === 1 ? "#0ea5e9" : "#facc15",
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Navbar ────────────────────────────────────────────────────────────────── */
function Navbar({ user, logout }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (item) => {
    if (user) {
      navigate(item.path);
    } else {
      navigate("/login");
    }
  };

  return (
    <nav
      id="landing-navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        height: "68px",
        background: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(14, 165, 233, 0.15)" : "none",
        boxShadow: scrolled ? "0 4px 20px rgba(14, 165, 233, 0.05)" : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.7rem", cursor: "pointer", marginRight: "3rem" }}
          onClick={() => navigate("/")}
        >
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #f97316, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
          }}>🌤️</div>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 800,
            fontSize: "1.15rem",
            color: "#0ea5e9",
            letterSpacing: "-0.01em",
          }}>HeatAssist</span>
        </div>

        {/* Nav Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              style={{
                background: "transparent",
                border: "none",
                color: scrolled ? "#64748b" : "#475569",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                padding: "10px 16px",
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#0284c7";
                e.currentTarget.style.background = "#e0f2fe";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = scrolled ? "#64748b" : "#475569";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginLeft: "1rem" }}>
          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid #bae6fd",
                  color: "#0284c7",
                  padding: "8px 20px",
                  borderRadius: 12,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#e0f2fe";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)";
                }}
              >Login</button>
              <button
                onClick={() => navigate("/signup")}
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                  border: "none",
                  color: "#fff",
                  padding: "9px 24px",
                  borderRadius: 12,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(14, 165, 233, 0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(14, 165, 233, 0.45)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >Sign Up</button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#64748b",
              }}>{user.email}</span>
              <button
                onClick={() => navigate("/app")}
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                  border: "none",
                  color: "#fff",
                  padding: "9px 20px",
                  borderRadius: 12,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(14, 165, 233, 0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(14, 165, 233, 0.45)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >Dashboard →</button>
              <button
                onClick={logout}
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid #bae6fd",
                  color: "#0284c7",
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#e0f2fe";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)";
                }}
              >Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ──────────────────────────────────────────────────────────── */
function HeroSection({ user }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Animated Background Image */}
      <div style={{
        position: "absolute",
        inset: "-5%", // Allow room for pan/zoom
        backgroundImage: "url('/hero-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0,
        animation: "bgPanZoom 30s ease-in-out infinite alternate",
      }} />

      {/* Light Overlay to ensure text readability while letting the sun pop through */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255, 247, 237, 0.7) 60%, #f8fafc 100%)",
        zIndex: 1,
      }} />

      {/* Grid overlay for a high-tech vibe */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        backgroundImage: "linear-gradient(rgba(14, 165, 233, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
      }} />

      {/* Subtle Glowing orbs */}
      <div style={{
        position: "absolute",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(250, 204, 21, 0.25) 0%, transparent 70%)",
        top: "10%", left: "50%", transform: "translateX(-50%)",
        filter: "blur(60px)", pointerEvents: "none", zIndex: 1,
        animation: "orbFloat 8s ease-in-out infinite alternate",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center",
        maxWidth: 860,
        padding: "0 2rem",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Status badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.5rem 1.4rem",
          borderRadius: 100,
          border: "1px solid rgba(249, 115, 22, 0.3)",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          marginBottom: "1.5rem",
          animation: "fadeInUp 0.6s ease 0.2s both",
          boxShadow: "0 4px 15px rgba(249, 115, 22, 0.15)",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#f97316",
            boxShadow: "0 0 12px #f97316",
            animation: "statusPulse 2s infinite",
          }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#c2410c",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>Live thermal monitoring active</span>
        </div>

        {/* Huge centered 'HeatAssist' */}
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
          lineHeight: 1.05,
          margin: "0 0 0.5rem",
          color: "#0f172a",
          textShadow: "0 10px 40px rgba(255,255,255,0.9)",
          animation: "fadeInUp 0.6s ease 0.3s both",
        }}>
          HeatAssist
        </h1>

        {/* Subtitle Highlight */}
        <h2 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
          fontWeight: 800,
          margin: "0 0 1.5rem",
          background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 10px rgba(255,255,255,0.8))",
          animation: "fadeInUp 0.6s ease 0.4s both",
        }}>
          Stay Ahead of Urban Heat
        </h2>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          color: "#334155",
          fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
          fontWeight: 600,
          lineHeight: 1.6,
          maxWidth: 600,
          margin: "0 auto 3rem",
          animation: "fadeInUp 0.6s ease 0.5s both",
          textShadow: "0 2px 10px rgba(255,255,255,0.9)",
        }}>
          Personalized heat risk analysis powered by real-time climate data.
          Protect yourself, your pets, and your plants from extreme heat.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          gap: "1.2rem",
          justifyContent: "center",
          flexWrap: "wrap",
          animation: "fadeInUp 0.6s ease 0.6s both",
        }}>
          <button
            onClick={() => navigate(user ? "/app" : "/signup")}
            style={{
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              border: "none",
              color: "#fff",
              padding: "1rem 2.8rem",
              borderRadius: 14,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "0.03em",
              boxShadow: "0 8px 30px rgba(249, 115, 22, 0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(249, 115, 22, 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(249, 115, 22, 0.4)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {user ? "Go to Dashboard →" : "Get Started Free →"}
          </button>
          <button
            onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "#fff",
              border: "2px solid #e0f2fe",
              color: "#0284c7",
              padding: "0.9rem 2.6rem",
              borderRadius: 14,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "0.03em",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              transition: "all 0.3s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#bae6fd";
              e.currentTarget.style.background = "#f0f9ff";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#e0f2fe";
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Explore Features
          </button>
        </div>

        {/* Trust indicators */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
          marginTop: "4rem",
          animation: "fadeInUp 0.6s ease 0.75s both",
          flexWrap: "wrap",
        }}>
          {["🌍 Real-time Data", "🔒 Privacy First", "🆓 Free to Use"].map((txt, i) => (
            <span key={i} style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#64748b",
            }}>{txt}</span>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.8rem",
        animation: "fadeInUp 0.6s ease 1s both",
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>Scroll</span>
        <div style={{
          width: 24, height: 40,
          border: "2px solid #cbd5e1",
          borderRadius: 12,
          display: "flex",
          justifyContent: "center",
          paddingTop: 8,
        }}>
          <div style={{
            width: 4, height: 10,
            background: "#0ea5e9",
            borderRadius: 2,
            animation: "scrollDotBounce 1.6s infinite",
          }} />
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Section ─────────────────────────────────────────────────────────── */
function StatsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: "#fff",
      borderTop: "1px solid #e2e8f0",
      borderBottom: "1px solid #e2e8f0",
      padding: "5rem 2rem",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "2rem",
      }}>
        {STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
            }}
          >
            <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>{stat.icon}</div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              color: "#0ea5e9",
              marginBottom: "0.5rem",
            }}>{stat.value}</div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#64748b",
            }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Features Section ──────────────────────────────────────────────────────── */
function FeaturesSection() {
  const [visible, setVisible] = useState([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible(v => [...new Set([...v, i])]);
        },
        { threshold: 0.15 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return (
    <section id="features-section" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      padding: "8rem 2rem 6rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "5rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 1.2rem",
          borderRadius: 100,
          border: "1px solid rgba(14, 165, 233, 0.3)",
          background: "#e0f2fe",
          marginBottom: "1.5rem",
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#0369a1",
            textTransform: "uppercase",
          }}>Core Features</span>
        </div>
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(2rem, 4vw, 3.5rem)",
          color: "#0f172a",
          margin: "0 0 1.2rem",
          lineHeight: 1.15,
        }}>
          Everything You Need<br />
          <span style={{ color: "#f97316" }}>To Stay Safe</span>
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          color: "#475569",
          fontSize: "1.05rem",
          fontWeight: 500,
          maxWidth: 600,
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          Urban heat is invisible until it isn't. HeatAssist gives you planetary-scale
          thermal intelligence at a personal level.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
        maxWidth: 1200,
        width: "100%",
      }}>
        {FEATURES.map((f, i) => (
          <div
            key={i}
            ref={el => cardRefs.current[i] = el}
            style={{
              background: "#fff",
              border: `1px solid ${visible.includes(i) ? f.color + "44" : "#e2e8f0"}`,
              borderRadius: 24,
              padding: "2.5rem 2rem",
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(40px)",
              transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}20`;
              e.currentTarget.style.borderColor = `${f.color}88`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = visible.includes(i) ? "translateY(0)" : "translateY(40px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.03)";
              e.currentTarget.style.borderColor = visible.includes(i) ? `${f.color}44` : "#e2e8f0";
            }}
          >
            {/* Soft Glow */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 150, height: 150,
              background: `radial-gradient(circle at top right, ${f.color}22, transparent 70%)`,
            }} />

            {/* Icon */}
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1.5rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64, height: 64,
              background: `${f.color}15`,
              borderRadius: 20,
              border: `1px solid ${f.color}33`,
            }}>{f.icon}</div>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "#0f172a",
              margin: "0 0 1rem",
              letterSpacing: "0.01em",
            }}>{f.title}</h3>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: "#64748b",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              margin: 0,
            }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How It Works Section ──────────────────────────────────────────────────── */
function HowItWorksSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: "#fff",
      padding: "8rem 2rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: "2.5rem",
          color: "#0f172a",
          textAlign: "center",
          margin: "0 0 4rem",
        }}>How It Works</h2>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                padding: "2rem 2.5rem",
                borderRadius: 24,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`,
                flexDirection: i % 2 !== 0 ? "row-reverse" : "row",
              }}
            >
              <div style={{
                fontSize: "3rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 80, height: 80, background: "#fff",
                borderRadius: 24, boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                border: "1px solid #f1f5f9",
              }}>{step.icon}</div>
              <div style={{ flex: 1, textAlign: i % 2 !== 0 ? "right" : "left" }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.9rem",
                  color: "#0ea5e9",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  letterSpacing: "0.1em",
                }}>STEP {step.step}</div>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 0.5rem",
                }}>{step.title}</h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "#64748b",
                  fontSize: "1rem",
                  margin: 0,
                }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background: "#0f172a",
      padding: "4rem 2rem 2rem",
      borderTop: "1px solid #1e293b",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #f97316, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>🌤️</div>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "#fff",
          }}>HeatAssist</span>
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.9rem",
          color: "#94a3b8",
        }}>
          © {new Date().getFullYear()} HeatAssist. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar user={user} logout={logout} />
      <HeroSection user={user} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
      
      <style>{`
        @keyframes bgPanZoom {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(-1%, 2%); }
          100% { transform: scale(1) translate(1%, -1%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-35px) translateX(-15px); }
          75% { transform: translateY(-15px) translateX(20px); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes statusPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDotBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(8px); }
          60% { transform: translateY(4px); }
        }
        
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@700;800;900&display=swap');
      `}</style>
    </div>
  );
}
