# 🌡️ HeatAssist — Personalized Urban Heat Risk & Safety Planner

> **Team HeatAssist** · BLITZ Hackathon · IEEE SFIT Student Branch  
> Domain: Environment & Sustainability

---

## 📌 Problem Statement

Urban heat is a growing public health crisis — but most weather apps only show temperature. They don't tell **you**, specifically, whether it's safe to go outside based on your health, your pet, or your plants.

**HeatAssist** solves this by turning raw weather data into personalized, actionable safety decisions.

---

## 💡 What It Does

HeatAssist analyzes real-time weather conditions and user-specific factors to determine safe outdoor activity levels. It goes beyond generic weather apps to give:

- ✅ **Is it safe for YOU** — based on age, health, fitness, pregnancy
- ✅ **Is it safe for your PET** — paw burn risk, walking time windows
- ✅ **Is it safe for your PLANTS** — watering schedule, shade advice
- ✅ **Best time slots** to go out across the full 24-hour day
- ✅ **Chat assistant** for instant decisions ("Can I run at 2 PM?")

---

## 🧩 Core Features

### 🔥 Personalized Heat Risk Engine
Calculates a **0–100 heat score** using a weighted composite index inspired by:
- **WBGT** (Wet Bulb Globe Temperature) — ISO 7933 / NIOSH occupational health standard
- **Heat Index** (Steadman 1979 / NWS) — apparent temperature from temp + humidity
- **WHO Air Quality Guidelines 2021** — AQI amplifies heat stress
- **ASHRAE 55** — wind cooling factor
- **IPCC AR6** — UV Index radiant heat risk

| Factor | Source |
|--------|--------|
| Temperature + Feels Like | OWM real-time station data |
| Humidity | OWM |
| UV Index | Open-Meteo (free) |
| Wind Speed | OWM |
| Air Quality (AQI) | OWM Air Pollution API |
| Activity level | User input |
| Duration of exposure | User input |
| Age, health, fitness, profession | User profile |

### ⏰ 24-Hour Heat Danger Clock
Visual clock dial showing safe/dangerous hours at a glance — green arcs are safe, red arcs are extreme. Includes a live needle showing the current time.

### 🐶 Pet Advisor
- Estimates **road surface temperature** (`temp × 1.6 - 6`)
- Warns when pavement is too hot for paws
- Suggests safest walking windows

### 🌿 Plant Advisor
- Recommends watering times based on heat score
- Advises when to move plants to shade or indoors

### 💬 Heat Chatbot
Ask natural questions like:
- *"Can I go for a run at 2 PM?"*
- *"Is it safe to walk my dog this evening?"*
- *"Is it safe right now?"*

Gets a risk-score-based reply instantly.

### 🗺️ Neighbourhood-Level Accuracy
Supports **90+ Mumbai neighbourhoods** with precise lat/lon coordinates — Borivali, Bandra, Powai, Lower Parel, and more. Weather is fetched for your exact area, not just the city.

---

## 🏗️ System Architecture

```
Data Layer
├── OpenWeatherMap API       ← Primary weather (real IMD station data)
├── Open-Meteo API           ← UV Index (free, no key)
├── OWM Air Pollution API    ← AQI
└── User Profile             ← Age, health, profession, pet, plant

Engine Layer
├── Weather Module           ← Fetches + resolves neighbourhood coords
├── Heat Risk Engine         ← Calculates 0-100 score
└── Profile Analyzer         ← Applies personal vulnerability factors

Advisory Layer
├── Time Window Analyzer     ← 24-hour safe slot calculator
├── Pet Advisor              ← Paw burn + walk time logic
├── Plant Advisor            ← Shade + watering recommendations
└── Suggestion Aggregator    ← Combined output to dashboard
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Backend | Python + Flask |
| Weather API | OpenWeatherMap (primary) |
| UV Index | Open-Meteo (free) |
| AQI | OWM Air Pollution API |
| Logic | Python (heat_engine.py) |
| Chat | Rule-based + time-aware Flask route |

---

## 📁 Project Structure

```
urban-heat-app/
│
├── backend/
│   ├── app.py               # Flask app — all API routes
│   ├── heat_engine.py       # Heat score algorithm (scientific basis)
│   ├── requirements.txt
│   └── .env                 # OWM_API_KEY, PORT
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js     # fetchWeather, fetchRisk, fetchChat
│   │   ├── components/
│   │   │   ├── HeatClock.jsx
│   │   │   ├── RiskCard.jsx
│   │   │   ├── PetAdvisor.jsx
│   │   │   └── PlantAdvisor.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx     # 3-step onboarding wizard
│   │   │   ├── Dashboard.jsx
│   │   │   └── Chat.jsx
│   │   └── App.jsx
│   └── .env                 # VITE_API_URL
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org))

