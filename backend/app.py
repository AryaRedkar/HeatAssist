from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
import re
import time as time_module
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from heat_engine import (
    calculate_heat_score, get_risk_level, get_suggestion,
    get_pet_advice, get_plant_advice
)

# ── Mumbai heatmap module (optional) ──────────────────────────────────────
try:
    from mumbai_heatmap import get_mumbai_heatmap
    MUMBAI_HEATMAP_AVAILABLE = True
except ImportError:
    MUMBAI_HEATMAP_AVAILABLE = False
    print("[WARN] mumbai_heatmap.py not found — /api/heatmap will return 503")

load_dotenv()
app = Flask(__name__)
CORS(app)

OWM_KEY         = os.getenv("OWM_API_KEY")
OWM_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OWM_AQI_URL     = "https://api.openweathermap.org/data/2.5/air_pollution"
OWM_GEO_URL     = "https://api.openweathermap.org/geo/1.0/direct"
OPEN_METEO_URL  = "https://api.open-meteo.com/v1/forecast"

IST = timezone(timedelta(hours=5, minutes=30))

MOCK_WEATHER = {
    "temp": 33, "feels_like": 38, "humidity": 44,
    "city": "Mumbai", "neighbourhood": "Unknown",
    "lat": 19.0760, "lon": 72.8777,
    "uvi": 6, "wind_speed": 1.4, "aqi": 3,
    "source": "mock"
}

# ── Precise lat/lon for Mumbai neighbourhoods ──────────────────────────────
MUMBAI_NEIGHBOURHOODS = {
    "borivali":         (19.2307, 72.8567),
    "kandivali":        (19.2044, 72.8490),
    "malad":            (19.1870, 72.8488),
    "goregaon":         (19.1663, 72.8526),
    "jogeshwari":       (19.1369, 72.8496),
    "andheri":          (19.1136, 72.8697),
    "vile parle":       (19.0990, 72.8478),
    "bandra":           (19.0596, 72.8295),
    "santacruz":        (19.0822, 72.8419),
    "kurla":            (19.0728, 72.8826),
    "sion":             (19.0397, 72.8619),
    "dadar":            (19.0178, 72.8478),
    "mahim":            (19.0386, 72.8420),
    "worli":            (19.0096, 72.8174),
    "lower parel":      (18.9999, 72.8332),
    "parel":            (18.9974, 72.8367),
    "matunga":          (19.0254, 72.8619),
    "wadala":           (19.0177, 72.8571),
    "chembur":          (19.0622, 72.8997),
    "ghatkopar":        (19.0860, 72.9081),
    "vikhroli":         (19.1050, 72.9261),
    "bhandup":          (19.1422, 72.9388),
    "mulund":           (19.1726, 72.9567),
    "thane":            (19.2183, 72.9781),
    "powai":            (19.1197, 72.9060),
    "juhu":             (19.0969, 72.8264),
    "versova":          (19.1307, 72.8152),
    "colaba":           (18.9067, 72.8147),
    "nariman point":    (18.9255, 72.8242),
    "fort":             (18.9340, 72.8352),
    "churchgate":       (18.9350, 72.8266),
    "grant road":       (18.9636, 72.8188),
    "mumbai central":   (18.9690, 72.8193),
    "byculla":          (18.9784, 72.8362),
    "dharavi":          (19.0390, 72.8540),
    "khar":             (19.0728, 72.8350),
    "oshiwara":         (19.1373, 72.8301),
    "mira road":        (19.2900, 72.8694),
    "vasai":            (19.3619, 72.8397),
    "navi mumbai":      (19.0330, 73.0297),
    "kharghar":         (19.0477, 73.0659),
    "belapur":          (19.0168, 73.0389),
    "vashi":            (19.0771, 72.9988),
    "nerul":            (19.0330, 73.0167),
    "airoli":           (19.1541, 72.9986),
    "ghansoli":         (19.1241, 72.9935),
    "kopar khairane":   (19.1030, 73.0070),
    "turbhe":           (19.0783, 73.0161),
    "sanpada":          (19.0574, 73.0115),
    "juinagar":         (19.0413, 73.0209),
    "seawoods":         (19.0197, 73.0162),
    "dombivli":         (19.2183, 73.0868),
    "kalyan":           (19.2437, 73.1355),
    "ulhasnagar":       (19.2215, 73.1561),
    "ambernath":        (19.2013, 73.1927),
    "badlapur":         (19.1590, 73.2600),
    "panvel":           (18.9894, 73.1175),
    "pen":              (18.7369, 73.0968),
    "alibaug":          (18.6414, 72.8722),
    "virar":            (19.4584, 72.8119),
    "nalasopara":       (19.4175, 72.8186),
    "bhayandar":        (19.3015, 72.8545),
    "palghar":          (19.6967, 72.7653),
    "dahanu":           (19.9674, 72.7181),
    "mankhurd":         (19.0499, 72.9306),
    "govandi":          (19.0607, 72.9229),
    "trombay":          (19.0396, 72.9254),
    "chunabhatti":      (19.0310, 72.8753),
    "tilak nagar":      (19.0524, 72.9027),
    "ghatkopar west":   (19.0877, 72.9025),
    "ghatkopar east":   (19.0777, 72.9155),
    "vikhroli west":    (19.1057, 72.9197),
    "vikhroli east":    (19.1038, 72.9306),
    "kanjurmarg":       (19.1104, 72.9411),
    "bhandup west":     (19.1448, 72.9270),
    "bhandup east":     (19.1393, 72.9441),
    "nahur":            (19.1577, 72.9386),
    "mulund west":      (19.1726, 72.9425),
    "mulund east":      (19.1726, 72.9617),
    "diva":             (19.2163, 73.0476),
    "mumbra":           (19.1932, 73.0240),
    "shilphata":        (19.1785, 73.0580),
    "mazgaon":          (18.9590, 72.8445),
    "sewri":            (18.9906, 72.8568),
    "antop hill":       (19.0127, 72.8601),
    "sion koliwada":    (19.0467, 72.8666),
    "shivaji park":     (19.0281, 72.8419),
    "shivaji nagar":    (19.1310, 72.8580),
    "dindoshi":         (19.2163, 72.8618),
    "kandivali east":   (19.2044, 72.8625),
    "kandivali west":   (19.2044, 72.8355),
    "borivali east":    (19.2307, 72.8726),
    "borivali west":    (19.2307, 72.8410),
    "dahisar":          (19.2583, 72.8565),
}


