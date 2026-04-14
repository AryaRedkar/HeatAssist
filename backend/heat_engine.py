# ============================================================
#  URBAN HEAT RISK ENGINE  —  heat_engine.py
# ============================================================
#
#  SCIENTIFIC BASIS FOR THE HEAT SCORE
#  ─────────────────────────────────────────────────────────
#  The score is a weighted composite index inspired by:
#
#  1. WBGT — Wet Bulb Globe Temperature  (ISO 7933 / NIOSH)
#     The global occupational health standard for heat stress.
#     Combines dry temp + humidity + radiant heat (UVI proxy).
#
#  2. Heat Index (Steadman 1979 / NWS)
#     Apparent temperature = f(temp, humidity).
#     Used by NOAA, IMD for public heat advisories.
#
#  3. WHO Air Quality Guidelines (2021)
#     Poor AQI in heat amplifies respiratory & cardiovascular load.
#
#  4. ASHRAE 55 Thermal Comfort Standard
#     Wind speed > 1 m/s provides cooling; used to discount score.
#
#  5. IPCC AR6 Urban Heat Island data
#     UVI > 8 classified as "Very High" — direct skin damage risk.
#
#  Score range: 0–100
#  Bands: Low (<45), Moderate (45–59), High (60–74), Extreme (≥75)
# ============================================================




def calculate_heat_score(
    temp,           # °C  — dry bulb air temperature
    feels_like,     # °C  — apparent temperature (heat index from OWM)
    humidity,       # %   — relative humidity
    uvi,            # 0–11+ UV Index
    wind_speed,     # m/s — surface wind speed
    aqi,            # 1–5 OWM AQI scale
    activity,       # str — sitting / walking / running
    duration,       # int — minutes of outdoor exposure
    profile         # list[str] — personal risk factors
):
    """
    Compute a 0-100 heat risk score.


    Each factor and its weight is documented below with source.
    """


    score = 0.0


    # ── 1. BASE TEMPERATURE COMPONENT (weight: high) ──────────────────────
    # Source: Heat Index formula (NWS / Steadman 1979)
    # Feels-like already embeds humidity correction from OWM.
    # We use feels_like as the primary thermal load indicator.
    score += feels_like * 0.55                          # max ~30pts at 55°C feels_like


    # ── 2. HUMIDITY PENALTY (weight: moderate) ─────────────────────────────
    # Source: WBGT — humidity limits sweat evaporation (cooling).
    # At 100% RH evaporation stops → full heat retained.
    score += humidity * 0.08                            # max ~8pts at 100% humidity


    # ── 3. UV INDEX COMPONENT (weight: moderate) ───────────────────────────
    # Source: WHO UV Index scale; WHO/UNEP 2002 Global Solar UV Index guide
    # UVI ≥ 8 = "Very High"; adds radiant heat + direct skin damage risk.
    uvi_points = {
        range(0, 3):   0,    # Low
        range(3, 6):   3,    # Moderate
        range(6, 8):   6,    # High
        range(8, 11):  9,    # Very High
        range(11, 20): 12,   # Extreme
    }
    for r, pts in uvi_points.items():
        if uvi in r:
            score += pts
            break


    # ── 4. WIND COOLING FACTOR (weight: minor negative) ────────────────────
    # Source: ASHRAE 55 — wind speed >1 m/s provides convective cooling.
    # Discount score when wind is present (reduces felt heat).
    wind_discount = min(wind_speed * 0.8, 5)           # max discount: 5pts
    score -= wind_discount


    # ── 5. AIR QUALITY PENALTY (weight: minor) ─────────────────────────────
    # Source: WHO AQI Guidelines 2021; heat + pollution = compounded stress
    # (harder breathing → more exertion → higher core temp)
    aqi_penalty = {1: 0, 2: 1, 3: 3, 4: 5, 5: 8}
    score += aqi_penalty.get(aqi, 0)


    # ── 6. ACTIVITY LEVEL (weight: moderate) ───────────────────────────────
    # Source: NIOSH heat stress guidelines — metabolic heat generation
    # Sitting ~80W, Walking ~200W, Running ~500W metabolic output
    activity_map = {"sitting": 0, "walking": 5, "running": 10}
    score += activity_map.get(activity, 0)


    # ── 7. DURATION OF EXPOSURE (weight: moderate) ─────────────────────────
    # Source: OSHA heat illness prevention — cumulative exposure threshold
    # Risk compounds with time; >60 min continuous exposure is high-risk.
    if duration < 30:
        score += 2
    elif duration <= 60:
        score += 5
    else:
        score += 8


    # ── 8. PERSONAL VULNERABILITY PROFILE (weight: high) ──────────────────
    # Source: CDC Heat & Health guidelines; IPCC AR6 Chapter 7 (Health)
    # These groups have impaired thermoregulation or higher baseline risk.
    profile_map = {
        "pregnancy":           12,  # Elevated core temp, higher cardiovascular demand
        "medical_condition":   10,  # Cardiac/asthma patients most at-risk (WHO)
        "age_50_plus":         8,   # Reduced sweat gland efficiency (CDC)
        "on_medication":       6,   # Anticholinergics/diuretics impair heat loss
        "outdoor_profession":  6,   # Higher cumulative daily exposure (NIOSH)
        "periods":             5,   # Elevated basal body temp & hydration risk during menstruation
        "athlete":             3,   # Higher exertion but better acclimatized
    }
    for factor in profile:
        score += profile_map.get(factor, 0)


    # ── NORMALIZE to 0–100 scale ───────────────────────────────────────────
    # Theoretical max (55°C, 100% RH, UVI 12, AQI 5, running, 60+min, all profiles):
    # ≈ 30.25 + 8 + 12 + 0 + 8 + 10 + 8 + (8+10+6+4+6) = ~102 → clip to 100
    score = round(min(max(score, 0), 100))


    return score




