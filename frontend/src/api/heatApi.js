const BASE = "http://localhost:5000";

export async function getHeatReport(city, activity, duration, profile) {
  // 1. Weather
  const w = await fetch(`${BASE}/api/weather?city=${city}`);
  const weather = await w.json();

  // 2. Risk
  const r = await fetch(`${BASE}/api/risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      temp: weather.temp,
      humidity: weather.humidity,
      activity,
      duration,
      profile,
    }),
  });
  const riskData = await r.json();

  // 3. Sun / UV
  const s = await fetch(
    `${BASE}/api/sun?lat=19.0760&lon=72.8777` // Mumbai coords for now
  );
  const sun = await s.json();

  return { weather, riskData, sun };
}