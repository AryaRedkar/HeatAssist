import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

const PROFILE_OPTIONS = [
  ["age_50_plus",        "Age 50+",              "👴", "#3b82f6"],
  ["medical_condition",  "Heart / BP / Asthma",  "❤️", "#ef4444"],
  ["on_medication",      "On medication",        "💊", "#f97316"],
  ["pregnancy",          "Pregnancy",            "🤰", "#d946ef"],
  ["periods",            "Menstruating",         "🩸", "#e11d48"],
  ["athlete",            "Athlete",              "🏃", "#22c55e"],
  ["outdoor_profession", "Outdoor profession",   "👷", "#eab308"],
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, saveProfile, profileLoading, DEFAULT_PROFILE } = useProfile();
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ ...DEFAULT_PROFILE, ...profile });
    }
  }, [profile]);

  const toggle = (val) =>
    setForm((f) => ({
      ...f,
      profile: f.profile.includes(val)
        ? f.profile.filter((x) => x !== val)
        : [...f.profile, val],
    }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: "0 auto",
      padding: "2rem 1.5rem 4rem",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
        <button
          onClick={() => navigate("/app")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#0ea5e9", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >← Back to Dashboard</button>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1px solid #bae6fd", borderRadius: 20, fontSize: 24, boxShadow: "0 8px 20px rgba(14,165,233,0.15)" }}>👤</div>
        </div>
        <h1 style={{ fontSize: 26, fontFamily: "'Orbitron', sans-serif", fontWeight: 800, margin: "0 0 8px", color: "#0f172a" }}>
          Your Profile
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0, maxWidth: 400, marginInline: "auto" }}>
          This information is used to calculate your highly personalized heat risk score.
        </p>
      </div>

      {/* Success toast */}
      {saved && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #86efac",
          borderRadius: 12, padding: "12px 16px", marginBottom: 16,
          fontSize: 14, color: "#166534",
          display: "flex", alignItems: "center", gap: 8,
          animation: "fadeIn 0.3s ease",
        }}>
          ✅ Profile saved successfully!
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "12px 16px", marginBottom: 16,
          fontSize: 14, color: "#991b1b",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Section: Location ── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>
          <span style={sectionIcon}>📍</span> Location
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>City *</label>
            <input
              type="text" value={form.city}
              onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Mumbai"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Neighbourhood</label>
            <input
              type="text" value={form.neighbourhood}
              onChange={(e) => setForm(f => ({ ...f, neighbourhood: e.target.value }))}
              placeholder="e.g. Bandra"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Activity ── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>
          <span style={sectionIcon}>🏃</span> Activity
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Activity Type</label>
            <select
              value={form.activity}
              onChange={(e) => setForm(f => ({ ...f, activity: e.target.value }))}
              style={inputStyle}
            >
              <option value="sitting">Sitting / Resting</option>
              <option value="walking">Walking</option>
              <option value="running">Running / Sports</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Duration (minutes)</label>
            <input
              type="number" value={form.duration} min={5} max={180}
              onChange={(e) => setForm(f => ({ ...f, duration: +e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Health Profile ── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>
          <span style={sectionIcon}>🩺</span> Health Profile
        </h3>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 12px" }}>
          Select all conditions that apply to you
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {PROFILE_OPTIONS.map(([val, label, emoji, color]) => {
            const active = form.profile.includes(val);
            return (
              <button
                key={val}
                onClick={() => toggle(val)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${active ? color : "#e5e7eb"}`,
                  background: active ? color + "0d" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? color : "#374151",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 18 }}>{emoji}</span>
                {label}
                {active && <span style={{ marginLeft: "auto", fontSize: 14 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section: Pet & Plant ── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>
          <span style={sectionIcon}>🐾</span> Pet & Plant
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Pet</label>
            <select
              value={form.pet}
              onChange={(e) => setForm(f => ({ ...f, pet: e.target.value }))}
              style={inputStyle}
            >
              <option value="">No pet</option>
              <option value="dog">Dog 🐕</option>
              <option value="cat">Cat 🐈</option>
              <option value="bird">Bird 🐦</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Plant Type</label>
            <select
              value={form.plant_type}
              onChange={(e) => setForm(f => ({ ...f, plant_type: e.target.value }))}
              style={inputStyle}
            >
              <option value="">No plants</option>
              <option value="indoor">Indoor plants 🪴</option>
              <option value="outdoor">Outdoor plants 🌳</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={handleSave}
        disabled={saving || !form.city}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 16,
          border: "none",
          background: saving || !form.city
            ? "#cbd5e1"
            : "linear-gradient(135deg, #0ea5e9, #38bdf8)",
          color: "#fff",
          fontFamily: "inherit",
          fontWeight: 700,
          fontSize: 16,
          cursor: saving || !form.city ? "not-allowed" : "pointer",
          boxShadow: saving || !form.city ? "none" : "0 8px 25px rgba(14, 165, 233, 0.3)",
          transition: "all 0.25s",
          marginTop: 16,
        }}
        onMouseEnter={e => { if(!saving && form.city) e.currentTarget.style.transform = "translateY(-2px)" }}
        onMouseLeave={e => { if(!saving && form.city) e.currentTarget.style.transform = "translateY(0)" }}
      >
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile"}
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ── */
const sectionStyle = {
  background: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  borderRadius: 20,
  padding: "24px",
  marginBottom: 20,
  boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
};

const sectionTitle = {
  fontSize: 16,
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 800,
  color: "#0f172a",
  margin: "0 0 16px",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const sectionIcon = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32, height: 32,
  borderRadius: 10,
  background: "rgba(255, 255, 255, 0.7)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  fontSize: 16,
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 6,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255, 255, 255, 0.7)",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.2s",
  background: "rgba(255, 255, 255, 0.5)",
  color: "#0f172a",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
};