---

### 1. Clone the repository

```bash
git clone https://github.com/your-team/urban-heat-app.git
cd urban-heat-app
```

---

### 2. Backend setup

```bash
cd backend
pip install flask flask-cors requests python-dotenv
```

Create `backend/.env`:
```
OWM_API_KEY=your_openweathermap_key_here
PORT=9000
```

Start the server:
```bash
python app.py
```

You should see:
```
[STARTUP] Weather source: OWM primary + Open-Meteo UVI fallback
[STARTUP] OWM_API_KEY: YES
[STARTUP] Running on http://localhost:9000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:9000
```

Start the dev server:
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?city=Mumbai&neighbourhood=Borivali` | Fetch real-time weather for a neighbourhood |
| POST | `/api/risk` | Calculate heat risk score + safe windows |
| POST | `/api/chat` | Chatbot — parse time from message, return risk reply |
| GET | `/api/health` | Server health check |
| GET | `/api/neighbourhoods` | List all supported Mumbai neighbourhoods |
| GET | `/api/test-geo?neighbourhood=Bandra&city=Mumbai` | Diagnostic pipeline test |

### Sample `/api/risk` request body
```json
{
  "temp": 33,
  "feels_like": 38,
  "humidity": 44,
  "uvi": 6,
  "wind_speed": 1.4,
  "aqi": 3,
  "activity": "walking",
  "duration": 30,
  "profile": ["age_50_plus"],
  "pet": "dog",
  "plant_type": "outdoor"
}
```

### Sample `/api/chat` request body
```json
{
  "message": "Can I go for a run at 2 PM?",
  "temp": 33,
  "humidity": 44,
  "uvi": 6,
  "wind_speed": 1.4,
  "aqi": 3,
  "profile": []
}
```

---

## 📊 Heat Score Bands

| Score | Risk Level | Meaning |
|-------|-----------|---------|
| < 45 | 🟢 Low | Safe to go out |
| 45–59 | 🟡 Moderate | Caution advised |
| 60–74 | 🟠 High | Avoid prolonged exposure |
| ≥ 75 | 🔴 Extreme | Stay indoors |

---

## 🌍 Supported Neighbourhoods (Mumbai)

90+ neighbourhoods including: Borivali, Kandivali, Malad, Goregaon, Andheri, Bandra, Juhu, Powai, Dadar, Worli, Lower Parel, Colaba, Thane, Navi Mumbai, Kharghar, Virar, Nalasopara, Kalyan, Panvel, and many more.

Full list available at: `GET /api/neighbourhoods`

---

## 🚀 Deployment

### Backend — Render (free)
1. Push `backend/` to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set environment variables: `OWM_API_KEY`, `PORT=9000`
4. Build command: `pip install -r requirements.txt`
5. Start command: `python app.py`

### Frontend — Vercel (free)
1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## 👥 Team

**Team HeatAssist** — BLITZ Hackathon, IEEE SFIT Student Branch & WIE  
Domain: Environment & Sustainability

---

## 📄 License

MIT License — free to use, modify, and distribute.
