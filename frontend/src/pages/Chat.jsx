import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useHeatChat } from "../hooks/useHeatChat";

const QUICK_PROMPTS = [
  "I'm going out now",
  "Is it safe to exercise outside?",
  "Signs of heat stroke?",
  "Best time to go out today?",
  "What should I carry outdoors?",
  "How to cool down fast?",
];

const RISK_COLORS = {
  EXTREME: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", border: "#fca5a5" },
  HIGH:    { bg: "#ffedd5", text: "#9a3412", dot: "#f97316", border: "#fdba74" },
  MODERATE:{ bg: "#fef9c3", text: "#854d0e", dot: "#eab308", border: "#fde047" },
  LOW:     { bg: "#dcfce7", text: "#166534", dot: "#22c55e", border: "#86efac" },
};

function uvColor(uv) {
  if (uv == null) return "#888";
  if (uv >= 11) return "#ef4444";
  if (uv >= 8)  return "#f97316";
  if (uv >= 5)  return "#eab308";
  if (uv >= 3)  return "#22c55e";
  return "#16a34a";
}

function aqiColor(aqi) {
  if (aqi == null) return "#888";
  if (aqi >= 5) return "#ef4444";
  if (aqi >= 4) return "#f97316";
  if (aqi >= 3) return "#eab308";
  return "#22c55e";
}

export default function Chat({ userData, onBack }) {
  const { messages, loading, sendMessage, clearChat, liveWeather } = useHeatChat(userData);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const riskStyle = liveWeather
    ? (RISK_COLORS[liveWeather.risk] || RISK_COLORS.LOW)
    : null;

  return (
    <div className="chat-page">

      {/* ── Header ── */}
      <div className="chat-header">
        <div className="chat-header-left">
          {onBack && (
            <button onClick={onBack} className="back-btn">← Back</button>
          )}
          <div className="heat-pulse-ring">
            <span className="heat-dot" />
          </div>
          <div>
            <h2 className="chat-title">HeatGuard AI</h2>
            <p className="chat-subtitle">
              {liveWeather
                ? `Live data · ${liveWeather.city} · updated ${liveWeather.fetchedAt}`
                : "Fetching live weather..."}
            </p>
          </div>
        </div>
        <button className="clear-btn" onClick={clearChat}>Clear Chat</button>
      </div>

      {/* ── Live Weather Bar ── */}
      {liveWeather && (
        <div className="weather-bar" style={{ borderBottomColor: riskStyle.border }}>

          <div className="weather-stat">
            <span className="wstat-label">📍 City</span>
            <span className="wstat-value">{liveWeather.city}</span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">🌡️ Temp</span>
            <span className="wstat-value">{liveWeather.temp}°C</span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">🤔 Feels</span>
            <span className="wstat-value">{liveWeather.feelsLike}°C</span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">💧 Humidity</span>
            <span className="wstat-value">{liveWeather.humidity}%</span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">🔥 Heat Idx</span>
            <span className="wstat-value">{liveWeather.heatIndex}°C</span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">☀️ UV</span>
            <span
              className="wstat-value"
              style={{ color: uvColor(liveWeather.uv) }}
            >
              {liveWeather.uv != null ? liveWeather.uv.toFixed(1) : "N/A"}
            </span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">💨 Wind</span>
            <span className="wstat-value">{liveWeather.windSpeed} m/s</span>
          </div>
          <div className="weather-divider" />

          <div className="weather-stat">
            <span className="wstat-label">🌫️ Air</span>
            <span
              className="wstat-value"
              style={{ color: aqiColor(liveWeather.aqi) }}
            >
              {liveWeather.aqiLabel ?? "N/A"}
            </span>
          </div>

          {/* Coolest window if available */}
          {liveWeather.coolest && (
            <>
              <div className="weather-divider" />
              <div className="weather-stat">
                <span className="wstat-label">🕐 Coolest</span>
                <span className="wstat-value" style={{ color: "#22c55e", fontSize: 11 }}>
                  {liveWeather.coolest.label} · {liveWeather.coolest.feelsLike}°C
                </span>
              </div>
            </>
          )}

          <div
            className="risk-badge"
            style={{
              background: riskStyle.bg,
              color: riskStyle.text,
              marginLeft: "auto",
            }}
          >
            <span className="risk-dot" style={{ background: riskStyle.dot }} />
            {liveWeather.risk} RISK
          </div>

        </div>
      )}

      {/* ── Messages ── */}
      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="bot-avatar">H</div>
            )}
            <div className={`bubble ${msg.role}`}>
              {msg.content === "" && loading ? (
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick Prompts ── */}
      <div className="quick-chips">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            className="chip"
            onClick={() => { if (!loading) sendMessage(p); }}
            disabled={loading}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div className="input-area">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about heat risk, safety tips, symptoms..."
          className="chat-input"
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

    </div>
  );
}