# ══════════════════════════════════════════════════════════════════════════
#  COORD HELPERS
# ══════════════════════════════════════════════════════════════════════════

def lookup_neighbourhood_coords(neighbourhood: str):
    key = neighbourhood.lower().strip()
    if key in MUMBAI_NEIGHBOURHOODS:
        lat, lon = MUMBAI_NEIGHBOURHOODS[key]
        print(f"[LOCAL LOOKUP] '{neighbourhood}' → ({lat}, {lon})")
        return lat, lon
    for name, coords in MUMBAI_NEIGHBOURHOODS.items():
        if name in key or key in name:
            print(f"[LOCAL LOOKUP PARTIAL] '{neighbourhood}' matched '{name}' → {coords}")
            return coords
    return None, None


def fetch_coordinates(neighbourhood: str, city: str):
    lat, lon = lookup_neighbourhood_coords(neighbourhood)
    if lat and lon:
        return lat, lon, neighbourhood

    queries = [
        f"{neighbourhood},{city},IN",
        f"{neighbourhood},IN",
        f"{neighbourhood} {city},IN",
    ]
    for query in queries:
        try:
            res = requests.get(OWM_GEO_URL, params={
                "q": query, "limit": 3, "appid": OWM_KEY
            }, timeout=5)
            res.raise_for_status()
            results = res.json()
            print(f"[GEO] Query: '{query}' → {len(results)} results")
            if results:
                best = results[0]
                for r in results:
                    if neighbourhood.lower() in r.get("name", "").lower():
                        best = r
                        break
                lat  = best["lat"]
                lon  = best["lon"]
                name = best.get("local_names", {}).get("en") or best.get("name", neighbourhood)
                print(f"[GEO SUCCESS] '{neighbourhood}' → ({lat}, {lon}), name='{name}'")
                return lat, lon, name
        except Exception as e:
            print(f"[GEO ERROR] query='{query}' error={e}")

    print(f"[GEO FAIL] Could not geocode '{neighbourhood}'")
    return None, None, neighbourhood


def fetch_city_coords(city: str):
    try:
        res = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": city, "count": 1, "language": "en", "format": "json"},
            timeout=5
        )
        res.raise_for_status()
        results = res.json().get("results", [])
        if results:
            r = results[0]
            print(f"[CITY COORDS] '{city}' → ({r['latitude']}, {r['longitude']})")
            return r["latitude"], r["longitude"]
    except Exception as e:
        print(f"[CITY COORD ERROR] {e}")
    return None, None


