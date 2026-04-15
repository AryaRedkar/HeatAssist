HeatAssist — Urban Heat Risk & Safety Planner
Team: HeatAssist
Event: BLITZ Hackathon · IEEE SFIT Student Branch
Domain: Environment & Sustainability

The Problem
Weather apps only tell you the temperature. They don't tell you if you should actually step outside.

If you're older, pregnant, or have health issues — the same 35°C day affects you differently than a healthy college student. Same for your dog's paws. Same for your balcony plants.

HeatAssist fills that gap. It takes raw weather data and gives you a straight answer: Should you go out or not?

What It Does
Instead of just showing numbers, HeatAssist gives personalized advice:

For you — based on age, health conditions, fitness level, pregnancy

For your pet — paw burn risk, safe walking hours

For your plants — when to water, when to move to shade

Best time to go out — across all 24 hours

Chat assistant — ask "Can I run at 2 PM?" and get an answer

How It Works (The Science Behind It)
The heat score (0 to 100) combines multiple factors:

Factor	Where it comes from
Temperature + "Feels like"	OpenWeatherMap
Humidity	OpenWeatherMap
UV Index	Open-Meteo
Wind speed	OpenWeatherMap
Air Quality (AQI)	OWM Air Pollution API
Activity level	You tell us
Duration outside	You tell us
Age, health, fitness	Your profile
We also reference standard heat safety models — WBGT (ISO 7933), NWS Heat Index, WHO air quality guidelines, and ASHRAE 55 for wind cooling.

Features
Personalized Heat Risk Engine
Gives a score 0-100 with clear bands:

<45 Low → Safe to go out

45-59 Moderate → Caution

60-74  High → Avoid long exposure

≥75 Extreme → Stay indoors

24-Hour Danger Clock
A visual clock showing safe hours (green) vs dangerous hours (red). Live needle shows current time.
Pet Advisor
Estimates ground temperature (air temp × 1.6 - 6) and warns if pavement will burn paws. Suggests best walking windows.
Plant Advisor
Tells you when to water and when to bring plants inside based on heat score.
Chatbot
Ask normal questions like:

"Can I go for a run at 2 PM?"

"Is it safe to walk my dog right now?"

"Should I water my plants today?"

Gets a straight answer.

🗺️ Works for 90+ Mumbai Neighbourhoods
Borivali, Bandra, Powai, Lower Parel, Andheri, Colaba, Thane, Navi Mumbai — each with its own coordinates and weather.

How We Built It
Architecture Overview
text
Weather Data (OWM + Open-Meteo + AQI API)
        ↓
Heat Risk Engine (calculates 0-100 score)
        ↓
Profile Analyzer (adjusts for age/health/pet/plant)
        ↓
Advisors (time windows, pet, plant, chat)
        ↓
Dashboard (what you see)
Tech Stack
Layer	What we used
Frontend	React.js + Vite
Styling	Tailwind CSS
Backend	Python + Flask
Weather APIs	OpenWeatherMap, Open-Meteo (UV), OWM Air Pollution
Logic	Python (heat_engine.py)
Chat	Rule-based + time-aware Flask route
Project Structure
text
urban-heat-app/
│
├── backend/
│   ├── app.py              # Main Flask server
│   ├── heat_engine.py      # Heat score logic
│   ├── requirements.txt
│   └── .env                # API keys
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API calls
│   │   ├── components/     # HeatClock, RiskCard, etc.
│   │   ├── pages/          # Home, Dashboard, Chat
│   │   └── App.jsx
│   └── .env
│
└── README.md
Setup Instructions
What you need
Python 3.8+

Node.js 18+

Free OpenWeatherMap API key

Steps
1. Clone the repo

bash
git clone https://github.com/your-team/urban-heat-app.git
cd urban-heat-app
2. Backend

bash
cd backend
pip install flask flask-cors requests python-dotenv
Create backend/.env:

text
OWM_API_KEY=your_key_here
PORT=9000
Run it:

bash
python app.py
You should see:

text
[STARTUP] Weather source: OWM + Open-Meteo
[STARTUP] Running on http://localhost:9000
3. Frontend

bash
cd frontend
npm install
Create frontend/.env:

text
VITE_API_URL=http://localhost:9000
Run it:

bash
npm run dev
Open http://localhost:5173

API Endpoints
Method	Endpoint	What it does
GET	/api/weather?city=Mumbai&neighbourhood=Borivali	Get weather for a neighbourhood
POST	/api/risk	Calculate heat risk score
POST	/api/chat	Chatbot response
GET	/api/health	Check if server is running
GET	/api/neighbourhoods	List all Mumbai neighbourhoods
GET	/api/test-geo?neighbourhood=Bandra	Debug pipeline
Example /api/risk request
json
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
Example /api/chat request
json
{
  "message": "Can I go for a run at 2 PM?",
  "temp": 33,
  "humidity": 44,
  "uvi": 6,
  "wind_speed": 1.4,
  "aqi": 3,
  "profile": []
}
Mumbai Neighbourhoods Supported
90+ areas including: Borivali, Kandivali, Malad, Goregaon, Andheri, Bandra, Juhu, Powai, Dadar, Worli, Lower Parel, Colaba, Thane, Navi Mumbai, Kharghar, Virar, Nalasopara, Kalyan, Panvel.

Team
HeatAssist
BLITZ Hackathon · IEEE SFIT Student Branch & WIE
Domain: Environment & Sustainability
