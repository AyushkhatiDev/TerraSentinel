# TerraSentinel — Interactive Demo Prototype

> **Smart India Hackathon 2026**  
> **Repository**: [github.com/AyushkhatiDev/TerraSentinel](https://github.com/AyushkhatiDev/TerraSentinel)  
> **Core Motto**: *TerraSentinel — From Intelligence to Action.*

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Executive Summary

TerraSentinel is an interactive disaster-risk monitoring and response prototype created to demonstrate the user-facing and operational workflow of the proposed TerraSentinel platform.

This prototype is designed as a demonstration environment for judges, evaluators and stakeholders. It allows a user to explore a disaster-management command center, inspect risk conditions, simulate a developing hazard, observe the resulting risk escalation, and initiate a simulated emergency response.

The prototype is intentionally focused on demonstrating the experience and workflow of the final system, rather than claiming that every external data source or production AI model has already been integrated.

---

## Quick Start & Setup

### Prerequisites
- **Node.js**: v18.0+
- **Python**: v3.9+
- **npm** or equivalent package manager

### Single-Command Launch (Recommended)

Run the full local environment (FastAPI backend on port 8000 + Vite React frontend on port 5173):

```bash
# One-time setup: installs frontend and backend dependencies
npm run setup

# Start both services concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.  
FastAPI Swagger documentation is accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4 |
| **Maps & GIS** | Leaflet, React-Leaflet, OpenStreetMap Dark Tiles |
| **Charts & Metrics** | Recharts, Lucide Icons |
| **Backend & API** | FastAPI, Uvicorn, Python, Pydantic v2 |
| **Database** | SQLite + SQLAlchemy ORM (prototype persistent state) |

---

## 1. What Is This Prototype?

The current application is a working front-end / decision-support prototype of TerraSentinel.

It demonstrates what a disaster-management authority could see and do from a centralized platform.

The application brings together the major stages of the proposed workflow:

```
MONITOR  ──►  DETECT  ──►  ANALYZE  ──►  VISUALIZE  ──►  ALERT  ──►  INCIDENT  ──►  RESPOND
```

The prototype does not require an actual disaster to occur. Instead, it contains a controlled **Demo / Simulation Mode** that allows the complete workflow to be demonstrated on demand.

---

## 2. Why Was This Prototype Built?

The purpose of the prototype is to answer a practical question:

> *What would TerraSentinel actually look like and how would an authority use it during a developing disaster situation?*

Rather than presenting only architecture diagrams or static designs, this prototype provides an interactive representation of the proposed system.

A judge or evaluator can interact with the application and see:
- Where risks are located
- How severe they are
- What factors contribute to the risk
- How a hazard changes the risk level
- How an alert is generated
- How an incident is created
- How a response team can be dispatched
- How citizen notification can be initiated
- How the event appears in analytics

---

## 3. What the Prototype Is NOT

This is an important distinction.

The current application is **not** a production-ready disaster-warning system. It does not currently claim to provide:
- Official emergency warnings
- Guaranteed landslide prediction
- Live government disaster data
- Live satellite processing
- Live CCTV processing
- Real-world emergency dispatch
- Actual SMS delivery
- Production AI prediction accuracy

Where real-world integrations are not currently available, the prototype uses simulated data and events. This allows the complete workflow to be demonstrated without depending on external infrastructure during the presentation.

---

## 4. Main Prototype Concept

The prototype is built around a simple idea:

> **A hazard signal should not end with detection. It should lead to a decision and an action.**

For example, the prototype can simulate a situation where:

```
Rainfall increases
       ↓
Soil moisture increases
       ↓
Ground movement is detected
       ↓
Risk increases
       ↓
Risk becomes CRITICAL
       ↓
Alert is generated
       ↓
Incident is created
       ↓
Field team is dispatched
```

This is the primary story demonstrated by the software.

---

## 5. Command Center

The **Command Center** (`/`) is the main operational screen of the prototype. It provides a single operational view of the monitored environment:

### Risk Overview (KPI Cards)
Top-level indicators provide an instant situational summary:
- **Critical Zones**: Requiring immediate intervention
- **High-Risk Areas**: Under active surveillance
- **Active Incidents**: Response being coordinated
- **Active Sensors**: Ingestion telemetry health
- **Active Alerts**: Unresolved notifications

### GIS Risk Map
The central interactive map provides geographical visualization of:
- Risk zones across North-East India (Darjeeling, Sikkim, Shillong, Itanagar, etc.)
- Hazard boundaries and severity overlays
- Monitored sensor nodes
- Active incidents and operational markers

Operators can click on any zone on the GIS layer to inspect live conditions and coordinate response.

---

## 6. Risk Levels

The prototype categorizes locations into four standardized risk levels:

| Level | Score Range | Color Indicator | Operational Meaning |
|---|---|---|---|
| **LOW** | 0 – 29 | Green | Standard baseline monitoring |
| **MODERATE** | 30 – 49 | Amber | Elevated environmental thresholds |
| **HIGH** | 50 – 74 | Orange | Active surveillance & preparedness |
| **CRITICAL** | 75 – 100 | Red | Immediate evacuation & field dispatch |

The visual map uses these colors to make the risk level immediately understandable at a glance.

---

## 7. Location Details

When an operator selects a monitored location, the prototype provides detailed telemetry.

For example:
```
DARJEELING — ZONE 04

Risk Score:        72 / 100
Risk Level:        HIGH

Rainfall:          118 mm / 24h
Soil Moisture:     84%
Slope:             34°
Ground Movement:   Detected
```

Additional telemetry includes historical susceptibility and terrain-related risk indicators. This allows the operator to understand not only *where* the risk is, but *what factors* are driving the score.

---

## 8. Prototype Risk Assessment

The prototype includes a simplified risk-assessment mechanism combining multiple simulated factors:
- Rainfall (mm / 24h)
- Soil moisture saturation (%)
- Slope angle (°)
- Ground movement sensors (Normal / Detected)
- Historical risk factor
- Terrain risk factor

These values produce a demonstrative risk score on a **0–100 scale**.

> [!NOTE]
> **Important**: This scoring system is a prototype demonstration mechanism. It is not presented as the final scientifically validated landslide-prediction model. In future implementations, this layer will incorporate validated AI/ML models, historical geological datasets, and real-time sensor streams.

---

## 9. Hazard Simulation

The **Hazard Simulation** is the central interactive feature of the prototype. It allows the presenter to demonstrate a developing disaster scenario on demand without requiring external live conditions.

The simulation begins with a normal baseline:
- Risk Score: `32`
- Risk Level: `LOW`
- Rainfall: `48 mm`
- Soil Moisture: `52%`
- Ground Movement: `Normal`

When the simulation runs, the system introduces progressively worsening conditions:
```
Rainfall:         48 mm  ──►  76 mm  ──►  112 mm  ──►  142 mm
Soil Moisture:    52%    ──►  67%   ──►  79%    ──►  91%
Ground Movement:  Normal ──►  Normal ──►  Normal ──►  Detected
Risk Score:       32     ──►  51    ──►  72     ──►  91
Risk Level:       LOW    ──►  MOD   ──►  HIGH   ──►  CRITICAL
```

---

## 10. What Happens When Risk Becomes Critical?

Once the simulated event reaches the critical state, the prototype demonstrates the next stage of the operational workflow:
1. Updates the risk score and classification
2. Updates the GIS map (Darjeeling turns pulsating red)
3. Generates a critical alert in the alert queue
4. Creates an incident candidate in Incident Management
5. Recommends response actions
6. Enables control-room field dispatch
7. Enables simulated citizen notification

```
Risk Information  ──►  Operational Action
```

---

## 11. Alert Center

The **Alert Center** (`/alerts`) provides a centralized queue of generated alerts containing:
- Severity classification
- Specific geographic location
- Timestamp and risk score
- Detected conditions
- Recommended standard operating procedures (SOPs)
- Telemetry source attribution (including ARGUS Visual Intelligence)

Example alert:
```
🚨 CRITICAL HAZARD DETECTED
Darjeeling — Zone 04
Risk Score: 91 / 100
Condition: Ground Movement + Heavy Rainfall
Recommended: Dispatch Field Team, Restrict Affected Corridor, Notify Nearby Communities
Source: Simulated In Prototype
```

Operators can acknowledge alerts or convert them into active operational cases.

---

## 12. Incident Management

The **Incident Management** page (`/incidents`) represents the operational execution stage following alert generation.

Each incident tracks:
- **Incident ID** (e.g. `TS-001`, `TS-005`)
- **Location**
- **Hazard Type** (e.g. Potential Landslide, Slope Instability)
- **Severity**
- **Detection Time & Risk Score**
- **Status** (Active, Monitoring, Resolved)
- **Response Timeline**

---

## 13. Field Response

The prototype demonstrates control-room field team dispatch:

```
CRITICAL INCIDENT  ──►  DISPATCH FIELD TEAM  ──►  FIELD RESPONSE ACTIVE
```

The interface updates live to show:
- Assigned Response Unit (e.g., *NDRF Team Alpha*)
- Real-time ETA (e.g., *12 minutes*)
- Operational Status (*En Route / Responding*)

---

## 14. Citizen Alert

The prototype features a simulated public warning workflow:

When the operator clicks **ISSUE CITIZEN ALERT**, the application simulates the emergency broadcast:
```
CITIZEN ALERT
Location: Darjeeling — Zone 04
Risk: CRITICAL
Message: High landslide risk detected. Avoid the affected corridor and follow local authority instructions.
Recipients: 1,248 nearby users notified
Status: ALERT ISSUED (Simulated)
```

---

## 15. ARGUS Integration

ARGUS is a **separate, independent visual-intelligence module** from the TerraSentinel web prototype. The actual ARGUS system is demonstrated independently during the SIH evaluation.

Within TerraSentinel, ARGUS is represented as an external visual-intelligence source to demonstrate how an external camera system contributes to risk assessment:

```
CCTV / RTSP Streams
        ↓
      ARGUS (External Visual Intelligence Module)
        ↓
Visual Detection Event (Ground Movement Detected, 94% confidence, CAM-04)
        ↓
  TerraSentinel API
        ↓
   Risk Engine
        ↓
Critical Alert & Incident
        ↓
 Coordinated Response
```

The standalone ARGUS project provides capabilities such as multi-camera RTSP ingestion, visual detection, event logging, and webhook notifications.

---

## 16. ARGUS Inside the Prototype

TerraSentinel does not run the physical ARGUS video ingestion engine internally. Instead, it represents the integration point.

The prototype displays live telemetry cards:
```
ARGUS VISUAL INTELLIGENCE
External AI Module · Simulated
Status:            ● CONNECTED
Cameras:           04 Connected
RTSP Streams:      04 Active
Latest Detection:  Ground Movement Detected
Confidence:        94%
Location:          NH-10 / Darjeeling
Timestamp:         14:32:08
Indicator:         ● OUTPUT READY
```

This communicates clearly to judges:  
*“This is where ARGUS connects to TerraSentinel.”*

---

## 17. ARGUS Event Flow

During the prototype presentation, clicking **SIMULATE ARGUS EVENT** triggers:

```
ARGUS EVENT
     ↓
VIEW ARGUS EVENT (CCTV Frame, CAM-04, 94% Bounding Box)
     ↓
SEND TO TERRASENTINEL
     ↓
ARGUS EVENT RECEIVED ──► VALIDATING EVENT ──► RISK ENGINE ANALYSIS ──► RISK UPDATED
     ↓
Risk: 32 / 100 (LOW)  ════►  87 / 100 (CRITICAL)
     ↓
GIS Map Zone 1 turns Red  ──►  Alert Generated  ──►  Incident Created
```

---

## 18. Why ARGUS Is Separate

ARGUS is maintained as an independent module because it has its own dedicated computer-vision pipeline (RTSP streams, frame buffering, model inference, bounding boxes).

TerraSentinel does not duplicate ARGUS's internal engine:
- **ARGUS provides visual intelligence.**
- **TerraSentinel uses that intelligence for risk evaluation, spatial analysis, and response orchestration.**

This modular architecture allows other sensor and satellite feeds to plug into TerraSentinel with zero disruption.

---

## 19. Analytics

The **Analytics** dashboard (`/analytics`) aggregates data across all monitored zones:
- 24-hour risk escalation trends
- Rainfall versus risk correlation curves
- Incident breakdown by severity
- Average response times and dispatch telemetry
- Regional risk distribution across North-East India

---

## 20. Data Sources

The **Data Sources** page (`/data-sources`) visualizes the ingestion pipeline health:
- **ARGUS Visual Intelligence**: External AI camera feed
- **IMD Weather Data**: Precipitation and atmospheric telemetry
- **Soil Moisture Sensors**: Sub-surface geotechnical sensors
- **Satellite Remote Sensing**: InSAR / optical displacement data
- **GIS / DEM Terrain Data**: Slope and elevation maps
- **Citizen Reports**: Crowdsourced hazard telemetry

---

## 21. Demo Mode Controls

Demo controls allow reliable reproduction during hackathon presentations:
- **Simulate Hazard Event**: Multi-step environmental escalation
- **Simulate ARGUS Event**: External AI visual detection flow
- **View ARGUS Event**: Inspect live surveillance capture and bounding box
- **Send to TerraSentinel**: Animated 4-step ingestion pipeline
- **Reset Demo**: Clean restoration back to initial baseline

---

## 22. Complete Presentation Scenario (30–60 Seconds)

1. **Step 1 — Open Command Center**: Show overall situational picture and active zones.
2. **Step 2 — Select a Location**: Choose Darjeeling (Zone 04) showing baseline conditions.
3. **Step 3 — Show ARGUS Card**: Highlight the connected external visual intelligence module.
4. **Step 4 — Click Simulate ARGUS Event**: Open the simulated CCTV surveillance frame.
5. **Step 5 — Click Send to TerraSentinel**: Observe the 4-step pipeline overlay (`RECEIVED → VALIDATING → RISK ENGINE → RISK UPDATED`).
6. **Step 6 — Observe Live Escalation**: Watch risk score jump from `32/LOW` to `87/CRITICAL`.
7. **Step 7 — Observe GIS Map**: Zone turns critical red with pulsating indicator.
8. **Step 8 — View Alert Queue**: Review newly generated critical alert.
9. **Step 9 — Open Incident**: Inspect incident candidate `TS-005` tagged with `Detection Source: ARGUS`.
10. **Step 10 — Dispatch Field Team**: Click `Dispatch Field Team` and confirm active dispatch status.
11. **Step 11 — Issue Citizen Alert**: Broadcast simulated warning to 1,248 nearby residents.
12. **Step 12 — Review Analytics**: Show updated trends in the analytics dashboard.

---

## 23. What Is Actually Being Demonstrated?

1. **Situational Awareness**: Centralized real-time operational dashboard.
2. **Risk Assessment**: Multi-parameter risk calculation combining sensor and vision data.
3. **Geospatial Intelligence**: Clear GIS mapping of hazard zones.
4. **Decision Support**: Transforming data points into actionable SOPs.
5. **Response Coordination**: Full lifecycle from detection to field deployment.

---

## 24. What Is Simulated?

For presentation integrity, the following are simulated in this prototype:
- Weather and rainfall telemetry
- Geotechnical soil-moisture sensor readings
- Ground-movement sensor triggers
- CCTV/RTSP live camera streaming
- Real-world emergency dispatch and SMS gateways

---

## 25. Future Implementation Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REAL DATA INGESTION                             │
│  ARGUS (CCTV) │ Weather APIs │ IoT Sensors │ Satellites │ Field Reports│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AI / ML RISK ENGINE                             │
│  Physics-Informed Neural Networks │ Spatial ML │ Multi-Sensor Fusion   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TERRASENTINEL PLATFORM                          │
│  Command Center │ GIS Mapping │ Automated Alerts │ Response Dispatch   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Prototype Limitations

- Demonstration risk scoring (not a certified geological model)
- Simulated environmental and sensor events
- Mocked emergency broadcast and response dispatch
- No direct connection to live government networks

---

## 27. Why the Prototype Is Valuable

The prototype demonstrates the most critical aspect of the platform: **how raw intelligence turns into action**.

Judges do not need to imagine what happens after a sensor or camera flags a hazard. They can see the complete end-to-end response in under 60 seconds.

---

## 28. Judge Q&A Guide

- **“What have you actually built?”**  
  *“A functional decision-support command center that demonstrates the complete operational lifecycle: monitoring, risk analysis, GIS mapping, alert generation, incident creation, and response coordination.”*

- **“Is the data real?”**  
  *“The current prototype runs on controlled simulated data to guarantee reliable presentation. The architecture is built with standard REST/JSON contracts ready to ingest real sensor streams.”*

- **“Is ARGUS integrated?”**  
  *“ARGUS is an independent visual-intelligence module demonstrated separately. TerraSentinel represents and simulates its ingestion point to show how visual hazard detections feed the central risk engine.”*

- **“What happens after detection?”**  
  *“TerraSentinel never stops at detection. It re-evaluates risk, maps the affected area, alerts operators, logs an incident, dispatches field response teams, and broadcasts public warnings.”*

---

## 29. Core Message

> **“TerraSentinel transforms disaster intelligence into an actionable operational response.”**  
> *“We don't just detect the hazard — we show what happens next.”*

---

## 30. Prototype Status

- **Status**: Functional Demonstration Prototype
- **Focus**: Disaster Risk Monitoring, Early Warning & Operational Response
- **Event**: Smart India Hackathon (SIH) 2026
- **Architecture**: Modular Multi-Tier (FastAPI + React + ARGUS Integration)

---

## 31. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
