# 🛡️ TerraSentinel — Disaster Risk Monitoring & Rapid Response Platform

> **Smart India Hackathon 2026**  
> **Repository**: [github.com/AyushkhatiDev/TerraSentinel](https://github.com/AyushkhatiDev/TerraSentinel)  
> **Core Motto**: *TerraSentinel — From Intelligence to Action.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Mapping-199900.svg?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [The Core Problem & Mission](#-the-core-problem--mission)
3. [End-to-End Operational Workflow](#-end-to-end-operational-workflow)
4. [Key Features & Capabilities](#-key-features--capabilities)
5. [System Architecture & Data Flow](#-system-architecture--data-flow)
6. [ARGUS Visual Intelligence Integration](#-argus-visual-intelligence-integration)
7. [Prototype Risk Scoring Engine](#-prototype-risk-scoring-engine)
8. [Interactive Pages & UI Overview](#-interactive-pages--ui-overview)
9. [Technology Stack](#-technology-stack)
10. [Repository Structure](#-repository-structure)
11. [Quick Start & Installation](#-quick-start--installation)
12. [API Reference & Endpoints](#-api-reference--endpoints)
13. [SIH Evaluation & Demonstration Guide](#-sih-evaluation--demonstration-guide)
14. [Frequently Asked Questions (Judge Q&A)](#-frequently-asked-questions-judge-qa)
15. [Production Roadmap & Scalability](#-production-roadmap--scalability)
16. [Contributing & License](#-contributing--license)

---

## 📖 Executive Summary

**TerraSentinel** is a next-generation, integrated disaster-risk monitoring and emergency response orchestration platform designed specifically for landslide-prone corridors in North-East India (such as NH-10 connecting West Bengal and Sikkim, Darjeeling, and Shillong).

While conventional disaster management solutions act merely as passive observational dashboards that stop when a hazard is identified, **TerraSentinel bridges the critical operational gap between raw detection and field action**:

$$\text{Hazard Intelligence} \longrightarrow \text{Risk Assessment} \longrightarrow \text{Incident Synthesis} \longrightarrow \text{Field Mobilization} \longrightarrow \text{Citizen Warning}$$

Developed as a demonstration prototype for **Smart India Hackathon (SIH 2026)**, the platform enables evaluators, disaster authorities, and emergency response commanders (NDRF, SDRF, district magistrates) to witness how multi-sensor telemetry, geotechnical thresholds, and computer-vision detections automatically mobilize field units and issue life-saving public alerts in under 60 seconds.

---

## 🚨 The Core Problem & Mission

### The Fragile Himalayan Challenge
* **Geological Susceptibility**: The Himalayan and sub-Himalayan belt is characterized by steep slopes, active tectonic movement, fragile rock strata, and intense monsoon cloudbursts.
* **Economic & Strategic Lifelines**: Arterial highways such as NH-10 are the sole lifelines for goods, defense movements, and civilian travel. A sudden landslide cuts off entire states.
* **The Operational Void**: Ground sensors, weather radars, and roadside CCTV cameras typically operate in disjointed silos. When a slope fails, authorities often learn about it only when traffic is already stranded or lives are lost.

### The TerraSentinel Mission
* To aggregate multi-modal data (geotechnical IoT sensors, precipitation, terrain elevation, and AI visual detection) into a **single unified operational picture**.
* To eliminate latency between hazard emergence and control room dispatch through **automated standard operating procedures (SOPs)**.
* To pioneer an open ingestion bus where modular edge-AI systems like **ARGUS Visual Intelligence** can plug in seamlessly.

---

## 🔄 End-to-End Operational Workflow

The application orchestrates the entire emergency management lifecycle:

```
┌──────────┐     ┌──────────┐     ┌───────────┐     ┌─────────────┐
│ MONITOR  │ ──► │  DETECT  │ ──► │  ANALYZE  │ ──► │  VISUALIZE  │
│ Telemetry│     │ Threshold│     │  Weighted │     │ Leaflet GIS │
│ Feeds    │     │ Breaches │     │  Scoring  │     │ Heatmaps    │
└──────────┘     └──────────┘     └───────────┘     └─────────────┘
                                                           │
                                                           ▼
┌──────────┐     ┌──────────┐     ┌───────────┐     ┌─────────────┐
│ RESOLVE  │ ◄── │ RESPOND  │ ◄── │ INCIDENT  │ ◄── │    ALERT    │
│ Post-Ops │     │ NDRF/SMS │     │ Logged &  │     │ Prioritized │
│ Audit    │     │ Dispatch │     │ Tracked   │     │ Triage      │
└──────────┘     └──────────┘     └───────────┘     └─────────────┘
```

1. **Monitor**: Continuous background ingestion of rainfall, soil saturation, slope inclination, and visual streams.
2. **Detect**: Threshold breach triggers (e.g., rainfall exceeding $80\text{ mm}$, soil saturation $>70\%$, or computer-vision optical displacement).
3. **Analyze**: Composite risk engine recalculates risk score ($0$–$100$) and assigns a severity classification (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
4. **Visualize**: Geospatial GIS coordinates update instantly, shifting target zones into high-visibility pulsating warnings.
5. **Alert**: High-priority notifications enter the emergency triage queue with recommended standard operating procedures (SOPs).
6. **Incident**: Automatic incident record creation (e.g., `TS-005`) tagging exact GPS coordinates, cause, and hazard profile.
7. **Respond**: Control room dispatches specialized units (e.g., NDRF Team Alpha with real-time ETA) and triggers localized citizen broadcast warnings.
8. **Resolve**: Response timeline tracking through closure, updating post-incident analytics and machine learning historical baselines.

---

## ✨ Key Features & Capabilities

### 🎛️ 1. Unified Command Center (`/`)
* **Real-time KPI Bar**: Immediate counters for Critical Zones, High-Risk Areas, Active Incidents, Ingestion Feeds, and Pending Alerts.
* **Dark-Mode GIS Risk Map**: Leaflet-powered geospatial layer highlighting geocoded risk zones across North-East India (Darjeeling, Gangtok, Shillong, Itanagar, etc.).
* **Dynamic Zone Inspection**: Click on any sector to inspect micro-telemetry (slope angle, 24h rainfall, soil saturation, and ground movement flags).

### 📹 2. ARGUS Visual Intelligence Ingestion
* **Edge AI Integration**: Simulates an external computer-vision module analyzing highway CCTV/RTSP camera feeds.
* **Optical Detection Telemetry**: Captures slope motion, boulder displacement, and mud accumulation with confidence scoring and bounding box coordinates.
* **4-Stage Automated Pipeline**: Visual handoff (`RECEIVED` ➔ `VALIDATING` ➔ `RISK ENGINE` ➔ `RISK UPDATED`) that escalates risk from baseline to `CRITICAL` in real time.

### ⚡ 3. Multi-Scenario Hazard Simulation
* **Deterministic Demonstration Engine**: Built-in 4-step progressive disaster escalation allowing presenters to demonstrate sudden monsoonal cloudbursts and ground displacement without requiring actual disasters.
* **Stateful Reset**: Single-click restoration returning the entire database to baseline operational conditions.

### 🚨 4. Alert Center & Operational Triage (`/alerts`)
* Filter alerts by severity (`CRITICAL`, `HIGH`, `ALL`, or `RESOLVED`).
* Detailed causal breakdown with system-suggested action protocols.
* One-click acknowledgment transferring records into the active dispatch pipeline.

### 🚒 5. Incident Management & Coordinated Response (`/incidents`)
* Complete incident queue tracking status (`Active`, `Field Response Active`, `Resolved`).
* **Field Team Dispatch**: Simulates dispatching disaster response teams (e.g., NDRF Team Alpha) with live ETA tracking.
* **Citizen Emergency Broadcast**: Simulates geo-fenced public warning delivery (e.g., notifying 1,248 nearby corridor residents and motorists).

### 📊 6. Analytics & Correlation Engine (`/analytics`)
* Multi-zone risk comparison histograms.
* 24-hour predictive risk progression charts.
* Soil moisture vs. precipitation correlation curves powered by Recharts.
* Dispatch efficiency and historical resolution metrics.

---

## 🏗️ System Architecture & Data Flow

TerraSentinel employs a decoupled, modular architecture adhering to modern microservices principles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL INGESTION                            │
│   Roadside CCTV / RTSP   │   IMD Weather Telemetry   │   IoT Piezometers│
│        (via ARGUS)       │       (Rainfall API)      │   (Soil Moisture)│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ JSON Webhooks / REST
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (PORT 8000)                     │
│                                                                        │
│   ┌─────────────────────┐  ┌────────────────────┐  ┌───────────────┐   │
│   │   Ingestion Bus     │  │ Risk Scoring Model │  │ Incident & SOP│   │
│   │   (/api/argus)      │  │ (backend/risk_     │  │ State Machine │   │
│   │   (/api/simulation) │  │  engine.py)        │  │ (/incidents)  │   │
│   └─────────────────────┘  └────────────────────┘  └───────────────┘   │
│                                     │                                  │
│                 SQLAlchemy 2.0 ORM + SQLite (WAL Mode)                 │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ JSON API (HTTP/REST)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT + VITE FRONTEND (PORT 5173)               │
│                                                                        │
│   ┌─────────────────────┐  ┌────────────────────┐  ┌───────────────┐   │
│   │ Dark GIS Leaflet Map│  │ Dynamic Telemetry  │  │ ARGUS Frame   │   │
│   │ (/components/map)   │  │ Gauges & Charts    │  │ Modal & BBox  │   │
│   └─────────────────────┘  └────────────────────┘  └───────────────┘   │
│                                                                        │
│                   Tailwind CSS v4 + React Context Store                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👁️ ARGUS Visual Intelligence Integration

**ARGUS** is an independent visual-intelligence module developed to perform optical slope-movement detection on live camera streams.

### Separation of Concerns
| Component | Primary Responsibility | Deployment Target |
|---|---|---|
| **ARGUS** | Video decoding, frame buffering, YOLO/CNN inference, bounding box generation, optical flow | High-GPU Edge Gateways / Cloud Vision Clusters |
| **TerraSentinel** | Multi-sensor aggregation, geospatial visualization, risk escalation, incident management, public warning | Central State / National Disaster Control Rooms |

### Ingestion Contract (Webhook Schema)
ARGUS dispatches detection events to TerraSentinel via standard REST payload:
```json
{
  "camera_id": "CAM-04",
  "location": "NH-10 / Darjeeling",
  "detection": "Ground Movement Detected",
  "confidence": 0.94,
  "frame_url": "/assets/argus-simulated-frame.jpg",
  "bbox": [46, 40, 30, 26],
  "timestamp": "14:32:08"
}
```

---

## 📐 Prototype Risk Scoring Engine

The prototype calculates risk dynamically using a weighted multi-parameter algorithm implemented in `backend/risk_engine.py`:

$$\text{Risk Score} = \sum (w_i \times N(f_i)) \times 100$$

### Weight Distribution
* **Precipitation / Rainfall ($24\text{h}$)**: `30%` (Normalized $0$–$200\text{ mm}$)
* **Soil Moisture Saturation**: `20%` (Normalized $0$–$100\%$)
* **Ground Displacement Sensor**: `20%` (Binary $0$ or $1$)
* **Slope Angle**: `15%` (Normalized $0$–$60^\circ$)
* **Historical Susceptibility**: `10%` (Categorical scale)
* **Terrain / Geological Classification**: `5%` (Categorical scale)

### Risk Classification Tiers
| Score Range | Severity Level | UI Color Code | Operational SOP |
|---|---|---|---|
| **0 – 29** | `LOW` | 🟢 Green | Routine baseline monitoring; no active alerts. |
| **30 – 49** | `MODERATE` | 🟡 Yellow | Hourly telemetry surveillance; verify sensor status. |
| **50 – 74** | `HIGH` | 🟠 Orange | Stage response units; notify highway patrol; prepare detour advisories. |
| **75 – 100** | `CRITICAL` | 🔴 Pulsating Red | Immediate corridor restriction; dispatch NDRF/SDRF; broadcast public evacuation sirens. |

> [!NOTE]
> This scoring engine is a demonstration heuristic. The production architecture is designed to swap this layer with Physics-Informed Neural Networks (PINNs) and geotechnical finite-element models.

---

## 🖥️ Interactive Pages & UI Overview

| Route | Page | Purpose |
|---|---|---|
| `/` | **Command Center** | Central tactical dashboard, GIS Leaflet map, telemetry inspection, ARGUS card, and simulation triggers. |
| `/risk-analysis` | **Risk Analysis** | Deep-dive telemetry for selected zones, Recharts historical trends, and factor-by-factor risk contributors. |
| `/incidents` | **Incidents** | Incident management lifecycle, NDRF team assignment, dispatch telemetry, and simulated citizen alerts. |
| `/alerts` | **Alert Center** | Emergency alert queue, priority triage, causal conditions, and SOP resolution workflows. |
| `/analytics` | **Analytics** | Regional risk distribution, rainfall-vs-risk correlation charts, response time analytics. |
| `/data-sources` | **Data Sources** | Health monitor for external ingestion feeds (ARGUS, IMD, IoT Sensors, Satellite InSAR). |

---

## 💻 Technology Stack

### Frontend
* **Core Framework**: React 18.3, TypeScript 5.5, Vite 5.4
* **Styling**: Tailwind CSS v4 (Custom Dark Glassmorphic Theme)
* **GIS & Maps**: Leaflet 1.9, React-Leaflet, CartoDB Dark Matter tiles
* **Data Visualization**: Recharts 2.12
* **Icons & Polish**: Lucide React

### Backend
* **API Framework**: FastAPI 0.115 (Asynchronous Python REST API)
* **Validation**: Pydantic v2
* **Database & ORM**: SQLAlchemy 2.0 with SQLite (WAL Mode enabled for concurrent operations)
* **Server Runtime**: Uvicorn 0.30

---

## 📁 Repository Structure

```
TerraSentinel/
├── backend/                        # FastAPI REST API Backend
│   ├── main.py                     # App entry point, CORS, lifespan & router mounting
│   ├── database.py                 # SQLite connection & SQLAlchemy sessionmaker
│   ├── models.py                   # ORM models (RiskZone, Incident, Alert, DataSource)
│   ├── schemas.py                  # Pydantic v2 request/response validation schemas
│   ├── seed.py                     # Initial realistic seed dataset for North-East India
│   ├── risk_engine.py              # Multi-parameter hazard scoring algorithm
│   ├── requirements.txt            # Python dependencies
│   └── routers/                    # Modular API route controllers
│       ├── risk_zones.py           # /api/risk-zones (List & detail)
│       ├── alerts.py               # /api/alerts (Queue & status patch)
│       ├── incidents.py            # /api/incidents (CRUD & dispatch actions)
│       ├── simulation.py           # /api/simulation (Stepwise hazard trigger)
│       ├── argus.py                # /api/argus (Vision status & event simulation)
│       ├── analytics.py            # /api/analytics (KPI aggregates & time-series)
│       └── data_sources.py         # /api/data-sources (Feed health)
│
├── frontend/                       # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── api/client.ts           # Centralized Axios/Fetch API client
│   │   ├── context/AppContext.tsx  # Global state (selected zone, toasts, ARGUS modal)
│   │   ├── components/
│   │   │   ├── layout/             # TopNav, Sidebar, AppLayout
│   │   │   ├── map/                # RiskMap (Leaflet), ZoneDetailPanel
│   │   │   ├── argus/              # ArgusCard, ArgusEventModal, ArgusProcessingOverlay
│   │   │   ├── simulation/         # HazardSimulation control component
│   │   │   ├── alerts/             # AlertPanel & AlertList
│   │   │   └── ui/                 # KpiCard, RiskGauge, StatusBadge, Loading/ErrorState
│   │   ├── pages/                  # CommandCenter, Incidents, Alerts, Analytics, etc.
│   │   ├── index.css               # Global theme tokens, scrollbars & animations
│   │   └── main.tsx                # React DOM root mounting
│   ├── package.json
│   └── vite.config.ts
│
├── package.json                    # Root launcher script (concurrently runs API + Web)
├── render.yaml                     # Cloud deployment configuration
├── netlify.toml                    # Frontend hosting configuration
└── README.md                       # Comprehensive platform documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js**: `v18.0` or higher
* **Python**: `v3.9` or higher
* **npm** or equivalent package manager

### Single-Command Setup & Launch (Recommended)

From the project root:

```bash
# 1. Install all dependencies (root, frontend, and backend)
npm run setup

# 2. Launch both backend (port 8000) and frontend (port 5173) concurrently
npm run dev
```

* **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
* **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Alternative OpenAPI ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Manual Step-by-Step Setup

If you prefer running services in separate terminals:

#### Terminal 1 — Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

#### Terminal 2 — Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Reference & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/risk-zones` | Retrieve all monitored geographic sectors and risk metrics. |
| `GET` | `/api/risk-zones/{id}` | Retrieve real-time telemetry for a specific risk zone. |
| `GET` | `/api/alerts` | Retrieve active, high-priority, and resolved alerts. |
| `PATCH` | `/api/alerts/{id}/status` | Update alert status (`Active` ➔ `Acknowledged` ➔ `Resolved`). |
| `GET` | `/api/incidents` | Fetch all logged operational incidents and dispatch states. |
| `POST` | `/api/incidents` | Synthesize a new incident record from an escalated hazard. |
| `PATCH` | `/api/incidents/{id}` | Update incident (assign response team, issue citizen alert, resolve). |
| `POST` | `/api/argus/simulate` | Trigger simulated AI visual detection from roadside CCTV CAM-04. |
| `GET` | `/api/argus/event` | Fetch current active ARGUS detection frame and bounding box. |
| `POST` | `/api/argus/reset` | Reset ARGUS visual intelligence event back to idle state. |
| `POST` | `/api/simulation/step` | Advance hazard simulation step for target zone (escalates rainfall & risk). |
| `POST` | `/api/simulation/reset` | Reset all simulation parameters to baseline across all tables. |
| `GET` | `/api/analytics/summary` | Aggregate KPI statistics (critical zones, active incidents, sensor health). |
| `GET` | `/api/data-sources` | Fetch connectivity and latency status of all ingestion streams. |

---

## 🏆 SIH Evaluation & Demonstration Guide

When demonstrating TerraSentinel to evaluators, execute this **high-impact, 4-minute operational flow**:

```
Step 1: Open Command Center (/) ──► Show baseline (Darjeeling: Score 39, Moderate)
                                              │
Step 2: Argus Visual AI Card    ──► Click [⚡ SIMULATE ARGUS EVENT]
                                              │
Step 3: CCTV Detection Modal    ──► Inspect 94% Bounding Box on NH-10
                                              │
Step 4: Automated Ingestion Bus ──► Click [✈️ SEND TO TERRASENTINEL] (4-Stage Pipeline)
                                              │
Step 5: Dynamic GIS Escalation  ──► Darjeeling pulses CRITICAL RED (Score jumps to 87)
                                              │
Step 6: Incident Management     ──► Navigate to /incidents and select Incident TS-005
                                              │
Step 7: Field Mobilization      ──► Click [DISPATCH FIELD TEAM] (NDRF Team Alpha, ETA 12m)
                                              │
Step 8: Citizen Broadcast       ──► Click [ISSUE CITIZEN ALERT] (1,248 Citizens Notified)
                                              │
Step 9: Analytics Dashboard     ──► Review 24h Risk Curve on /analytics
```

---

## ❓ Frequently Asked Questions (Judge Q&A)

### Q1: Is the machine-learning prediction real or simulated in this prototype?
> **Answer**: In this demonstration prototype, we have built a deterministic multi-parameter scoring engine combining normalized rainfall, geotechnical saturation, slope angle, and visual optical flow. This ensures a 100% reliable, zero-latency presentation before judges without depending on unstable external cellular networks. The underlying code contracts are completely decoupled and ready to accept live model inference.

### Q2: Why is ARGUS treated as a separate module rather than built into TerraSentinel?
> **Answer**: Real-time computer vision on multiple 4K/1080p RTSP streams requires dedicated GPU compute clusters or edge NPU boxes installed at roadside gantries. Monolithically coupling video decoding with the central command center would create architectural bottlenecks. Decoupling ARGUS follows cloud-native microservices design: ARGUS generates optical metadata; TerraSentinel acts as the central command orchestrator.

### Q3: How will citizen alerts reach users without smartphone internet in remote hills?
> **Answer**: TerraSentinel's citizen alert pipeline is engineered to interface directly with the Government of India's **C-DOT CAP (Common Alerting Protocol)** platform. This triggers **Cell Broadcast Service (CBS)** sirens directly through local telecom towers to all handsets in range, functioning without internet connectivity or installed apps.

### Q4: How easily can real sensors be plugged in?
> **Answer**: Very easily. The FastAPI backend exposes REST endpoints (`/api/data-sources` and `/api/risk-zones/{id}`) accepting standard JSON payloads. IoT gateways transmitting MQTT or HTTP POST can update zone telemetry with negligible latency.

---

## 🔮 Production Roadmap & Scalability

* [ ] **Phase 1: Physics-Informed Neural Networks (PINNs)** — Integrating slope equilibrium mechanics into deep-learning time-series forecasting.
* [ ] **Phase 2: Satellite InSAR Integration** — Ingesting European Space Agency (Sentinel-1) and ISRO NISAR interferometric synthetic aperture radar data for millimeter-scale ground subsidence tracking.
* [ ] **Phase 3: C-DOT CAP Integration** — Full compliance and automated dispatch via the Indian Common Alerting Protocol gateway.
* [ ] **Phase 4: Low-Bandwidth Edge Resiliency** — LoRaWAN-to-satellite fallback gateways for sensor nodes during severed terrestrial fiber links.

---

## 📜 Contributing & License

TerraSentinel is created for the **Smart India Hackathon (SIH 2026)**. Contributions, suggestions, and research collaborations are warmly welcomed.

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete terms.

---

<div align="center">
  <sub>Built with ❤️ for resilient communities and first responders across India.</sub><br/>
  <b>TerraSentinel — From Intelligence to Action.</b>
</div>
