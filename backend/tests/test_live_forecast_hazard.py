from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.observation import StationName
from app.ml.features import (
    compute_hazard_features_df,
    compute_single_inference_features,
    FEATURE_COLUMNS,
)
from app.services.live_ingestion import LiveIngestionService, live_ingestion_service
from app.services.forecast_service import forecast_service
from app.services.hazard_service import hazard_service
from app.schemas.live import LiveStatus


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_live_observation_endpoint(client):
    """Verifies that GET /api/v1/stations/{station}/live returns a valid response."""
    for station in ["Maitri", "Bharati"]:
        resp = client.get(f"/api/v1/stations/{station}/live")
        assert resp.status_code == 200
        data = resp.json()
        assert data["station"] == station
        assert data["status"] in ["verified_live", "stale", "unavailable"]
        assert "source_url" in data
        assert "data.ncpor.res.in" in data["source_url"]
        assert "last_fetched_at" in data
        assert isinstance(data["series_24h"], list)


def test_live_refresh_endpoint(client):
    """Verifies that POST /api/v1/stations/{station}/live/refresh is callable."""
    resp = client.post("/api/v1/stations/Maitri/live/refresh")
    assert resp.status_code == 200
    data = resp.json()
    assert data["station"] == "Maitri"
    assert data["status"] in ["verified_live", "stale", "unavailable"]


def test_live_graceful_unavailable():
    """Verifies graceful handling when the external portal cannot be reached."""
    failing_service = LiveIngestionService(timeout_seconds=1.0)
    import app.services.live_ingestion as li
    original_urls = li.NCPOR_URLS.copy()
    try:
        li.NCPOR_URLS[StationName.MAITRI] = "http://127.0.0.1:59999/unreachable"
        res = failing_service.fetch_live(StationName.MAITRI)
        assert res.status == LiveStatus.UNAVAILABLE
        assert res.data_integrity_tag == "[ TELEMETRY FEED UNAVAILABLE ]"
        assert "Unable to reach NCPOR live server" in res.message
    finally:
        li.NCPOR_URLS = original_urls


def test_forecast_endpoint(client):
    """Verifies that GET /api/v1/stations/{station}/forecast returns explainable AI predictions."""
    for station in ["Maitri", "Bharati"]:
        resp = client.get(f"/api/v1/stations/{station}/forecast")
        assert resp.status_code == 200
        data = resp.json()
        assert data["station"] == station
        assert data["data_integrity_tag"] == "[ AI FORECAST ]"
        assert data["horizon_hours"] == 24
        assert len(data["weights"]) == 5
        assert "Weighted Moving Average" in data["methodology"]

        temp = data["temperature"]
        assert "current" in temp
        assert "forecast_next_hour" in temp
        assert "forecast_24h" in temp
        assert "trend_slope" in temp
        assert "std_dev" in temp
        assert "ci_lower" in temp
        assert "ci_upper" in temp
        assert temp["ci_lower"] <= temp["ci_upper"]

        wind = data["wind_speed"]
        assert wind["forecast_next_hour"] >= 0.0

        press = data["atmospheric_pressure"]
        assert press["forecast_next_hour"] > 800.0

        proj = data["hourly_projection"]
        assert len(proj) == 24
        assert proj[0]["step_hours"] == 1
        assert proj[-1]["step_hours"] == 24

        acc = data["accuracy_metrics"]
        assert "mae_temperature" in acc


def test_hazard_endpoint(client):
    """Verifies that GET /api/v1/stations/{station}/hazard returns authentic ML predictions."""
    for station in ["Maitri", "Bharati"]:
        resp = client.get(f"/api/v1/stations/{station}/hazard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["station"] == station
        assert data["data_integrity_tag"] == "[ ML HAZARD PREDICTION ]"
        assert 0.0 <= data["hazard_probability"] <= 1.0
        assert data["hazard_level"] in ["LOW", "MODERATE", "CRITICAL"]
        assert isinstance(data["is_hazard"], bool)
        assert len(data["primary_driver"]) > 0
        assert len(data["top_contributing_factors"]) >= 2
        assert data["model_evaluation"]["accuracy"] > 0.60
        assert "RandomForestClassifier" in data["model_name"]


def test_unified_feature_pipeline():
    """Verifies that the unified feature pipeline produces exact feature columns."""
    sample_records = [
        {"timestamp": datetime(2026, 9, 24, 0, 0, tzinfo=timezone.utc), "temperature": -15.0, "wind_speed": 10.0, "atmospheric_pressure": 960.0},
        {"timestamp": datetime(2026, 9, 24, 1, 0, tzinfo=timezone.utc), "temperature": -14.5, "wind_speed": 12.0, "atmospheric_pressure": 958.0},
        {"timestamp": datetime(2026, 9, 24, 2, 0, tzinfo=timezone.utc), "temperature": -13.0, "wind_speed": 15.0, "atmospheric_pressure": 955.0},
        {"timestamp": datetime(2026, 9, 24, 3, 0, tzinfo=timezone.utc), "temperature": -11.0, "wind_speed": 18.0, "atmospheric_pressure": 952.0},
        {"timestamp": datetime(2026, 9, 24, 4, 0, tzinfo=timezone.utc), "temperature": -10.0, "wind_speed": 20.0, "atmospheric_pressure": 950.0},
    ]
    feat_df = compute_single_inference_features(sample_records)
    assert list(feat_df.columns) == FEATURE_COLUMNS
    assert feat_df["wind_delta"].iloc[0] == 10.0
    assert feat_df["temperature_delta"].iloc[0] == 5.0
    assert feat_df["pressure_trend"].iloc[0] < 0.0
