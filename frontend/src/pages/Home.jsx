import { useState } from "react";
import { fetchWeather, fetchRisk } from "../api";

const STEPS = ["Who are you?", "Your pet & plant", "Your city"];

// ── Info shown when each profile option is checked ─────────────────────────
const PROFILE_INFO = {
  age_50_plus: {
    emoji: "👴",
    color: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    text: "Age 50+ reduces sweat gland efficiency and slows your body's ability to detect overheating. Older adults dehydrate faster and are responsible for the majority of heat-related deaths in India (IMD data).",
  },
  medical_condition: {
    emoji: "❤️",
    color: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    text: "Heart patients face cardiac overload in heat. High BP patients risk sudden drops in blood pressure. Asthma patients are triggered by hot, dry air and rising ozone levels. This is the second-highest risk factor in the model (WHO).",
  },
  on_medication: {
    emoji: "💊",
    color: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
    text: "Diuretics cause faster dehydration. Beta-blockers prevent your heart from speeding up to cool you. Some allergy and psychiatric medications block sweating entirely — meaning your body loses its main cooling mechanism (CDC / FDA).",
  },
  pregnancy: {
    emoji: "🤰",
    color: { bg: "#fdf2f8", border: "#f0abfc", text: "#86198f" },
    text: "Pregnancy is the highest risk factor in this model. Your metabolic rate is ~20% higher, generating more body heat. Core temp above 39°C risks fetal neural tube defects and preterm labour. Cardiovascular reserve is reduced, especially in the 3rd trimester (ACOG 2020).",
  },
  athlete: {
    emoji: "🏃",
    color: { bg: "#f0fdf4", border: "#86efac", text: "#166534" },
    text: "Athletes generate up to 15x more heat during intense exercise. However, trained athletes also sweat more efficiently and have better cardiovascular heat response. Net risk is moderate — but rises sharply if you are unacclimatized or pushing beyond normal intensity (ACSM).",
  },
  outdoor_profession: {
    emoji: "👷",
    color: { bg: "#fefce8", border: "#fde047", text: "#854d0e" },
    text: "Construction workers, farmers, delivery workers and street vendors face cumulative heat exposure all day — not just one outing. They often cannot take rest breaks, leading to progressive heat strain and chronic dehydration across the workday (NIOSH / ILO).",
  },
};

