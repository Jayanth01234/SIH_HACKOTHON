# POLARIS — Digital Twin for Remote Antarctic Operations

[![SIH 2026](https://img.shields.io/badge/SIH--2026-Problem%2026060-0284C7.svg)](https://sih.gov.in)
[![MoES / NCPOR](https://img.shields.io/badge/Organization-MoES%20%2F%20NCPOR-059669.svg)](https://ncpor.res.in)
[![Team InnoByte](https://img.shields.io/badge/Team-InnoByte-7C3AED.svg)](#)
[![Stack](https://img.shields.io/badge/Architecture-FastAPI%20%2B%20React%20%2B%20WebSockets%20%2B%20ML-1E293B.svg)](#)

> **Digital Platform for Efficient Remote Management of Indian Antarctic Research Stations (Maitri & Bharati)**  
> **Problem Statement ID:** 26060 | **Theme:** Smart Automation | **Category:** Software  
> **Target Stations:** Maitri Research Station (70°45'S, 11°44'E) & Bharati Research Station (69°24'S, 76°11'E)

---

## 1. Executive Summary

Operating scientific research bases in Antarctica requires managing extreme isolation, severe katabatic blizzards, constrained satellite bandwidth, and critical life-support dependencies. 

**POLARIS** is not a static weather dashboard or a disconnected series of KPI cards. It is an **Operational Decision-Support Digital Twin** engineered to provide continuous situational awareness and intelligent remote supervision for **Maitri** and **Bharati**.

### The Core Operational Loop

```
REAL / LIVE DATA SOURCE (Open-Meteo & NCPOR Archive)
        ↓
DATA INGESTION & NORMALIZATION
        ↓
VALIDATION & BOUND CHECKS (ISO-8601, Sensor Quality Tags)
        ↓
TIME-SERIES STORAGE (Indexed SQLite WAL / Postgres-ready)
        ↓
DIGITAL TWIN UNIFIED STATE (Environment + Energy + Infra + Logistics)
        ↓
FEATURE ENGINEERING & ML INFERENCE (RandomForest & Weighted Trend Extrapolation)
        ↓
EXPLAINABLE HAZARD DETECTION (Gini Feature Importance & Dynamic Drivers)
        ↓
CROSS-DOMAIN IMPACT ENGINE (Environment → Infrastructure → Energy → Logistics)
        ↓
ALERT GENERATION & DEDUPLICATION (Prioritized Severity Cooldowns)
        ↓
OPERATOR DECISION & RESPONSE (Acknowledge, Investigate, Resolve)
        ↓
MISSION AUDIT TIMELINE LOGGING
        ↓
DIGITAL TWIN STATE UPDATE
```

---

## 2. Key SIH Differentiators

| # | Feature | Operational Capability |
|---|---------|------------------------|
| 1 | **Unified Digital Twin State** | Consolidates Environment, Microgrid, Subsystems, and Logistics into a single stateful object. |
| 2 | **Cross-Domain Causal Engine** | Traces real-time dependency chains: *Blizzard Wind → Structural Stress → Space Heating Surge → Fuel Burn Spike → Autonomy Depletion*. |
| 3 | **Explainable AI (XAI)** | Explains *why* a hazard was predicted with quantified top feature drivers (e.g. *Rapid Pressure Decline Rate -2.8 hPa/hr*). |
| 4 | **Interactive "What-If" Simulator** | Allows remote mission directors to test hypothetical boundary shifts (e.g. *Wind +30%, Temp -6°C, Fuel -15%*) and recalculate physical loads in real time. |
| 5 | **Historical Storm Replay** | Chronological scrubber replaying past polar storms (e.g. Jan 2015 katabatic blizzard) to analyze digital twin evolution. |
| 6 | **Connectivity-Aware Resilience** | Handles polar satellite outages with offline caching, last-known-good state preservation, and automatic queued sync upon reconnection. |
| 7 | **Operator-in-the-Loop Workflow** | Alerts do not end at warnings; operators investigate, acknowledge with operational notes, and record actions in an immutable audit timeline. |
| 8 | **Strict Data Provenance** | Every telemetry item clearly flags its mode: `LIVE`, `PUBLIC_LIVE`, `SIMULATION`, `HISTORICAL`, or `OFFLINE`. |
| 9 | **Automated 12-Step Demo Engine** | One-click button executes a transparent, end-to-end mission scenario from storm build-up to operator resolution. |
| 10 | **Antarctic Map & Station Contrast** | Deep comparative operational analysis between inland oasis (Maitri) and coastal promontory (Bharati). |

---

## 3. Technology Stack

- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, SQLite (WAL mode, timestamp indexed tables), Uvicorn, WebSockets.
- **Machine Learning & Analytics:** Scikit-learn (RandomForestClassifier with Gini feature importance), NumPy, Pandas, Joblib.
- **Frontend:** React 19, Vite, Recharts, Lucide Icons, Vanilla Polar CSS Design Tokens.
- **Ingestion Sources:**
  - *Public Live:* Open-Meteo Antarctic High-Resolution Polar Grid API.
  - *Historical:* National Centre for Polar and Ocean Research (NCPOR) / NPDC AWS Archives (Jan 2015).
  - *Simulation:* Stateful correlated physics generator (state(t+1) = f(state(t), weather_trend, load, noise)).

---

## 4. Quick Start & Execution

### Option A: One-Click Windows Batch Scripts (Recommended)

1. **Start Backend Engine:**
   Double-click `start_backend.bat` or run:
   ```powershell
   .\start_backend.bat
   ```
   *FastAPI server starts at `http://localhost:8000` (Interactive API docs at `/docs`).*

2. **Start Frontend Console:**
   Double-click `start_frontend.bat` or run:
   ```powershell
   .\start_frontend.bat
   ```
   *React Mission Control launches at `http://localhost:5173`.*

---

### Option B: Docker Compose

To launch the full stack in an isolated containerized environment:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### Option C: Manual Setup

#### 1. Backend
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Automated Verification & Testing

POLARIS includes a comprehensive test suite verifying ingestion, validation, microgrid physics, logistics, alert lifecycles, and API endpoints:

```bash
cd backend
python -m pytest
```

Output:
```text
======================= 21 passed in 10.42s =======================
```

---

## 6. Project Structure

```
SIH_HACKOTHON/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints (stations, alerts, simulation, analytics)
│   │   ├── database/        # SQLAlchemy models and SQLite connection
│   │   ├── ingestion/       # Modular ingestion adapters
│   │   ├── ml/              # Feature engineering & ML inference
│   │   ├── models/          # Trained scikit-learn model artifacts
│   │   ├── schemas/         # Pydantic v2 validation contracts
│   │   ├── services/        # Digital twin, microgrid, logistics, cross-domain engines
│   │   ├── storage/         # Observation repository & pandas engine
│   │   ├── config.py        # Central environment configuration
│   │   └── main.py          # FastAPI application & WebSocket broker
│   ├── tests/               # Pytest integration & unit test suite
│   ├── pytest.ini           # Pytest execution configuration
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Backend entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Centerpiece graph, layouts, sparklines
│   │   ├── context/         # Central StationContext with WebSocket syncing
│   │   ├── pages/           # 12 operational mission screens
│   │   ├── services/        # API client
│   │   └── styles/          # Polar mission control design tokens
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   ├── maitri/              # Historical NCPOR AWS observations
│   └── bharati/             # Historical NCPOR AWS observations
│
├── demo/
│   ├── demo-script.md       # 5-minute judge demonstration script
│   └── scenarios/           # Demo scenario descriptors
│
├── docker-compose.yml       # Production container orchestration
├── .env.example             # Documented environment variables
├── start_backend.bat        # Windows one-click backend runner
├── start_frontend.bat       # Windows one-click frontend runner
└── README.md                # Project documentation
```

---

## 7. Operational Integrity & Transparency Statement

- **Government Data Disclaimer:** This prototype uses public polar meteorological data from Open-Meteo, historical AWS datasets published by NCPOR/NPDC, and clearly-labelled physical simulation for station telemetry. It makes no claim of direct unauthorized connectivity to internal NCPOR production intranets.
- **Architectural Readiness:** Ingestion layers implement clean adapter interfaces such that authorized NCPOR telemetry APIs can drop in seamlessly without refactoring core business logic.

---

**Developed for Smart India Hackathon 2026**  
*Team InnoByte — Autonomous & Resilient Polar Systems*
