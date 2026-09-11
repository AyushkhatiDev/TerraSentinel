"""
TerraSentinel — ARGUS Visual Intelligence Router
Simulated integration with the external ARGUS AI/CCTV visual
intelligence module. Follows the simulation.py pattern.

ARGUS is an independent external module: it watches CCTV / RTSP
feeds, detects slope movement, and hands a validated detection
event to TerraSentinel for risk scoring and response orchestration.
"""

import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import RiskZone, Incident, Alert, DataSource
from schemas import ArgusEventOut, ArgusStatusOut
from risk_engine import get_risk_level

router = APIRouter(prefix="/api/argus", tags=["ARGUS Visual Intelligence"])

# In-memory ARGUS event state (prototype — no DB model required).
# Kept alongside the module-level state so a page refresh still sees it.
ARGUS_FRAME_URL = "/argus/cam04-frame.png"

_state = {
    "active": False,
    "event": None,
    "counter": 0,
    "previous_zone": None,
    "previous_datasource_metadata": None,
    "created_alert_id": None,
    "created_incident_id": None,
}


def _next_incident_code(db: Session) -> str:
    """Generate the next readable prototype code from the persisted records."""
    latest = db.query(Incident.id).order_by(Incident.id.desc()).first()
    return f"TS-{((latest[0] if latest else 0) + 1):03d}"


def _build_event(event_id: str, db: Session) -> ArgusEventOut:
    zone = db.get(RiskZone, 1)
    return ArgusEventOut(
        event_id=event_id,
        detection="Ground Movement Detected",
        confidence=0.94,
        camera="CAM-04",
        location="Darjeeling — NH-10",
        timestamp=datetime.now().strftime("%H:%M:%S"),
        zone_id=1,
        frame_url=ARGUS_FRAME_URL,
        risk_score=zone.risk_score if zone else 87,
        risk_level=zone.risk_level if zone else "CRITICAL",
        alert_id=_state["created_alert_id"],
        incident_code=_state.get("incident_code"),
    )


@router.get("/status", response_model=ArgusStatusOut)
def argus_status(db: Session = Depends(get_db)):
    """Return ARGUS module status: connectivity, cameras, last detection."""
    argus = db.query(DataSource).filter(DataSource.name.like("%ARGUS%")).first()
    cameras = argus.active_count if argus else 4
    if _state["active"]:
        last_detection = _state["event"].detection if _state["event"] else "Ground Movement Detected"
        last_detection_at = _state["event"].timestamp if _state["event"] else None
        confidence = _state["event"].confidence if _state["event"] else 0.94
    else:
        last_detection = None
        last_detection_at = None
        confidence = None
    return ArgusStatusOut(
        status="Connected",
        mode="Simulated",
        cameras=cameras,
        cameras_online=cameras,
        last_detection=last_detection,
        last_detection_at=last_detection_at,
        confidence=confidence,
        active_event=_state["active"],
    )


@router.get("/event", response_model=Optional[ArgusEventOut])
def argus_event():
    """Return the current ARGUS event details, or null when idle."""
    if not _state["active"]:
        return None
    return _state["event"]


