"""
TerraSentinel — SQLAlchemy ORM Models
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base


class RiskZone(Base):
    __tablename__ = "risk_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW")
    rainfall = Column(Float, default=0.0)
    soil_moisture = Column(Float, default=0.0)
    slope = Column(Float, default=0.0)
    ground_movement = Column(Boolean, default=False)
    historical_risk = Column(String(20), default="Low")
    terrain_risk = Column(String(20), default="Low")
    cctv_status = Column(String(20), default="Online")
    prediction = Column(String(200), default="Normal conditions")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(20), unique=True, nullable=False)
    location = Column(String(200), nullable=False)
    type = Column(String(100), nullable=False)
    risk_score = Column(Integer, default=0)
    severity = Column(String(20), default="LOW")
    status = Column(String(50), default="Active")
    detected_at = Column(String(10), nullable=False)
    description = Column(Text, default="")
    cause = Column(String(200), default="")
    team_assigned = Column(String(100), default="")
    team_eta = Column(String(50), default="")
    citizen_alert_sent = Column(Boolean, default=False)
    citizen_alert_count = Column(Integer, default=0)
    zone_id = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(20), nullable=False)
    location = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    recommendation = Column(Text, default="")
    status = Column(String(20), default="Active")
    zone_id = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class SimulationState(Base):
    """Persisted progress keeps the demo consistent across API reloads."""
    __tablename__ = "simulation_states"

    zone_id = Column(Integer, ForeignKey("risk_zones.id", ondelete="CASCADE"), primary_key=True)
    current_step = Column(Integer, nullable=False, default=0)
    completed = Column(Boolean, nullable=False, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(100), nullable=False)
    source = Column(String(200), default="")
    status = Column(String(20), default="Connected")
    mode = Column(String(50), default="Simulated")
    active_count = Column(Integer, default=0)
    last_updated = Column(DateTime, server_default=func.now())
    metadata_info = Column(Text, default="")