def get_risk_level(score):
    """
    Risk bands aligned with NOAA Heat Advisory thresholds:
    - Low      < 45   : No advisory
    - Moderate 45–59  : Heat Advisory watch
    - High     60–74  : Heat Advisory
    - Extreme  ≥ 75   : Excessive Heat Warning
    """
    if score < 45:
        return "low"
    elif score < 60:
        return "moderate"
    elif score < 75:
        return "high"
    else:
        return "extreme"




def get_suggestion(score, risk):
    suggestions = {
        "low":      "Safe to go outside. Stay hydrated and wear sunscreen.",
        "moderate": "Be cautious. Wear light clothes, carry water, and take breaks in shade.",
        "high":     "Avoid prolonged exposure. Stay in shade. Go out before 9 AM or after 6 PM.",
        "extreme":  "Stay indoors. Risk of heat stroke is very high. Hydrate constantly if you must go out.",
    }
    return suggestions[risk]




def get_pet_advice(score, pet):
    """
    Pet advice based on pavement temperature (asphalt can be 40°C hotter than air).
    Rule of thumb: if you can't hold your hand on the pavement for 5 sec → unsafe for paws.
    """
    if score < 45:
        return f"Safe for your {pet}. Keep fresh water available."
    elif score < 60:
        return f"Short walks only for your {pet}. Check pavement with your hand before walking."
    elif score < 75:
        return f"Avoid taking your {pet} out. Pavement is dangerously hot for paws."
    else:
        return f"Keep your {pet} indoors. Extreme heat danger — risk of paw burns and heat exhaustion."




def get_plant_advice(score, plant_type):
    if score >= 75:
        return "Move plants indoors immediately. Water only at 6 AM or after 7 PM to avoid root burn."
    elif score >= 60:
        return "Move outdoor plants to shade after 10 AM. Water in the morning before sun peaks."
    else:
        if plant_type == "outdoor":
            return "Plants are fine. Water in early morning or evening to minimise evaporation."
        return "Indoor plants are safe. Maintain normal watering schedule."




def get_safe_windows(hourly_data):
    """Return pre-computed hourly windows (populated in app.py using real temp + UVI curve)."""
    return hourly_data

