import { useState, useCallback, useEffect, useRef } from "react";
import { sendToGroq } from "../api/groqApi";
import {
  getWeatherByCoords,
  getWeatherByCity,
  getAirQuality,
  buildWeatherContext,
  getRiskLevel,
  calcHeatIndex,
} from "../api/weatherApi";

export function useHeatChat(userData) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "⏳ Fetching live weather data for your location..." },
  ]);
  const [loading, setLoading] = useState(false);
  const [weatherContext, setWeatherContext] = useState("");
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

  // useRef so it persists across renders without triggering re-renders
  const lastRefresh = useRef(0);

  // ── Build live weather state ────────────────────────────
  const buildLiveWeather = (weather, airQuality) => ({
    ...weather,
    aqi: airQuality?.aqi ?? null,
    aqiLabel: airQuality?.aqiLabel ?? "N/A",
    heatIndex: calcHeatIndex(weather.temp, weather.humidity),
    risk: getRiskLevel(weather.temp, weather.humidity, weather.uv),
    coolest: weather.forecast?.length
      ? weather.forecast.reduce((a, b) => a.feelsLike < b.feelsLike ? a : b)
      : null,
  });

  // ── Fetch AQI then build context ────────────────────────
  const initWeather = async (weather) => {
    const airQuality = await getAirQuality(weather.lat, weather.lon);
    const live = buildLiveWeather(weather, airQuality);
    const ctx = buildWeatherContext(weather, airQuality, userData);
    setLiveWeather(live);
    setWeatherContext(ctx);
    return { live, ctx };
  };

  // ── On mount ────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      // 1. Try userData location first (city from form)
      if (userData?.location) {
        try {
          const weather = await getWeatherByCity(userData.location);
          const { live } = await initWeather(weather);
          setMessages([{
            role: "assistant",
            content: buildWelcome(live, userData),
          }]);
          return;
        } catch {
          // fall through to geolocation
        }
      }

      // 2. Try browser geolocation
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 })
        );
        const weather = await getWeatherByCoords(
          pos.coords.latitude,
          pos.coords.longitude
        );
        const { live } = await initWeather(weather);
        setMessages([{
          role: "assistant",
          content: buildWelcome(live, userData),
        }]);
      } catch {
        setWeatherError("location");
        setMessages([{
          role: "assistant",
          content: `👋 Hi${userData?.name ? ` ${userData.name}` : ""}! I'm **HeatGuard AI**.\n\nI couldn't detect your location. Tell me your **city** — for example: *"I'm in Powai, Mumbai"* — and I'll pull live weather data for you.`,
        }]);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Refresh weather max once every 3 mins ───────────────
  const refreshWeather = async () => {
    if (!liveWeather) return weatherContext;
    const now = Date.now();
    if (now - lastRefresh.current < 3 * 60 * 1000) return weatherContext;
    lastRefresh.current = now;
    try {
      const weather = await getWeatherByCoords(liveWeather.lat, liveWeather.lon);
      // Preserve city/country from original geocode
      weather.city = liveWeather.city;
      weather.country = liveWeather.country;
      const airQuality = await getAirQuality(weather.lat, weather.lon);
      const ctx = buildWeatherContext(weather, airQuality, userData);
      setLiveWeather(buildLiveWeather(weather, airQuality));
      setWeatherContext(ctx);
      return ctx;
    } catch {
      return weatherContext;
    }
  };

  // ── Stream AI response ──────────────────────────────────
  const streamResponse = async (apiMessages) => {
    setLoading(true);
    // Add empty placeholder bubble
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last?.content === "") return prev;
      return [...prev, { role: "assistant", content: "" }];
    });

    try {
      const res = await sendToGroq(apiMessages);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const raw = line.slice(6);
          if (raw === "[DONE]") break;
          try {
            const delta = JSON.parse(raw).choices?.[0]?.delta?.content || "";
            full += delta;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: full };
              return copy;
            });
          } catch {}
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ ${e.message || "Connection error. Please try again."}`,
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Send message ────────────────────────────────────────
  const sendMessage = useCallback(async (userText) => {
    let activeContext = weatherContext;

    // No weather yet — try to extract city from user message
    if (!activeContext || weatherError === "location") {
      const match = userText.match(
        /(?:in|at|for|from)?\s+([A-Z][a-zA-Z\s]{2,25}?)(?:\s*,|\s*$)/
      );
      if (match) {
        try {
          const weather = await getWeatherByCity(match[1].trim());
          const { live, ctx } = await initWeather(weather);
          activeContext = ctx;
          setWeatherError(null);
          setMessages([
            { role: "assistant", content: buildWelcome(live, userData) },
            { role: "user", content: userText },
            { role: "assistant", content: "" },
          ]);
          await streamResponse([{
            role: "user",
            content: `${ctx}\n\nUser message: ${userText}`,
          }]);
          return;
        } catch {
          // city not found — fall through to normal flow
        }
      }
    }

    // Refresh stale weather context
    activeContext = (await refreshWeather()) || activeContext;

    const userMsg = { role: "user", content: userText };
    const history = [...messages, userMsg];

    // Set messages with user bubble + empty assistant placeholder
    setMessages([...history, { role: "assistant", content: "" }]);

    // Inject live weather only into the current user message
    const apiMessages = history.map((m, i) =>
      i === history.length - 1 && activeContext
        ? { role: m.role, content: `${activeContext}\n\nUser message: ${m.content}` }
        : { role: m.role, content: m.content }
    );

    await streamResponse(apiMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, weatherContext, weatherError]);

  // ── Clear chat ──────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([{
      role: "assistant",
      content: liveWeather
        ? buildWelcome(liveWeather, userData)
        : FALLBACK_WELCOME,
    }]);
  }, [liveWeather, userData]);

  return { messages, loading, sendMessage, clearChat, liveWeather };
}

// ── Welcome message ─────────────────────────────────────

function buildWelcome(live, userData) {
  const name = userData?.name ? ` ${userData.name}` : "";

  const coolNote = live.coolest
    ? `\n🕐 Coolest window: **${live.coolest.label}** — feels like ${live.coolest.feelsLike}°C`
    : "";

  const uvNote = live.uv != null
    ? `☀️ UV: **${live.uv.toFixed(1)}** (max today: ${live.uvMax?.toFixed(1) ?? "N/A"})`
    : "☀️ UV: **N/A**";

  const aqNote = live.aqiLabel && live.aqiLabel !== "N/A"
    ? ` | 🌫️ Air: **${live.aqiLabel}**`
    : "";

  return `👋 Hi${name}! I'm **HeatGuard AI** — your live heat risk assistant.

📍 **${live.city}** — fetched at ${live.fetchedAt}
🌡️ ${live.temp}°C | feels like **${live.feelsLike}°C** | ${live.humidity}% humidity
🔥 Heat Index: **${live.heatIndex}°C** | ${uvNote}${aqNote}
🔴 Risk right now: **${live.risk}**${coolNote}

Say **"I'm going out now"** for your full safety report, or ask me anything.`;
}

const FALLBACK_WELCOME = `👋 Hi! I'm **HeatGuard AI**.\n\nCouldn't detect your location. Tell me your city and I'll pull live weather data instantly.`;