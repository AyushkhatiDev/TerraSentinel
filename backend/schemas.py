"""
TerraSentinel — Pydantic Schemas
Request/response models for all API endpoints.
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Literal
from datetime import datetime


# ── Risk Zone ──────────────────────────────────────────────

class RiskZoneOut(BaseModel):
    id: int
    name: str
    region: str
    latitude: float
    longitude: float
    risk_score: int
    risk_level: str
    rainfall: float
    soil_moisture: float
    slope: float
    ground_movement: bool
    historical_risk: str
    terrain_risk: str
    cctv_status: str
    prediction: str
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Risk Analysis ──────────────────────────────────────────

class RiskAnalyzeRequest(BaseModel):
    rainfall: float = Field(ge=0, le=500)
    soil_moisture: float = Field(ge=0, le=100)
    slope: float = Field(ge=0, le=90)
    ground_movement: bool
    historical_risk: str = "Low"
    terrain_risk: str = "Low"


class RiskAnalyzeResponse(BaseModel):
    risk_score: int
    risk_level: str
    recommended_actions: List[str]


# ── Incident ──────────────────────────────────────────────

class IncidentCreate(BaseModel):
    location: str = Field(min_length=2, max_length=200)
    type: str = Field(min_length=2, max_length=100)
    risk_score: int = Field(default=0, ge=0, le=100)
    severity: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"] = "HIGH"
    description: str = Field(default="", max_length=2000)
    cause: str = Field(default="", max_length=200)
    zone_id: int = Field(default=0, ge=0)


class IncidentUpdate(BaseModel):
    status: Optional[Literal["Active", "Monitoring", "Field Response Active", "Resolved"]] = None
    team_assigned: Optional[str] = Field(default=None, max_length=100)
    team_eta: Optional[str] = Field(default=None, max_length=50)
    citizen_alert_sent: Optional[bool] = None
    citizen_alert_count: Optional[int] = Field(default=None, ge=0, le=10_000_000)
    severity: Optional[Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]] = None


class IncidentOut(BaseModel):
    id: int
    incident_code: str
    location: str
    type: str
    risk_score: int
    severity: str
    status: str
    detected_at: str
    description: str
    cause: str
    team_assigned: str
    team_eta: str
    citizen_alert_sent: bool
    citizen_alert_count: int
    zone_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Alert ──────────────────────────────────────────────────

class AlertCreate(BaseModel):
    severity: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    location: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=2, max_length=4000)
    recommendation: str = Field(default="", max_length=2000)
    zone_id: int = Field(default=0, ge=0)


class AlertOut(BaseModel):
    id: int
    severity: str
    location: str
    message: str
    recommendation: str
    status: str
    zone_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Data Source ────────────────────────────────────────────

class DataSourceOut(BaseModel):
    id: int
    name: str
    type: str
    source: str
    status: str
    mode: str
    active_count: int
    last_updated: Optional[datetime] = None
    metadata_info: str

    model_config = ConfigDict(from_attributes=True)


# ── Simulation ─────────────────────────────────────────────

class SimulationRequest(BaseModel):
    zone_id: int = Field(default=1, ge=1)  # Default to Darjeeling Zone 04


class SimulationResponse(BaseModel):
    zone: RiskZoneOut
    alert: Optional[AlertOut] = None
    incident_candidate: Optional[IncidentOut] = None
    recommended_actions: List[str]
    simulation_step: int
    is_complete: bool


# ── ARGUS Visual Intelligence ─────────────────────────────

class ArgusStatusOut(BaseModel):
    status: str
    mode: str
    cameras: int
    cameras_online: int
    last_detection: Optional[str] = None
    last_detection_at: Optional[str] = None
    confidence: Optional[float] = None
    active_event: bool = False


class ArgusEventOut(BaseModel):
    event_id: str
    detection: str
    confidence: float
    camera: str
    location: str
    timestamp: str
    zone_id: int
    frame_url: str
    risk_score: int
    risk_level: str
    alert_id: Optional[int] = None
    incident_code: Optional[str] = None


# ── Analytics ──────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    average_response_time: int
    alerts_generated: int
    incidents_resolved: int
    critical_events: int
    critical_zones: int
    high_risk: int
    active_incidents: int
    active_sensors: int
    active_alerts: int


class TimeSeriesPoint(BaseModel):
    time: str
    value: float
    label: Optional[str] = None


class RegionRisk(BaseModel):
    region: str
    risk_score: int
    risk_level: str


# ── Health ────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    database: str
