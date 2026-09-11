"""
TerraSentinel — FastAPI Application
AI-Powered Disaster Risk Monitoring & Response Platform

⚠ PROTOTYPE — This is a demonstration application for SIH 2026.
All data is simulated. External data sources are represented as simulated inputs.
"""

from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal, Base
from models import RiskZone, Incident, Alert, DataSource, SimulationState
from seed import seed_database
from schemas import HealthResponse

from routers.risk_zones import router as risk_zones_router
from routers.incidents import router as incidents_router
from routers.alerts import router as alerts_router
from routers.data_sources import router as data_sources_router
from routers.simulation import router as simulation_router
from routers.analytics import router as analytics_router
from routers.argus import router as argus_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed database on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="TerraSentinel API",
    description="AI-Powered Disaster Risk Monitoring & Response Platform — Prototype API",
    version="1.0.0-prototype",
    lifespan=lifespan,
)


@app.exception_handler(Exception)
async def unhandled_error_handler(_request: Request, exc: Exception):
    """Avoid leaking implementation details while retaining a useful server log."""
    # FastAPI preserves HTTPException and request-validation responses before this handler.
    print(f"Unexpected TerraSentinel API error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})

# CORS — allow frontend dev server
allowed_origins = [origin.strip() for origin in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
).split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(risk_zones_router)
app.include_router(incidents_router)
app.include_router(alerts_router)
app.include_router(data_sources_router)
app.include_router(simulation_router)
app.include_router(analytics_router)
app.include_router(argus_router)


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="operational",
        service="TerraSentinel API",
        version="1.0.0-prototype",
        database="SQLite (prototype)",
    )