export default function Home({ onSubmit }) {
  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState({
    city:          "Mumbai",
    neighbourhood: "",
    activity:      "walking",
    duration:      30,
    profile:       [],
    pet:           "",
    plant_type:    "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);  // now shows real error text

  const toggle = (val) =>
    setForm((f) => ({
      ...f,
      profile: f.profile.includes(val)
        ? f.profile.filter((x) => x !== val)
        : [...f.profile, val],
    }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeather(form.city, form.neighbourhood);
      const risk    = await fetchRisk({ ...form, ...weather });
      onSubmit({ ...form, ...weather }, risk);
    } catch (err) {
      // Show the actual error message from api.js so user/dev can debug
      setError(err.message);
      console.error("[Home] Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 1rem" }}>

      {/* Step progress bars */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? "#ef4444" : "#e5e7eb",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
        {STEPS[step]}
      </h2>

      {/* ── Step 0: Activity & profile ─────────────────────────── */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            Activity
            <select
              value={form.activity}
              onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))}
              style={inputStyle}
            >
              <option value="sitting">Sitting / resting</option>
              <option value="walking">Walking</option>
              <option value="running">Running / sports</option>
            </select>
          </label>

          <label>
            Duration (minutes)
            <input
              type="number"
              value={form.duration}
              min={5}
              max={180}
              onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))}
              style={inputStyle}
            />
          </label>

          <div>
            Health profile (select all that apply)
            {[
              ["age_50_plus",        "Age 50+"],
              ["medical_condition",  "Heart / BP / Asthma"],
              ["on_medication",      "On medication"],
              ["pregnancy",          "Pregnancy 🤰"],
              ["athlete",            "Athlete"],
              ["outdoor_profession", "Outdoor profession"],
            ].map(([val, label]) => (
              <div key={val}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.profile.includes(val)}
                    onChange={() => toggle(val)}
                  />
                  {label}
                </label>

                {form.profile.includes(val) && (
                  <div style={{
                    background:   PROFILE_INFO[val].color.bg,
                    border:       `1px solid ${PROFILE_INFO[val].color.border}`,
                    borderRadius: 8,
                    padding:      "10px 14px",
                    fontSize:     13,
                    color:        PROFILE_INFO[val].color.text,
                    marginTop:    6,
                    lineHeight:   1.5,
                  }}>
                    {PROFILE_INFO[val].emoji} {PROFILE_INFO[val].text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: Pet & plant ────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            Pet (optional)
            <select
              value={form.pet}
              onChange={(e) => setForm((f) => ({ ...f, pet: e.target.value }))}
              style={inputStyle}
            >
              <option value="">No pet</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
            </select>
          </label>

          <label>
            Plant type (optional)
            <select
              value={form.plant_type}
              onChange={(e) => setForm((f) => ({ ...f, plant_type: e.target.value }))}
              style={inputStyle}
            >
              <option value="">No plants</option>
              <option value="indoor">Indoor plants</option>
              <option value="outdoor">Outdoor plants</option>
            </select>
          </label>
        </div>
      )}

      {/* ── Step 2: City & neighbourhood ──────────────────────── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            Your city
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Mumbai"
              style={inputStyle}
            />
          </label>

          <label>
            Neighbourhood (optional)
            <input
              type="text"
              value={form.neighbourhood}
              onChange={(e) => setForm((f) => ({ ...f, neighbourhood: e.target.value }))}
              placeholder="e.g. Borivali, Bandra, Lower Parel"
              style={inputStyle}
            />
          </label>

          {(form.neighbourhood || form.city) && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#991b1b",
            }}>
              Weather will be fetched for:{" "}
              <strong>{form.neighbourhood || form.city}</strong>
              {form.neighbourhood && form.city !== form.neighbourhood && (
                <span style={{ color: "#6b7280" }}>, {form.city}</span>
              )}
            </div>
          )}

          {/* ── Error box — now shows the actual error from api.js ── */}
          {error && (
            <div style={{
              background: "#fff7ed", border: "1px solid #fdba74",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#9a3412",
            }}>
              <strong>⚠️ Error:</strong> {error}

              {/* Quick checklist to help debug */}
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Is your Flask backend running on port 9000?</li>
                <li>Is <code>VITE_API_URL=http://localhost:9000</code> set in <code>frontend/.env</code>?</li>
                <li>Did you restart Vite after editing <code>.env</code>?</li>
                <li>Check the browser Console and Flask terminal for details.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation buttons ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        {step > 0 && (
          <button onClick={() => { setStep((s) => s - 1); setError(null); }} style={backBtnStyle}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button onClick={() => setStep((s) => s + 1)} style={primaryBtnStyle}>
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !form.city}
            style={{ ...primaryBtnStyle, opacity: loading || !form.city ? 0.6 : 1 }}
          >
            {loading ? "Checking…" : "Check My Risk"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const inputStyle = {
  display: "block", width: "100%", marginTop: 6,
  padding: "8px 12px", borderRadius: 8,
  border: "1px solid #d1d5db", fontSize: 15,
  boxSizing: "border-box",
};

const primaryBtnStyle = {
  flex: 1, padding: "12px", borderRadius: 8,
  border: "none", background: "#ef4444",
  color: "white", fontWeight: 600,
  fontSize: 15, cursor: "pointer",
};

const backBtnStyle = {
  flex: 1, padding: "12px", borderRadius: 8,
  border: "1px solid #d1d5db", background: "white",
  fontSize: 15, cursor: "pointer",
};