# ══════════════════════════════════════════════════════════════════════════
#  WEATHER / UVI / AQI / SUN FETCHERS
# ══════════════════════════════════════════════════════════════════════════

def fetch_weather_owm(lat: float, lon: float):
    """PRIMARY — OWM current weather. Returns: (temp, feels_like, humidity, wind_speed, success)"""
    try:
        res = requests.get(OWM_WEATHER_URL, params={
            "lat": lat, "lon": lon, "appid": OWM_KEY, "units": "metric",
        }, timeout=6)
        res.raise_for_status()
        d = res.json()
        temp       = round(d["main"]["temp"],       1)
        feels_like = round(d["main"]["feels_like"], 1)
        humidity   = int(d["main"]["humidity"])
        wind_speed = round(d["wind"]["speed"],      1)
        print(f"[OWM PRIMARY] ({lat},{lon}): {temp}°C feels {feels_like}°C, "
              f"H:{humidity}%, Wind:{wind_speed}m/s")
        return temp, feels_like, humidity, wind_speed, True
    except Exception as e:
        print(f"[OWM PRIMARY ERROR] {e}")
        return None, None, None, None, False


def fetch_uvi_openmeteo(lat: float, lon: float):
    """UVI from Open-Meteo — free, no key needed."""
    try:
        res = requests.get(OPEN_METEO_URL, params={
            "latitude": lat, "longitude": lon,
            "current": ["uv_index"],
            "timezone": "Asia/Kolkata", "forecast_days": 1,
        }, timeout=6)
        res.raise_for_status()
        uvi = round(res.json().get("current", {}).get("uv_index", 0))
        print(f"[UVI] ({lat},{lon}): {uvi}")
        return uvi
    except Exception as e:
        print(f"[UVI ERROR] {e}")
        return _estimate_uvi_by_time()


def _estimate_uvi_by_time():
    """Fallback UVI estimate based on IST hour."""
    hour = datetime.now(IST).hour
    uvi_curve = [0,0,0,0,0,0,1,2,4,6,8,9,10,10,9,7,5,3,1,0,0,0,0,0]
    uvi = uvi_curve[hour]
    print(f"[UVI ESTIMATE] Hour={hour} IST → UVI={uvi}")
    return uvi


def fetch_aqi(lat: float, lon: float):
    """AQI (1=Good … 5=Very Poor) from OWM Air Pollution API."""
    try:
        res = requests.get(OWM_AQI_URL, params={
            "lat": lat, "lon": lon, "appid": OWM_KEY
        }, timeout=5)
        res.raise_for_status()
        aqi = res.json()["list"][0]["main"]["aqi"]
        print(f"[AQI] ({lat},{lon}): {aqi}")
        return aqi
    except Exception as e:
        print(f"[AQI ERROR] {e}")
        return 1


def get_sun_context_for_coords(lat: float, lon: float):
    """
    Sunrise/sunset + current UVI via Open-Meteo (free, no key).
    Replaces the broken OWM onecall-based version from old app.py.
    """
    try:
        res = requests.get(OPEN_METEO_URL, params={
            "latitude":      lat,
            "longitude":     lon,
            "daily":         ["sunrise", "sunset"],
            "timezone":      "Asia/Kolkata",
            "forecast_days": 1,
        }, timeout=6)
        res.raise_for_status()
        daily       = res.json().get("daily", {})
        sunrise_str = daily.get("sunrise", [""])[0]  # e.g. "2024-04-14T06:12"
        sunset_str  = daily.get("sunset",  [""])[0]  # e.g. "2024-04-14T18:47"

        fmt        = "%Y-%m-%dT%H:%M"
        ist_offset = 5.5 * 3600
        now_ts     = time_module.time()
        # Open-Meteo returns IST local strings — convert to UTC epoch for comparison
        sunrise_ts = datetime.strptime(sunrise_str, fmt).timestamp() - ist_offset
        sunset_ts  = datetime.strptime(sunset_str,  fmt).timestamp() - ist_offset

        is_night = now_ts < sunrise_ts or now_ts > sunset_ts
        uvi      = 0 if is_night else fetch_uvi_openmeteo(lat, lon)

        print(f"[SUN] sunrise={sunrise_str}, sunset={sunset_str}, "
              f"is_night={is_night}, uvi={uvi}")
        return {
            "uv":      uvi,
            "isNight": is_night,
            "sunrise": sunrise_str,
            "sunset":  sunset_str,
        }
    except Exception as e:
        print(f"[SUN ERROR] {e}")
        hour     = datetime.now(IST).hour
        is_night = hour < 6 or hour >= 19
        uvi      = 0 if is_night else _estimate_uvi_by_time()
        return {"uv": uvi, "isNight": is_night, "sunrise": None, "sunset": None}


