

<p align="center">
  <img src="https://github.com/user-attachments/assets/1ad82589-6edd-432c-9c49-0f0fdafb6cef" width="900"/>
</p>
<img width="1896" height="901" alt="image" src="https://github.com/user-attachments/assets/772c570a-081f-41ef-a52e-82fff506c7ea" />
# HeatAssist — Urban Heat Risk & Safety Planner

**Team:** HeatAssist  
**Event:** BLITZ Hackathon · IEEE SFIT Student Branch  
**Domain:** Environment & Sustainability

---

## The Problem

Most weather apps only show temperature and humidity. They don’t tell you whether it is actually safe to step outside.

A 35°C day affects people differently based on age, health, and activity. It also affects pets and plants in ways that typical weather apps ignore.

HeatAssist focuses on this gap. It converts raw weather data into a simple decision:

**Is it safe to go out right now or not?**

---

## What HeatAssist Does

HeatAssist gives practical advice instead of just numbers.

- Guidance for people based on age, health conditions, fitness level, and activity
- Pet safety advice such as paw burn risk and safe walking hours
- Plant care advice such as when to water or move to shade
- Best time windows across 24 hours to step outside
- A chat assistant to ask questions in plain language

---

## How the Heat Score Works

The system calculates a heat risk score from 0 to 100 using multiple factors.

| Factor | Source |
|--------|--------|
| Temperature and Feels Like | OpenWeatherMap |
| Humidity | OpenWeatherMap |
| UV Index | Open-Meteo |
| Wind Speed | OpenWeatherMap |
| Air Quality | OWM Air Pollution API |
| Activity and Duration | User input |
| Age and Health | User profile |

The logic is inspired by WBGT, Heat Index models, WHO air quality guidance, and ASHRAE comfort standards.

---

## Features

### Heat Risk Engine

| Score Range | Meaning |
|--------------|---------|
| Below 45 | Safe |
| 45 – 59 | Use caution |
| 60 – 74 | Avoid long exposure |
| 75 and above | Stay indoors |

### 24-Hour Danger Clock
Shows safe and unsafe hours throughout the day with a live indicator.

### Pet Advisor
Estimates ground temperature using:  
`ground_temp = air_temp × 1.6 − 6`

### Plant Advisor
Advises watering time and shade requirement based on heat score.

### Chat Assistant
Example questions:
- Can I go for a run at 2 PM?
- Is it safe to walk my dog now?
- Should I water my plants today?

---

## Mumbai Neighbourhood Coverage

Supports 90+ areas including Borivali, Bandra, Andheri, Powai, Colaba, Thane, Navi Mumbai and more, each mapped to specific coordinates.

---

## System Architecture
Weather APIs (OWM, Open-Meteo, AQI)
↓
Heat Risk Engine
↓
Profile Analyzer
↓
Advisors (time, pet, plant, chat)
↓
Dashboard


---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Python + Flask |
| APIs | OpenWeatherMap, Open-Meteo, OWM AQI |
| Core Logic | heat_engine.py |




---

## Setup Instructions

### Clone the repository

```bash
git clone https://github.com/your-team/urban-heat-app.git
cd urban-heat-app
Backend setup
cd backend
pip install flask flask-cors requests python-dotenv

Create a .env file inside backend:

OWM_API_KEY=your_key_here
PORT=9000

Run the server:

python app.py
Frontend setup
cd frontend
npm install

Create a .env file inside frontend:

VITE_API_URL=http://localhost:9000

Run the frontend:

npm run dev




