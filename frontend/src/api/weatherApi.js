// Open-Meteo — completely free, no API key needed
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const AIR_API      = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEO_API      = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_GEO  = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// ── Reverse Geocode: coords → city name ──────────────────
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `${REVERSE_GEO}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      city: d.city || d.locality || d.principalSubdivision || "Unknown",
      country: d.countryCode?.toUpperCase() ?? "",
    };
  } catch {
    return null;
  }
}

// ── Geocoding: city name → coords ────────────────────────
export async function geocodeCity(city) {
  const res = await fetch(
    `${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const d = await res.json();
  if (!d.results?.length) throw new Error(`City "${city}" not found`);
  const r = d.results[0];
  return {
    city: r.name,
    country: r.country_code?.toUpperCase() ?? "",
    lat: r.latitude,
    lon: r.longitude,
    timezone: r.timezone ?? "auto",
  };
}

// ── Main weather + hourly forecast (single call) ─────────
export async function getWeatherByCoords(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "uv_index",
      "precipitation",
      "surface_pressure",
      "visibility",
      "dew_point_2m",
      "cloud_cover",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation_probability",
      "weather_code",
      "uv_index",
      "wind_speed_10m",
    ].join(","),
    daily: ["sunrise", "sunset", "uv_index_max"].join(","),
    wind_speed_unit: "ms",
    temperature_unit: "celsius",
    timezone: "auto",
    forecast_days: 2,
  });

  const [weatherRes, geo] = await Promise.all([
    fetch(`${FORECAST_API}?${params}`),
    reverseGeocode(lat, lon),
  ]);

  if (!weatherRes.ok) throw new Error("Weather fetch failed");
  const d = await weatherRes.json();

  const weather = parseOpenMeteo(d, lat, lon);

  if (geo) {
    weather.city = geo.city;
    weather.country = geo.country;
  }

  return weather;
}

export async function getWeatherByCity(city) {
  const geo = await geocodeCity(city);
  const weather = await getWeatherByCoords(geo.lat, geo.lon);
  // Override with the more accurate name from forward geocoding
  weather.city = geo.city;
  weather.country = geo.country;
  return weather;
}

// ── Air quality (separate Open-Meteo endpoint) ───────────
export async function getAirQuality(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: ["european_aqi", "pm2_5", "pm10", "ozone"].join(","),
      timezone: "auto",
    });
    const res = await fetch(`${AIR_API}?${params}`);
    if (!res.ok) return null;
    const d = await res.json();
    const aqi = d.current?.european_aqi ?? null;

    const aqiLevel = aqi == null ? null
      : aqi <= 20  ? 1
      : aqi <= 40  ? 2
      : aqi <= 60  ? 3
      : aqi <= 80  ? 4
      : 5;

    const aqiLabels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];

    return {
      aqi: aqiLevel,
      aqiRaw: aqi,
      aqiLabel: aqiLabels[aqiLevel] ?? "N/A",
      pm25: d.current?.pm2_5?.toFixed(1) ?? null,
      pm10: d.current?.pm10?.toFixed(1) ?? null,
      ozone: d.current?.ozone?.toFixed(1) ?? null,
    };
  } catch {
    return null;
  }
}

