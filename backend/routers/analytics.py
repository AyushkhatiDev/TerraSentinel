"""
TerraSentinel — Analytics Router
Returns simulated analytics data for charts and KPIs.
Prototype analytics based on simulated operational data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import random

from database import get_db
from models import RiskZone, Incident, Alert
from schemas import AnalyticsSummary, TimeSeriesPoint, RegionRisk

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    zones = db.query(RiskZone).all()
    incidents = db.query(Incident).all()
    alerts = db.query(Alert).all()

    critical_zones = sum(1 for z in zones if z.risk_level == "CRITICAL")
    high_risk = sum(1 for z in zones if z.risk_level in ("HIGH", "CRITICAL"))
    active_incidents = sum(1 for i in incidents if i.status in ("Active", "Monitoring"))
    active_alerts = sum(1 for a in alerts if a.status == "Active")

    return AnalyticsSummary(
        average_response_time=14,
        alerts_generated=len(alerts) + 124,  # Include historical simulated count
        incidents_resolved=94,
        critical_events=critical_zones + 10,  # Include historical
        critical_zones=critical_zones,
        high_risk=high_risk,
        active_incidents=active_incidents,
        active_sensors=42,
        active_alerts=active_alerts,
    )


@router.get("/risk-trend", response_model=List[TimeSeriesPoint])
def get_risk_trend(zone_id: int = 1, db: Session = Depends(get_db)):
    """Risk trend over last 24 hours for a zone (simulated)."""
    zone = db.query(RiskZone).filter(RiskZone.id == zone_id).first()
    current_score = zone.risk_score if zone else 32

    # Generate realistic-looking 24h trend
    hours = list(range(24))
    base_scores = [
        18, 20, 19, 17, 22, 25, 28, 30, 32, 35,
        33, 36, 38, 42, 45, 48, 52, 58, 64, 68,
        72, 78, 85, current_score,
    ]

    # If current score is low, flatten the trend
    if current_score < 40:
        base_scores = [max(10, current_score - 15 + i) for i in range(24)]
        base_scores[-1] = current_score

    return [
        TimeSeriesPoint(
            time=f"{h:02d}:00",
            value=min(100, max(0, base_scores[i])),
        )
        for i, h in enumerate(hours)
    ]


@router.get("/rainfall-risk", response_model=List[TimeSeriesPoint])
def get_rainfall_risk(zone_id: int = 1, db: Session = Depends(get_db)):
    """Rainfall vs risk correlation data (simulated)."""
    zone = db.query(RiskZone).filter(RiskZone.id == zone_id).first()
    current_rainfall = zone.rainfall if zone else 48.0

    data = []
    rainfall_points = [12, 24, 36, 48, 60, 76, 88, 104, 118, 132, 142, current_rainfall]
    for r in sorted(set(rainfall_points)):
        risk = min(100, int(r * 0.55 + 10))
        data.append(TimeSeriesPoint(time=f"{int(r)}mm", value=risk, label=f"{int(r)}mm"))

    return data


@router.get("/incidents-severity", response_model=List[TimeSeriesPoint])
def get_incidents_severity(db: Session = Depends(get_db)):
    """Incidents by severity (simulated)."""
    return [
        TimeSeriesPoint(time="Critical", value=12),
        TimeSeriesPoint(time="High", value=28),
        TimeSeriesPoint(time="Moderate", value=34),
        TimeSeriesPoint(time="Low", value=18),
    ]


@router.get("/response-time", response_model=List[TimeSeriesPoint])
def get_response_time(db: Session = Depends(get_db)):
    """Response time trend (simulated, in minutes)."""
    return [
        TimeSeriesPoint(time="Week 1", value=22),
        TimeSeriesPoint(time="Week 2", value=18),
        TimeSeriesPoint(time="Week 3", value=16),
        TimeSeriesPoint(time="Week 4", value=14),
        TimeSeriesPoint(time="Week 5", value=12),
        TimeSeriesPoint(time="Week 6", value=11),
    ]


@router.get("/region-distribution", response_model=List[RegionRisk])
def get_region_distribution(db: Session = Depends(get_db)):
    """Risk distribution by region."""
    zones = db.query(RiskZone).all()
    return [
        RegionRisk(region=z.name.split("—")[0].strip(), risk_score=z.risk_score, risk_level=z.risk_level)
        for z in zones
    ]
