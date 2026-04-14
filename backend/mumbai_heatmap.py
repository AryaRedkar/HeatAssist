"""
mumbai_heatmap.py
-----------------
Generates heat-risk data for Mumbai's key regions/neighborhoods.
Used by app.py via the /api/heatmap endpoint.

HOW TO USE:
  1. Place this file in your backend/ folder alongside app.py and heat_engine.py
  2. In app.py, add:
       from mumbai_heatmap import get_mumbai_heatmap
  3. Register the route in app.py:
       @app.route("/api/heatmap", methods=["POST"])
       def heatmap():
           body = request.json
           base_temp = body.get("temp", 36)
           humidity  = body.get("humidity", 70)
           profile   = body.get("profile", [])
           return jsonify(get_mumbai_heatmap(base_temp, humidity, profile))
  4. The React component calls POST /api/heatmap with { temp, humidity, profile }
     and receives a list of region objects.
"""

from heat_engine import calculate_heat_score, get_risk_level, get_suggestion

# Mumbai neighborhoods with approximate lat/lng and a
# relative heat offset vs city-average (urban heat island effect,
# proximity to sea, green cover, etc.)
MUMBAI_REGIONS = [
    {"name": "Colaba",           "lat": 18.9067, "lng": 72.8147, "offset":  1, "zone": "South"},
    {"name": "Nariman Point",    "lat": 18.9256, "lng": 72.8242, "offset":  0, "zone": "South"},
    {"name": "Fort",             "lat": 18.9340, "lng": 72.8355, "offset":  2, "zone": "South"},
    {"name": "Bandra (W)",       "lat": 19.0596, "lng": 72.8295, "offset": -1, "zone": "West"},
    {"name": "Juhu",             "lat": 19.1075, "lng": 72.8263, "offset": -2, "zone": "West"},
    {"name": "Andheri (W)",      "lat": 19.1197, "lng": 72.8464, "offset":  2, "zone": "West"},
    {"name": "Andheri (E)",      "lat": 19.1136, "lng": 72.8697, "offset":  4, "zone": "East"},
    {"name": "Borivali",         "lat": 19.2307, "lng": 72.8567, "offset": -1, "zone": "North"},
    {"name": "Malad",            "lat": 19.1871, "lng": 72.8487, "offset":  1, "zone": "North"},
    {"name": "Goregaon",         "lat": 19.1663, "lng": 72.8526, "offset":  2, "zone": "North"},
    {"name": "Dahisar",          "lat": 19.2516, "lng": 72.8569, "offset": -2, "zone": "North"},
    {"name": "Kurla",            "lat": 19.0726, "lng": 72.8794, "offset":  5, "zone": "East"},
    {"name": "Ghatkopar",        "lat": 19.0863, "lng": 72.9083, "offset":  5, "zone": "East"},
    {"name": "Mulund",           "lat": 19.1726, "lng": 72.9563, "offset":  4, "zone": "East"},
    {"name": "Thane (border)",   "lat": 19.1988, "lng": 72.9718, "offset":  6, "zone": "East"},
    {"name": "Chembur",          "lat": 19.0522, "lng": 72.8994, "offset":  4, "zone": "East"},
    {"name": "Sion",             "lat": 19.0414, "lng": 72.8636, "offset":  3, "zone": "Central"},
    {"name": "Dadar",            "lat": 19.0178, "lng": 72.8478, "offset":  3, "zone": "Central"},
    {"name": "Worli",            "lat": 19.0069, "lng": 72.8176, "offset":  0, "zone": "South"},
    {"name": "Lower Parel",      "lat": 18.9985, "lng": 72.8331, "offset":  3, "zone": "Central"},
    {"name": "Dharavi",          "lat": 19.0422, "lng": 72.8544, "offset":  6, "zone": "Central"},
    {"name": "Versova",          "lat": 19.1325, "lng": 72.8103, "offset": -3, "zone": "West"},
    {"name": "Powai",            "lat": 19.1197, "lng": 72.9080, "offset":  2, "zone": "East"},
    {"name": "Vikhroli",         "lat": 19.1030, "lng": 72.9260, "offset":  4, "zone": "East"},
]


def get_mumbai_heatmap(base_temp: float, humidity: float, profile: list) -> dict:
    """
    Returns heatmap data for all Mumbai regions.

    Parameters
    ----------
    base_temp : float   City-level temperature in °C (from OWM for Mumbai)
    humidity  : float   Relative humidity %
    profile   : list    User vulnerability factors (same as /api/risk)

    Returns
    -------
    dict with keys:
        regions : list[dict]   Per-region heat data
        summary : dict         City-wide stats
    """
    regions_data = []
    scores = []

    for r in MUMBAI_REGIONS:
        temp = round(base_temp + r["offset"], 1)
        # Use activity="sitting" and duration=30 as neutral baseline
        score = calculate_heat_score(temp, humidity, "sitting", 30, profile)
        risk  = get_risk_level(score)

        regions_data.append({
            "name":       r["name"],
            "lat":        r["lat"],
            "lng":        r["lng"],
            "zone":       r["zone"],
            "temp":       temp,
            "score":      score,
            "risk":       risk,
            "suggestion": get_suggestion(score, risk),
        })
        scores.append(score)

    risk_counts = {"low": 0, "moderate": 0, "high": 0, "extreme": 0}
    for rd in regions_data:
        risk_counts[rd["risk"]] += 1

    summary = {
        "avg_score":   round(sum(scores) / len(scores)),
        "max_score":   max(scores),
        "min_score":   min(scores),
        "risk_counts": risk_counts,
        "hottest":     max(regions_data, key=lambda x: x["score"])["name"],
        "coolest":     min(regions_data, key=lambda x: x["score"])["name"],
    }

    return {"regions": regions_data, "summary": summary}
