"""
TerraSentinel — Risk Zones Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import RiskZone
from schemas import RiskZoneOut, RiskAnalyzeRequest, RiskAnalyzeResponse
from risk_engine import calculate_risk

router = APIRouter(prefix="/api", tags=["Risk Zones"])


@router.get("/risk-zones", response_model=List[RiskZoneOut])
def list_risk_zones(db: Session = Depends(get_db)):
    return db.query(RiskZone).all()


@router.get("/risk-zones/{zone_id}", response_model=RiskZoneOut)
def get_risk_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(RiskZone).filter(RiskZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Risk zone not found")
    return zone


@router.post("/risk/analyze", response_model=RiskAnalyzeResponse)
def analyze_risk(req: RiskAnalyzeRequest):
    score, level, actions = calculate_risk(
        rainfall=req.rainfall,
        soil_moisture=req.soil_moisture,
        slope=req.slope,
        ground_movement=req.ground_movement,
        historical_risk=req.historical_risk,
        terrain_risk=req.terrain_risk,
    )
    return RiskAnalyzeResponse(
        risk_score=score,
        risk_level=level,
        recommended_actions=actions,
    )
