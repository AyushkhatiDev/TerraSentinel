"""
TerraSentinel — Simulation Router
Handles hazard simulation and reset for demo purposes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import RiskZone, Incident, Alert, DataSource, SimulationState
from schemas import SimulationRequest, SimulationResponse, RiskZoneOut, AlertOut, IncidentOut
from risk_engine import calculate_risk
from seed import seed_database

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

# Values used by the four-stage, judge-friendly demo sequence. The displayed
# score is always recalculated by the documented prototype risk engine.
SIMULATION_STEPS = [
    {"rainfall": 76.0, "soil_moisture": 67.0, "ground_movement": False},
    {"rainfall": 112.0, "soil_moisture": 79.0, "ground_movement": False},
    {"rainfall": 142.0, "soil_moisture": 91.0, "ground_movement": False},
    {"rainfall": 168.0, "soil_moisture": 96.0, "ground_movement": True},
]


def _incident_code(db: Session) -> str:
    """Generate the next readable prototype code from the persisted records."""
    latest = db.query(Incident.id).order_by(Incident.id.desc()).first()
    return f"TS-{((latest[0] if latest else 0) + 1):03d}"


def _response(zone: RiskZone, state: SimulationState, *, alert=None, incident=None) -> SimulationResponse:
    _score, _level, actions = calculate_risk(
        zone.rainfall, zone.soil_moisture, zone.slope,
        zone.ground_movement, zone.historical_risk, zone.terrain_risk,
    )
    return SimulationResponse(
        zone=RiskZoneOut.model_validate(zone),
        alert=AlertOut.model_validate(alert) if alert else None,
        incident_candidate=IncidentOut.model_validate(incident) if incident else None,
        recommended_actions=actions,
        simulation_step=state.current_step,
        is_complete=state.completed,
    )


@router.get("/status", response_model=SimulationResponse)
def simulation_status(zone_id: int = 1, db: Session = Depends(get_db)):
    """Return durable simulation progress so a refreshed UI resumes correctly."""
    zone = db.get(RiskZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Risk zone not found")
    state = db.get(SimulationState, zone_id) or SimulationState(
        zone_id=zone_id, current_step=0, completed=False,
    )
    return _response(zone, state)


@router.post("/hazard", response_model=SimulationResponse)
def simulate_hazard(req: SimulationRequest, db: Session = Depends(get_db)):
    """
    Run one step of the hazard simulation.
    Each call advances the simulation by one step.
    """
    zone_id = req.zone_id
    zone = db.get(RiskZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Risk zone not found")

    state = db.get(SimulationState, zone_id)
    if not state:
        state = SimulationState(zone_id=zone_id, current_step=0, completed=False)
        db.add(state)
        db.flush()
    current_step = state.current_step

    if current_step >= len(SIMULATION_STEPS):
        return _response(zone, state)

    # Apply simulation step
    step_data = SIMULATION_STEPS[current_step]
    zone.rainfall = step_data["rainfall"]
    zone.soil_moisture = step_data["soil_moisture"]
    zone.ground_movement = step_data["ground_movement"]
    zone.updated_at = datetime.now()

    # Recalculate risk
    score, level, actions = calculate_risk(
        zone.rainfall, zone.soil_moisture, zone.slope,
        zone.ground_movement, zone.historical_risk, zone.terrain_risk,
    )
    zone.risk_score = score
    zone.risk_level = level

    # Update prediction
    if level == "CRITICAL":
        zone.prediction = f"CRITICAL — Landslide conditions detected (risk {score}/100)"
    elif level == "HIGH":
        zone.prediction = "HIGH — Landslide conditions developing"
    elif level == "MODERATE":
        zone.prediction = "MODERATE — Conditions deteriorating"
    else:
        zone.prediction = "Monitoring — moderate susceptibility"

    # On final step (CRITICAL), create the alert and candidate exactly once.
    alert = None
    incident = None
    is_final = current_step == len(SIMULATION_STEPS) - 1

    if is_final and level in ("CRITICAL", "HIGH"):
        # Create critical alert
        alert = Alert(
            severity="CRITICAL",
            location=zone.name,
            message=f"High probability of landslide detected. Risk score: {score}/100. Immediate action required.",
            recommendation="Restrict access and dispatch response team immediately. Issue citizen warning.",
            status="Active",
            zone_id=zone_id,
            created_at=datetime.now(),
        )
        db.add(alert)

        # Create incident candidate
        incident = Incident(
            incident_code=_incident_code(db),
            location=zone.name,
            type="Landslide",
            risk_score=score,
            severity="CRITICAL",
            status="Active",
            detected_at=datetime.now().strftime("%H:%M"),
            description=f"Critical landslide risk detected in {zone.name}. Risk score: {score}/100.",
            cause="Heavy Rainfall + Ground Movement + High Slope",
            zone_id=zone_id,
        )
        db.add(incident)

    state.current_step = current_step + 1
    state.completed = is_final
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(zone)
    db.refresh(state)
    if alert:
        db.refresh(alert)
    if incident:
        db.refresh(incident)

    return _response(zone, state, alert=alert, incident=incident)


@router.post("/reset")
def reset_simulation(db: Session = Depends(get_db)):
    """Reset the simulation to initial state by re-seeding the database."""
    # Clear all tables and re-seed
    db.query(Alert).delete()
    db.query(Incident).delete()
    db.query(SimulationState).delete()
    db.query(RiskZone).delete()
    db.query(DataSource).delete()
    db.commit()

    seed_database(db)

    return {"status": "ok", "message": "Simulation reset to initial state"}
