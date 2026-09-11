"""
TerraSentinel — Alerts Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Alert
from schemas import AlertCreate, AlertOut

router = APIRouter(prefix="/api", tags=["Alerts"])


@router.get("/alerts", response_model=List[AlertOut])
def list_alerts(status: str = None, severity: str = None, db: Session = Depends(get_db)):
    query = db.query(Alert).order_by(Alert.id.desc())
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    return query.all()


@router.post("/alerts", response_model=AlertOut)
def create_alert(req: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(
        severity=req.severity,
        location=req.location,
        message=req.message,
        recommendation=req.recommendation,
        status="Active",
        zone_id=req.zone_id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/alerts/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: int,
    status: str = "Acknowledged",
    db: Session = Depends(get_db),
):
    if status not in {"Active", "Acknowledged", "Resolved"}:
        raise HTTPException(status_code=422, detail="Status must be Active, Acknowledged, or Resolved")
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = status
    db.commit()
    db.refresh(alert)
    return alert