# ══════════════════════════════════════════════════════════════════════════
#  ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/weather", methods=["GET"])
def get_weather():
    city          = request.args.get("city", "Mumbai")
    neighbourhood = request.args.get("neighbourhood", "").strip()

    print(f"\n{'='*60}")
    print(f"[REQUEST] city={city}, neighbourhood='{neighbourhood}'")

    lat, lon, resolved_name = None, None, neighbourhood or city

    if neighbourhood:
        lat, lon, resolved_name = fetch_coordinates(neighbourhood, city)

    if not lat or not lon:
        print(f"[FALLBACK] City-level coords for: {city}")
        lat, lon = fetch_city_coords(city)
        resolved_name = neighbourhood or city

    if not lat or not lon:
        print("[ERROR] No coords. Returning mock.")
        mock = dict(MOCK_WEATHER)
        mock.update({"city": city, "neighbourhood": neighbourhood or city})
        return jsonify(mock)

    print(f"[COORDS] '{resolved_name}' → ({lat}, {lon})")

    # Step 1: OWM primary
    temp, feels_like, humidity, wind_speed, owm_ok = fetch_weather_owm(lat, lon)

    # Step 2: Open-Meteo fallback if OWM fails
    if not owm_ok:
        print("[FALLBACK] OWM failed → trying Open-Meteo...")
        try:
            res = requests.get(OPEN_METEO_URL, params={
                "latitude":        lat,
                "longitude":       lon,
                "current":         [
                    "temperature_2m", "apparent_temperature",
                    "relative_humidity_2m", "wind_speed_10m", "uv_index"
                ],
                "wind_speed_unit": "ms",
                "timezone":        "Asia/Kolkata",
                "forecast_days":   1,
            }, timeout=8)
            res.raise_for_status()
            c          = res.json().get("current", {})
            temp       = round(c.get("temperature_2m",       29.0), 1)
            feels_like = round(c.get("apparent_temperature",  temp), 1)
            humidity   = int(c.get("relative_humidity_2m",    70))
            wind_speed = round(c.get("wind_speed_10m",         2.0), 1)
            uvi        = round(c.get("uv_index",                0))
            aqi        = fetch_aqi(lat, lon)
            print(f"[OPEN-METEO FALLBACK] {temp}°C, H:{humidity}%")
            print(f"{'='*60}\n")
            return jsonify({
                "temp": temp, "feels_like": feels_like,
                "humidity": humidity, "wind_speed": wind_speed,
                "uvi": uvi, "aqi": aqi,
                "city": city, "neighbourhood": resolved_name,
                "lat": lat, "lon": lon,
                "source": "open-meteo-fallback",
            })
        except Exception as e:
            print(f"[OPEN-METEO FALLBACK ERROR] {e}")
            mock = dict(MOCK_WEATHER)
            mock.update({"city": city, "neighbourhood": resolved_name})
            return jsonify(mock)

    # Step 3: UVI (Open-Meteo free)
    uvi = fetch_uvi_openmeteo(lat, lon)

    # Step 4: AQI (OWM)
    aqi = fetch_aqi(lat, lon)

    print(f"[FINAL] {resolved_name}: {temp}°C (feels {feels_like}°C), "
          f"H:{humidity}%, UVI:{uvi}, Wind:{wind_speed}m/s, AQI:{aqi}")
    print(f"{'='*60}\n")

    return jsonify({
        "temp":          temp,
        "feels_like":    feels_like,
        "humidity":      humidity,
        "city":          city,
        "neighbourhood": resolved_name,
        "lat":           lat,
        "lon":           lon,
        "uvi":           uvi,
        "wind_speed":    wind_speed,
        "aqi":           aqi,
        "source":        "owm-live",
    })