// ── Parse Open-Meteo response ────────────────────────────
function parseOpenMeteo(d, lat, lon) {
  const c = d.current;
  const hourly = d.hourly;
  const daily = d.daily;
  const now = new Date();
  const nowHour = now.toISOString().slice(0, 13);

  const currentIdx = (hourly?.time || []).findIndex(t => t.startsWith(nowHour));
  const startIdx = currentIdx >= 0 ? currentIdx : 0;

  const forecast = (hourly?.time || [])
    .slice(startIdx, startIdx + 8)
    .map((t, i) => {
      const idx = startIdx + i;
      const date = new Date(t);
      return {
        dt: date.getTime() / 1000,
        label: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hour: date.getHours(),
        temp: Math.round(hourly.temperature_2m[idx] ?? 0),
        feelsLike: Math.round(hourly.apparent_temperature[idx] ?? 0),
        humidity: Math.round(hourly.relative_humidity_2m[idx] ?? 0),
        uv: hourly.uv_index?.[idx] ?? null,
        pop: Math.round((hourly.precipitation_probability?.[idx] ?? 0)),
        windSpeed: (hourly.wind_speed_10m?.[idx] ?? 0).toFixed(1),
        description: wmoDescription(hourly.weather_code?.[idx] ?? 0),
      };
    });

  return {
    city: "Unknown",
    country: "",
    lat,
    lon,
    temp: Math.round(c.temperature_2m ?? 0),
    feelsLike: Math.round(c.apparent_temperature ?? 0),
    humidity: Math.round(c.relative_humidity_2m ?? 0),
    uv: c.uv_index ?? null,
    uvMax: daily?.uv_index_max?.[0] ?? null,
    description: wmoDescription(c.weather_code ?? 0),
    windSpeed: (c.wind_speed_10m ?? 0).toFixed(1),
    windDeg: c.wind_direction_10m ?? 0,
    windGusts: (c.wind_gusts_10m ?? 0).toFixed(1),
    pressure: Math.round(c.surface_pressure ?? 0),
    visibility: c.visibility ? (c.visibility / 1000).toFixed(1) : "N/A",
    dewPoint: c.dew_point_2m?.toFixed(1) ?? null,
    cloudCover: c.cloud_cover ?? null,
    precipitation: c.precipitation ?? 0,
    sunrise: daily?.sunrise?.[0]
      ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "N/A",
    sunset: daily?.sunset?.[0]
      ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "N/A",
    forecast,
    fetchedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

// ── WMO weather code → human description ─────────────────
function wmoDescription(code) {
  const map = {
    0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 48: "icy fog",
    51: "light drizzle", 53: "moderate drizzle", 55: "heavy drizzle",
    61: "light rain", 63: "moderate rain", 65: "heavy rain",
    71: "light snow", 73: "moderate snow", 75: "heavy snow",
    77: "snow grains",
    80: "light showers", 81: "moderate showers", 82: "heavy showers",
    85: "snow showers", 86: "heavy snow showers",
    95: "thunderstorm", 96: "thunderstorm with hail", 99: "heavy thunderstorm with hail",
  };
  return map[code] ?? "mixed conditions";
}

// ── Helpers ───────────────────────────────────────────────
export function calcHeatIndex(tempC, humidity) {
  if (tempC < 27) return tempC;
  const T = tempC * 9 / 5 + 32;
  const R = humidity;
  const HI =
    -42.379 + 2.04901523 * T + 10.14333127 * R -
    0.22475541 * T * R - 0.00683783 * T * T -
    0.05481717 * R * R + 0.00122874 * T * T * R +
    0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
  return Math.round((HI - 32) * 5 / 9);
}

export function getWindDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function getRiskLevel(temp, humidity, uv) {
  const hi = calcHeatIndex(temp, humidity);
  const uvScore = uv == null ? 0 : uv >= 11 ? 3 : uv >= 8 ? 2 : uv >= 5 ? 1 : 0;
  const hiScore = hi >= 54 ? 3 : hi >= 41 ? 2 : hi >= 32 ? 1 : 0;
  const score = Math.max(hiScore, uvScore);
  return ["LOW", "MODERATE", "HIGH", "EXTREME"][score];
}

export function buildWeatherContext(weather, airQuality, userData) {
  const heatIndex = calcHeatIndex(weather.temp, weather.humidity);
  const risk = getRiskLevel(weather.temp, weather.humidity, weather.uv);
  const windDir = getWindDirection(weather.windDeg);

  const forecast = weather.forecast ?? [];

  const forecastBlock = forecast.length
    ? forecast.map(f =>
        `  ${f.label} → ${f.temp}°C (feels ${f.feelsLike}°C), UV ${f.uv?.toFixed(1) ?? "?"}, ` +
        `rain ${f.pop}%, wind ${f.windSpeed} m/s, ${f.description}`
      ).join("\n")
    : "  Not available";

  // ✅ FIX 2: Plain "Air Quality Index (AQI)" instead of "European AQI"
  const aqBlock = airQuality
    ? `Air Quality Index (AQI): ${airQuality.aqiRaw ?? "N/A"} — ${airQuality.aqiLabel} | PM2.5: ${airQuality.pm25} µg/m³ | PM10: ${airQuality.pm10} µg/m³ | Ozone: ${airQuality.ozone} µg/m³`
    : "Not available";

  const userBlock = userData ? `
USER PROFILE — personalize advice for this person:
  Name: ${userData.name || "Not provided"}
  Age: ${userData.age || "Not provided"}
  Health conditions: ${userData.healthConditions || "None"}
  Planned activity: ${userData.activity || "General outdoor"}
  Location entered: ${userData.location || weather.city}
` : "";

  // ✅ FIX 1: Only look at today's slots for best time recommendation
  const todaySlots = forecast.filter(f => {
    const d = new Date(f.dt * 1000);
    return d.toDateString() === new Date().toDateString();
  });
  const todayCoolest = todaySlots.length
    ? todaySlots.reduce((a, b) => a.feelsLike < b.feelsLike ? a : b)
    : null;
  const bestTimeStr = todayCoolest
    ? `${todayCoolest.label} — feels like ${todayCoolest.feelsLike}°C, UV ${todayCoolest.uv?.toFixed(1) ?? "?"}`
    : "Early morning before 9am or after sunset";

  return `
LIVE WEATHER — ${weather.city}, ${weather.country} — fetched at ${weather.fetchedAt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Temperature   : ${weather.temp}°C | Feels like: ${weather.feelsLike}°C
Humidity      : ${weather.humidity}% | Dew Point: ${weather.dewPoint ?? "N/A"}°C
Wind          : ${weather.windSpeed} m/s ${windDir} | Gusts: ${weather.windGusts} m/s
Pressure      : ${weather.pressure} hPa | Visibility: ${weather.visibility} km
Sky           : ${weather.description} | Cloud Cover: ${weather.cloudCover ?? "N/A"}%
UV Index NOW  : ${weather.uv?.toFixed(1) ?? "N/A"} | UV Max today: ${weather.uvMax?.toFixed(1) ?? "N/A"}
Heat Index    : ${heatIndex}°C
Risk Level    : ${risk}
Sunrise/Sunset: ${weather.sunrise} / ${weather.sunset}

AIR QUALITY:
  ${aqBlock}

NEXT 8 HOURS (true hourly forecast):
${forecastBlock}

BEST TIME TO GO OUT TODAY: ${bestTimeStr}
${userBlock}
INSTRUCTION: Use the exact numbers above. Always recommend the best time FROM TODAY FIRST — only suggest tomorrow if ALL today's remaining slots have feels-like >45°C or UV >10. Reference specific hours (e.g. "at 6:00 PM it drops to X°C"). UV index is real data — use it in risk assessment. Factor air quality into exercise advice. When mentioning air quality, say "Air Quality Index (AQI)" — never "European AQI". Explain AQI in plain language (e.g. "Poor air quality means fine particles in the air can irritate your lungs and affect breathing").
`.trim();
}