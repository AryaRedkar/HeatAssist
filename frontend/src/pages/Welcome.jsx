import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Scroll Sequence Hook (inline) ───────────────────────────────────────────
function useScrollSequence(totalFrames) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameIndexRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let loaded = 0;
    const images = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const num = String(i).padStart(4, "0");
      img.src = `/frames/frame_${num}.jpg`;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (i === 1) renderFrame(0);
        if (loaded === totalFrames) setAllLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, [totalFrames]);

  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = img.naturalWidth || 1920;
    canvas.height = img.naturalHeight || 1080;
    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerTop = container.offsetTop;
      const scrollable = container.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, window.scrollY - containerTop);
      const rawProgress = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(rawProgress);
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.floor(rawProgress * (totalFrames - 1))
      );
      if (frameIndex !== frameIndexRef.current) {
        frameIndexRef.current = frameIndex;
        renderFrame(frameIndex);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [totalFrames]);

  return { containerRef, canvasRef, progress, allLoaded, loadedCount };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 480; // adjust to your actual frame count

const NAV_TABS = [
  { id: "risk",    label: "Risk Score",        icon: "⚡", requiresAuth: false },
  { id: "heatmap", label: "HeatMap",           icon: "🌡️", requiresAuth: false },
  { id: "advisor", label: "Pet & Plant Advisor",icon: "🌿", requiresAuth: true  },
  { id: "chat",    label: "Chatbot",           icon: "💬", requiresAuth: true  },
  { id: "profile", label: "Profile",           icon: "👤", requiresAuth: true  },
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Personalized Calculation",
    desc: "Bio-metric heat risk scoring tailored to your age, health profile, and activity level. Real-time updates as conditions change.",
    color: "#FF6B35",
  },
  {
    icon: "🌿",
    title: "Pet & Plant Care",
    desc: "Species-specific thermal advisories for your animals and plants. Know exactly when to shelter, water, or move them indoors.",
    color: "#4CAF50",
  },
  {
    icon: "💬",
    title: "Live Query Solving",
    desc: "Ask anything about heat safety, climate adaptation, or local risk. Our AI answers in real-time with location-aware context.",
    color: "#2196F3",
  },
  {
    icon: "🗺️",
    title: "HeatMap Visualization",
    desc: "Satellite-grade thermal overlays across your city. Track urban heat islands, cool corridors, and dangerous micro-zones.",
    color: "#FF9800",
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ isLoggedIn }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTabClick = (tab) => {
    if (tab.requiresAuth && !isLoggedIn) {
      navigate("/login");
    } else {
      navigate(`/${tab.id}`);
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        height: "64px",
        background: scrolled
          ? "rgba(8,10,14,0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,107,53,0.15)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}
        onClick={() => navigate("/")}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "radial-gradient(circle at 40% 40%, #FF6B35, #c0392b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, boxShadow: "0 0 18px rgba(255,107,53,0.6)",
        }}>🌡</div>
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: 700,
          fontSize: "1.05rem",
          color: "#fff",
          letterSpacing: "0.05em",
        }}>HeatSense</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            style={{
              background: "none",
              border: "none",
              color: tab.requiresAuth && !isLoggedIn ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.75)",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.78rem",
              padding: "0.45rem 0.85rem",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              transition: "all 0.2s",
              position: "relative",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#FF6B35";
              e.currentTarget.style.background = "rgba(255,107,53,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = tab.requiresAuth && !isLoggedIn
                ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.75)";
              e.currentTarget.style.background = "none";
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>{tab.icon}</span>
            {tab.label}
            {tab.requiresAuth && !isLoggedIn && (
              <span style={{
                fontSize: "0.6rem",
                background: "rgba(255,107,53,0.2)",
                border: "1px solid rgba(255,107,53,0.3)",
                borderRadius: 4,
                padding: "1px 4px",
                color: "#FF6B35",
                marginLeft: 2,
              }}>PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* Auth buttons */}
      <div style={{ display: "flex", gap: "0.6rem" }}>
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.8)",
                padding: "0.4rem 1.1rem",
                borderRadius: 8,
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#FF6B35";
                e.currentTarget.style.color = "#FF6B35";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
            >Login</button>
            <button
              onClick={() => navigate("/signup")}
              style={{
                background: "linear-gradient(135deg, #FF6B35, #c0392b)",
                border: "none",
                color: "#fff",
                padding: "0.4rem 1.1rem",
                borderRadius: 8,
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.78rem",
                cursor: "pointer",
                boxShadow: "0 0 14px rgba(255,107,53,0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 22px rgba(255,107,53,0.7)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(255,107,53,0.4)"}
            >Sign Up</button>
          </>
        ) : (
          <button
            onClick={() => navigate("/profile")}
            style={{
              background: "linear-gradient(135deg, #FF6B35, #c0392b)",
              border: "none",
              color: "#fff",
              padding: "0.4rem 1.1rem",
              borderRadius: 8,
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >Dashboard</button>
        )}
      </div>
    </nav>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
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
    <section style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #080a0e 0%, #0d1117 50%, #080a0e 100%)",
      padding: "7rem 2rem 5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "5rem" }}>
        <div style={{
          display: "inline-block",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          color: "#FF6B35",
          border: "1px solid rgba(255,107,53,0.35)",
          borderRadius: 4,
          padding: "0.35rem 1rem",
          marginBottom: "1.5rem",
          textTransform: "uppercase",
        }}>System Capabilities</div>
        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: 800,
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: "#fff",
          margin: "0 0 1rem",
          lineHeight: 1.15,
        }}>
          Everything You Need<br />
          <span style={{ color: "#FF6B35" }}>To Stay Safe</span>
        </h2>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.9rem",
          maxWidth: 520,
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          Urban heat is invisible until it isn't. HeatSense gives you planetary-scale
          thermal intelligence at a personal level.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        maxWidth: 1100,
        width: "100%",
      }}>
        {FEATURES.map((f, i) => (
          <div
            key={i}
            ref={el => cardRefs.current[i] = el}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${visible.includes(i) ? f.color + "44" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 16,
              padding: "2.2rem 1.8rem",
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
              position: "relative",
              overflow: "hidden",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `rgba(${
                f.color === "#FF6B35" ? "255,107,53" :
                f.color === "#4CAF50" ? "76,175,80" :
                f.color === "#2196F3" ? "33,150,243" :
                "255,152,0"
              },0.07)`;
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Glow corner */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 80, height: 80,
              background: `radial-gradient(circle at top right, ${f.color}22, transparent 70%)`,
            }} />

            <div style={{
              fontSize: "2.2rem",
              marginBottom: "1.2rem",
              display: "inline-block",
              background: `${f.color}18`,
              borderRadius: 12,
              padding: "0.5rem 0.7rem",
              border: `1px solid ${f.color}33`,
            }}>{f.icon}</div>

            <h3 style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#fff",
              margin: "0 0 0.75rem",
              letterSpacing: "0.02em",
            }}>{f.title}</h3>

            <p style={{
              fontFamily: "'Space Mono', monospace",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.8rem",
              lineHeight: 1.75,
              margin: 0,
            }}>{f.desc}</p>

            <div style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              color: f.color,
              opacity: 0.8,
            }}>
              <span>EXPLORE</span>
              <span style={{ fontSize: "0.9rem" }}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: "5rem", textAlign: "center" }}>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          color: "rgba(255,255,255,0.4)",
          fontSize: "0.8rem",
          marginBottom: "1.5rem",
          letterSpacing: "0.05em",
        }}>FREE FEATURES AVAILABLE WITHOUT SIGN-IN</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{
              background: "linear-gradient(135deg, #FF6B35, #c0392b)",
              border: "none",
              color: "#fff",
              padding: "0.8rem 2rem",
              borderRadius: 10,
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              boxShadow: "0 0 24px rgba(255,107,53,0.45)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 36px rgba(255,107,53,0.7)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(255,107,53,0.45)"}
          >
            CHECK RISK SCORE →
          </button>
          <button
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              padding: "0.8rem 2rem",
              borderRadius: 10,
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#FF6B35";
              e.currentTarget.style.color = "#FF6B35";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            VIEW HEATMAP
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  // Replace with your actual auth context
  const isLoggedIn = false;

  const { containerRef, canvasRef, progress, allLoaded, loadedCount } =
    useScrollSequence(TOTAL_FRAMES);

  const heroTextOpacity = Math.max(0, 1 - progress * 3.5);
  const heroTextY = -progress * 60;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #080a0e; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080a0e; }
        ::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 2px; }
      `}</style>

      <Navbar isLoggedIn={isLoggedIn} />

      {/* ── SECTION 1: Scroll Animation ── */}
      <div
        ref={containerRef}
        style={{
          height: `${TOTAL_FRAMES * 6}px`, // tune scroll speed here
          position: "relative",
        }}
      >
        {/* Sticky canvas wrapper */}
        <div style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}>
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Dark overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(8,10,14,0.55) 0%, rgba(8,10,14,0.2) 50%, rgba(8,10,14,0.7) 100%)",
          }} />

          {/* Loading bar */}
          {!allLoaded && (
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              height: 2,
              width: `${(loadedCount / TOTAL_FRAMES) * 100}%`,
              background: "linear-gradient(90deg, #FF6B35, #c0392b)",
              transition: "width 0.3s ease",
            }} />
          )}

          {/* Loading text */}
          {!allLoaded && (
            <div style={{
              position: "absolute", bottom: "2rem", left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              color: "rgba(255,107,53,0.6)",
              letterSpacing: "0.2em",
            }}>
              LOADING THERMAL DATA {Math.round((loadedCount / TOTAL_FRAMES) * 100)}%
            </div>
          )}

          {/* Hero Text */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, calc(-50% + ${heroTextY}px))`,
            opacity: heroTextOpacity,
            textAlign: "center",
            pointerEvents: heroTextOpacity < 0.05 ? "none" : "auto",
            width: "min(90%, 860px)",
            transition: "opacity 0.05s linear",
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "#FF6B35",
              marginBottom: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6,
                borderRadius: "50%", background: "#4CAF50",
                boxShadow: "0 0 8px #4CAF50",
                animation: "pulse 2s infinite",
              }} />
              SATELLITE THERMAL UPLINK STABLE
            </div>

            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              marginBottom: "1.5rem",
              textShadow: "0 0 60px rgba(255,107,53,0.3)",
            }}>
              PLANETARY THERMAL<br />
              <span style={{
                WebkitTextStroke: "2px #FF6B35",
                color: "transparent",
              }}>INTELLIGENCE</span>
            </h1>

            <p style={{
              fontFamily: "'Space Mono', monospace",
              color: "rgba(255,255,255,0.55)",
              fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
              lineHeight: 1.75,
              marginBottom: "2.5rem",
              maxWidth: 560,
              margin: "0 auto 2.5rem",
            }}>
              Personalized bio-metric heat risk analysis powered by real-time climate telemetry.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/risk")}
                style={{
                  background: "linear-gradient(135deg, #FF6B35, #c0392b)",
                  border: "none",
                  color: "#fff",
                  padding: "0.85rem 2.2rem",
                  borderRadius: 10,
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  boxShadow: "0 0 30px rgba(255,107,53,0.5)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(255,107,53,0.8)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(255,107,53,0.5)"}
              >
                INITIALIZE SCAN →
              </button>
              <button
                onClick={() => navigate("/heatmap")}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.8)",
                  padding: "0.85rem 2.2rem",
                  borderRadius: 10,
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#FF6B35";
                  e.currentTarget.style.color = "#FF6B35";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
              >
                VIEW HEATMAP
              </button>
            </div>
          </div>

          {/* Scroll hint */}
          <div style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: progress < 0.05 ? 1 : 0,
            transition: "opacity 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.2em",
            }}>SCROLL TO EXPLORE</span>
            <div style={{
              width: 20, height: 32,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              display: "flex",
              justifyContent: "center",
              paddingTop: 6,
            }}>
              <div style={{
                width: 3, height: 8,
                background: "#FF6B35",
                borderRadius: 2,
                animation: "scrollDot 1.6s infinite",
              }} />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            position: "absolute",
            right: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: 2,
            height: 120,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 1,
          }}>
            <div style={{
              width: "100%",
              height: `${progress * 100}%`,
              background: "linear-gradient(to bottom, #FF6B35, #c0392b)",
              borderRadius: 1,
              transition: "height 0.1s",
            }} />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Features ── */}
      <FeaturesSection />

      {/* ── Footer ── */}
      <footer style={{
        background: "#050608",
        borderTop: "1px solid rgba(255,107,53,0.1)",
        padding: "2.5rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, #FF6B35, #c0392b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11,
          }}>🌡</div>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.5)",
          }}>HeatSense</span>
        </div>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.05em",
        }}>
          © 2025 HEATSENSE · URBAN HEAT INTELLIGENCE PLATFORM
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Contact"].map(link => (
            <span key={link} style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#FF6B35"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >{link}</span>
          ))}
        </div>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #4CAF50; }
          50% { opacity: 0.4; box-shadow: 0 0 3px #4CAF50; }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
      `}</style>
    </>
  );
}