@app.route("/api/risk", methods=["POST"])
def get_risk():
    body = request.json

    temp       = body.get("temp",       29)
    feels_like = body.get("feels_like", temp)
    humidity   = body.get("humidity",   70)
    uvi        = body.get("uvi",        6)
    wind_speed = body.get("wind_speed", 2)
    aqi        = body.get("aqi",        1)
    activity   = body.get("activity",   "walking")
    duration   = body.get("duration",   30)
    profile    = body.get("profile",    [])
    pet        = body.get("pet",        None)
    plant_type = body.get("plant_type", None)

    score = calculate_heat_score(
        temp=temp, feels_like=feels_like, humidity=humidity,
        uvi=uvi, wind_speed=wind_speed, aqi=aqi,
        activity=activity, duration=duration, profile=profile
    )
    risk = get_risk_level(score)

    uvi_curve  = [0,0,0,0,0,0,1,2,4,6,8,9,10,10,9,7,5,3,1,0,0,0,0,0]
    temp_curve = [-5,-5,-4,-4,-3,-1,0,2,4,6,7,8,7,6,4,2,1,0,-1,-2,-3,-4,-4,-5]

    hourly_data = []
    for hour in range(24):
        h_temp  = temp + temp_curve[hour]
        h_uvi   = uvi_curve[hour]
        h_score = calculate_heat_score(
            temp=h_temp, feels_like=h_temp + 4, humidity=humidity,
            uvi=h_uvi, wind_speed=wind_speed, aqi=aqi,
            activity=activity, duration=duration, profile=profile
        )
        hourly_data.append({
            "hour":  hour,
            "label": f"{hour % 12 or 12} {'AM' if hour < 12 else 'PM'}",
            "score": h_score,
            "risk":  get_risk_level(h_score),
            "temp":  h_temp,
            "uvi":   h_uvi,
        })

    pet_score = None
    if pet:
        road_temp = round(temp * 1.6 - 6)
        pet_score = round(score * 0.85 + (road_temp - 40) * 0.3) if road_temp > 40 else round(score * 0.75)
        pet_score = max(0, min(100, pet_score))

    return jsonify({
        "score":        score,
        "risk":         risk,
        "suggestion":   get_suggestion(score, risk),
        "pet_advice":   get_pet_advice(score, pet) if pet else None,
        "pet_score":    pet_score,
        "plant_advice": get_plant_advice(score, plant_type) if plant_type else None,
        "safe_windows": hourly_data,
        "road_temp":    round(temp * 1.6 - 6),
        "factors_used": {
            "temperature":  temp,
            "feels_like":   feels_like,
            "humidity":     humidity,
            "uvi":          uvi,
            "wind_speed":   wind_speed,
            "aqi":          aqi,
            "activity":     activity,
            "duration_min": duration,
            "profile":      profile,
        }
    })


@app.route("/api/heatmap", methods=["POST"])
def heatmap():
    if not MUMBAI_HEATMAP_AVAILABLE:
        return jsonify({
            "error": "mumbai_heatmap module not found. "
                     "Create mumbai_heatmap.py with a get_mumbai_heatmap(temp, humidity, profile) function."
        }), 503

    body     = request.json or {}
    temp     = body.get("temp",     36)
    humidity = body.get("humidity", 70)
    profile  = body.get("profile",  [])

    print(f"[HEATMAP] temp={temp}, humidity={humidity}, profile={profile}")
    return jsonify(get_mumbai_heatmap(temp, humidity, profile))


