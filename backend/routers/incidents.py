"""
TerraSentinel — Incidents Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime

from database import get_db
from models import Incident, RiskZone
from schemas import IncidentCreate, IncidentUpdate, IncidentOut

router = APIRouter(prefix="/api", tags=["Incidents"])


@router.get("/incidents", response_model=List[IncidentOut])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.id.desc()).all()


@router.get("/incidents/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.post("/incidents", response_model=IncidentOut)
def create_incident(req: IncidentCreate, db: Session = Depends(get_db)):
    if req.zone_id and not db.query(RiskZone.id).filter(RiskZone.id == req.zone_id).first():
        raise HTTPException(status_code=422, detail="The selected risk zone does not exist")

    # Generate incident code
    count = db.query(Incident).count()
    code = f"TS-{count + 1:03d}"

    incident = Incident(
        incident_code=code,
        location=req.location,
        type=req.type,
        risk_score=req.risk_score,
        severity=req.severity,
        status="Active",
        detected_at=datetime.now().strftime("%H:%M"),
        description=req.description,
        cause=req.cause,
        zone_id=req.zone_id,
    )
    db.add(incident)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not allocate a unique incident code; please retry")
    db.refresh(incident)
    return incident


@router.patch("/incidents/{incident_id}", response_model=IncidentOut)
def update_incident(incident_id: int, req: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)

    db.commit()
    db.refresh(incident)
    return incident
