"""
TerraSentinel — Prototype Risk Engine

⚠ PROTOTYPE RISK ENGINE
This is a weighted scoring model for demonstration purposes.
It is NOT a scientifically validated production model.

Weights:
  Rainfall:        30%
  Soil Moisture:   20%
  Slope:           15%
  Ground Movement: 20%
  Historical Risk: 10%
  Terrain Risk:     5%

Risk Levels:
  0–29  = LOW
  30–49 = MODERATE
  50–74 = HIGH
  75–100 = CRITICAL
"""

from typing import List, Tuple


def _normalize_rainfall(rainfall_mm: float) -> float:
    """Normalize rainfall (0–200+ mm) to 0–1 scale."""
    return max(0.0, min(rainfall_mm / 200.0, 1.0))


def _normalize_soil_moisture(moisture_pct: float) -> float:
    """Normalize soil moisture (0–100%) to 0–1 scale."""
    return max(0.0, min(moisture_pct / 100.0, 1.0))


def _normalize_slope(slope_deg: float) -> float:
    """Normalize slope (0–60°) to 0–1 scale."""
    return max(0.0, min(slope_deg / 60.0, 1.0))


def _normalize_ground_movement(detected: bool) -> float:
    """Ground movement: binary 0 or 1."""
    return 1.0 if detected else 0.0


def _normalize_qualitative(level: str) -> float:
    """Convert Low/Medium/High to 0–1 scale."""
    mapping = {
        "Low": 0.2,
        "low": 0.2,
        "Medium": 0.5,
        "medium": 0.5,
        "Moderate": 0.5,
        "moderate": 0.5,
        "High": 0.85,
        "high": 0.85,
        "Very High": 1.0,
        "very high": 1.0,
        "Critical": 1.0,
        "critical": 1.0,
    }
    return mapping.get(level.strip() if isinstance(level, str) else "", 0.3)


def get_risk_level(score: int) -> str:
    """Map numeric score to risk level."""
    if score >= 75:
        return "CRITICAL"
    elif score >= 50:
        return "HIGH"
    elif score >= 30:
        return "MODERATE"
    else:
        return "LOW"


def get_recommended_actions(risk_level: str) -> List[str]:
    """Return recommended actions for a given risk level."""
    actions = {
        "CRITICAL": [
            "Dispatch field response team immediately",
            "Restrict affected road corridor",
            "Issue citizen warning via SMS and app",
            "Notify district disaster authority",
            "Monitor CCTV feeds continuously",
            "Prepare evacuation plan for nearby settlements",
        ],
        "HIGH": [
            "Increase monitoring frequency",
            "Prepare field response team for deployment",
            "Notify district authorities",
            "Review evacuation routes",
        ],
        "MODERATE": [
            "Continue standard monitoring",
            "Review rainfall trend for next 12 hours",
            "Verify sensor connectivity",
        ],
        "LOW": [
            "Maintain routine monitoring schedule",
        ],
    }
    return actions.get(risk_level, ["Continue monitoring"])


def calculate_risk(
    rainfall: float,
    soil_moisture: float,
    slope: float,
    ground_movement: bool,
    historical_risk: str = "Low",
    terrain_risk: str = "Low",
) -> Tuple[int, str, List[str]]:
    """
    Prototype Risk Engine — Weighted scoring model.

    Returns:
        (risk_score, risk_level, recommended_actions)
    """
    # Normalize inputs
    r = _normalize_rainfall(rainfall)
    s = _normalize_soil_moisture(soil_moisture)
    sl = _normalize_slope(slope)
    gm = _normalize_ground_movement(ground_movement)
    hr = _normalize_qualitative(historical_risk)
    tr = _normalize_qualitative(terrain_risk)

    # Weighted score
    raw_score = (
        r * 0.30
        + s * 0.20
        + sl * 0.15
        + gm * 0.20
        + hr * 0.10
        + tr * 0.05
    )

    # Scale to 0–100 and clamp
    risk_score = max(0, min(100, int(round(raw_score * 100))))

    risk_level = get_risk_level(risk_score)
    recommended_actions = get_recommended_actions(risk_level)

    return risk_score, risk_level, recommended_actions