@app.route("/api/chat", methods=["POST"])
def chat():
    body       = request.json or {}
    message    = body.get("message", "").lower()
    temp       = body.get("temp",       29)
    humidity   = body.get("humidity",   70)
    uvi        = body.get("uvi",         6)
    wind_speed = body.get("wind_speed",  2)
    aqi        = body.get("aqi",         1)
    profile    = body.get("profile",    [])

    uvi_curve  = [0,0,0,0,0,0,1,2,4,6,8,9,10,10,9,7,5,3,1,0,0,0,0,0]
    temp_curve = [-5,-5,-4,-4,-3,-1,0,2,4,6,7,8,7,6,4,2,1,0,-1,-2,-3,-4,-4,-5]

    # Parse hour — regex first, then natural-language keywords
    hour  = None
    match = re.search(r'(\d{1,2})\s*(am|pm)?', message)
    if match:
        h   = int(match.group(1))
        mer = match.group(2)
        if mer == "pm" and h != 12:
            h += 12
        elif mer == "am" and h == 12:
            h = 0
        hour = h % 24
    elif "morning"   in message: hour = 7
    elif "afternoon" in message: hour = 14
    elif "evening"   in message: hour = 18
    elif "night"     in message: hour = 21

    if hour is not None:
        h_temp = temp + temp_curve[hour % 24]
        h_uvi  = uvi_curve[hour % 24]
    else:
        hour   = datetime.now(IST).hour
        h_temp = temp + temp_curve[hour]
        h_uvi  = uvi_curve[hour]

    score = calculate_heat_score(
        temp=h_temp, feels_like=h_temp + 4,
        humidity=humidity, uvi=h_uvi,
        wind_speed=wind_speed, aqi=aqi,
        activity="walking", duration=30,
        profile=profile
    )
    risk = get_risk_level(score)

    hr   = hour % 12 or 12
    ampm = "AM" if hour < 12 else "PM"
    when = f"at {hr} {ampm}"

    replies = {
        "low":      f"Yes, safe {when}! Heat score is {score}/100. Stay hydrated.",
        "moderate": f"Possible {when} but be careful. Score {score}/100 — light clothes and carry water.",
        "high":     f"Not recommended {when}. Score {score}/100 is High. Try before 9 AM or after 6 PM.",
        "extreme":  f"Avoid going out {when}. Score {score}/100 is Extreme — heat stroke risk.",
    }

    return jsonify({
        "reply": replies[risk],
        "score": score,
        "risk":  risk,
        "hour":  hour,
    })


@app.route("/api/sun", methods=["GET"])
def get_sun():
    """
    GET /api/sun?lat=19.07&lon=72.87
    Returns sunrise, sunset, isNight, and current UVI.
    Uses Open-Meteo (free) — replaces the broken OWM onecall version.
    """
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except (TypeError, ValueError):
        return jsonify({"error": "lat and lon are required numeric query params"}), 400

    return jsonify(get_sun_context_for_coords(lat, lon))


@app.route("/api/health", methods=["GET"])
def health():
    owm_key_set = bool(OWM_KEY and len(OWM_KEY) > 10)
    return jsonify({
        "status":               "ok",
        "weather_api":          "OWM primary + Open-Meteo fallback",
        "uvi_api":              "open-meteo (free)",
        "aqi_api":              "openweathermap",
        "sun_api":              "open-meteo (free)",
        "owm_api_key":          "configured" if owm_key_set else "MISSING",
        "mumbai_heatmap_ready": MUMBAI_HEATMAP_AVAILABLE,
    })


@app.route("/api/test-geo", methods=["GET"])
def test_geo():
    neighbourhood = request.args.get("neighbourhood", "Borivali")
    city          = request.args.get("city", "Mumbai")

    lat, lon, resolved = fetch_coordinates(neighbourhood, city)
    if not lat:
        return jsonify({"success": False, "error": "Geocoding failed", "neighbourhood": neighbourhood})

    temp, feels_like, humidity, wind_speed, ok = fetch_weather_owm(lat, lon)
    uvi = fetch_uvi_openmeteo(lat, lon)
    aqi = fetch_aqi(lat, lon)

    return jsonify({
        "success":       ok,
        "neighbourhood": neighbourhood,
        "resolved_as":   resolved,
        "coords":        {"lat": lat, "lon": lon},
        "weather": {
            "temp":       temp,
            "feels_like": feels_like,
            "humidity":   humidity,
            "wind_speed": wind_speed,
            "uvi":        uvi,
            "aqi":        aqi,
            "source":     "owm-live",
        }
    })


@app.route("/api/neighbourhoods", methods=["GET"])
def list_neighbourhoods():
    return jsonify({
        "city":           "Mumbai",
        "neighbourhoods": sorted(MUMBAI_NEIGHBOURHOODS.keys()),
        "count":          len(MUMBAI_NEIGHBOURHOODS),
    })


# ══════════════════════════════════════════════════════════════════════════
#  STARTUP
# ══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 9000))
    print(f"[STARTUP] Weather  : OWM primary + Open-Meteo fallback")
    print(f"[STARTUP] UVI/Sun  : Open-Meteo (free, no key)")
    print(f"[STARTUP] OWM key  : {'YES' if OWM_KEY else 'NO — OWM calls will fail'}")
    print(f"[STARTUP] Heatmap  : {'LOADED' if MUMBAI_HEATMAP_AVAILABLE else 'NOT FOUND'}")
    print(f"[STARTUP] Port     : {PORT}")
    app.run(debug=True, port=PORT)