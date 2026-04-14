const BASE = import.meta.env.VITE_API_URL;


export async function fetchWeather(city, neighbourhood) {
  const params = new URLSearchParams({ city });
  if (neighbourhood) params.append("neighbourhood", neighbourhood);


  const res = await fetch(`${BASE}/api/weather?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  return res.json();
}


export async function fetchRisk(payload) {
  const res = await fetch(`${BASE}/api/risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Risk fetch failed: ${res.status}`);
  return res.json();
}


export async function fetchChat(payload) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Chat fetch failed: ${res.status}`);
  return res.json();
}

/* ───────── UV + DAY/NIGHT ───────── */


export async function fetchSunContext(lat, lon) {
  const res = await fetch(
    `${BASE}/api/sun?lat=${lat}&lon=${lon}`
  );
  if (!res.ok) throw new Error("Sun context fetch failed");
  return res.json();
  // returns: { uv, isNight }
}