@router.post("/simulate", response_model=ArgusEventOut)
def argus_simulate(db: Session = Depends(get_db)):
    """
    Trigger a simulated ARGUS visual detection event.

    Applies the detection to Zone 1 (Darjeeling — NH-10), creates a CRITICAL
    alert sourced from ARGUS and a matching incident, and stores the
    detection event in-memory so the UI can present the full flow.
    """
    zone = db.get(RiskZone, 1)
    if not zone:
        raise HTTPException(status_code=404, detail="Risk zone not found")

    _state["counter"] += 1
    event_id = f"ARG-2026-0{140 + _state['counter']:03d}"

    # Remember the prior zone so reset restores the exact original state.
    _state["previous_zone"] = {
        "risk_score": zone.risk_score,
        "risk_level": zone.risk_level,
        "rainfall": zone.rainfall,
        "soil_moisture": zone.soil_moisture,
        "ground_movement": zone.ground_movement,
        "prediction": zone.prediction,
        "updated_at": zone.updated_at,
    }

    # ARGUS visual detection applied to Zone 1.
    zone.rainfall = 156.0
    zone.soil_moisture = 92.0
    zone.ground_movement = True
    zone.risk_score = 87
    zone.risk_level = get_risk_level(87)
    zone.prediction = "CRITICAL — ARGUS visual detection: slope movement on NH-10 corridor"
    zone.updated_at = datetime.now()

    # CRITICAL alert with ARGUS as the source.
    alert = Alert(
        severity="CRITICAL",
        location="Darjeeling — NH-10",
        message="🚨 CRITICAL HAZARD DETECTED — ARGUS visual detection: Ground Movement detected on NH-10 corridor (CAM-04, 94% confidence). Current risk: 87/100 (CRITICAL).",
        recommendation="Dispatch field team and restrict affected corridor. Review visual feed CAM-04 for further movement.",
        status="Active",
        zone_id=zone.id,
        created_at=datetime.now(),
    )
    db.add(alert)

    # Matching incident.
    incident = Incident(
        incident_code=_next_incident_code(db),
        location="Darjeeling — NH-10",
        type="Potential Landslide",
        risk_score=87,
        severity="CRITICAL",
        status="Active",
        detected_at=datetime.now().strftime("%H:%M"),
        description="ARGUS visual detection identified Ground Movement at Darjeeling — NH-10 corridor. Detection Source: ARGUS. Evidence: Ground Movement Detected. Risk score: 87/100.",
        cause="ARGUS Visual Detection",
        zone_id=zone.id,
    )
    db.add(incident)

    # Update the ARGUS DataSource record metadata.
    argus = db.query(DataSource).filter(DataSource.name.like("%ARGUS%")).first()
    if argus:
        _state["previous_datasource_metadata"] = argus.metadata_info
        argus.last_updated = datetime.now()
        argus.metadata_info = json.dumps({
            "module": "EXTERNAL AI MODULE",
            "confidence": 0.96,
            "detection": "Ground movement detected",
            "event_id": event_id,
            "camera": "CAM-04",
            "location": "Darjeeling — Zone 04",
            "note": "ARGUS is an independent AI/CCTV visual intelligence module feeding TerraSentinel.",
        })

    db.commit()
    db.refresh(zone)
    db.refresh(alert)
    db.refresh(incident)

    _state["created_alert_id"] = alert.id
    _state["created_incident_id"] = incident.id
    _state["incident_code"] = incident.incident_code
    _state["event"] = _build_event(event_id, db)
    _state["active"] = True

    return _state["event"]


@router.post("/reset")
def argus_reset(db: Session = Depends(get_db)):
    """Clear the ARGUS event state and restore the pre-event snapshot."""
    if not _state["active"]:
        return {"status": "idle", "message": "No active ARGUS event"}

    zone = db.get(RiskZone, 1)
    prev = _state["previous_zone"]
    if zone and prev:
        zone.risk_score = prev["risk_score"]
        zone.risk_level = prev["risk_level"]
        zone.rainfall = prev["rainfall"]
        zone.soil_moisture = prev["soil_moisture"]
        zone.ground_movement = prev["ground_movement"]
        zone.prediction = prev["prediction"]
        zone.updated_at = datetime.now()

    if _state["created_alert_id"]:
        db.query(Alert).filter(Alert.id == _state["created_alert_id"]).delete()
    if _state["created_incident_id"]:
        db.query(Incident).filter(Incident.id == _state["created_incident_id"]).delete()

    argus = db.query(DataSource).filter(DataSource.name.like("%ARGUS%")).first()
    if argus and _state["previous_datasource_metadata"]:
        argus.metadata_info = _state["previous_datasource_metadata"]

    db.commit()

    _state["active"] = False
    _state["event"] = None
    _state["previous_zone"] = None
    _state["previous_datasource_metadata"] = None
    _state["created_alert_id"] = None
    _state["created_incident_id"] = None
    _state["incident_code"] = None

    return {"status": "idle", "message": "ARGUS event reset — original state restored"}