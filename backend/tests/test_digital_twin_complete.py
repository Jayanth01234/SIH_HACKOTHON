import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_digital_twin_unified_state(client):
    for station in ["Maitri", "Bharati"]:
        resp = client.get(f"/api/v1/stations/{station}/digital-twin")
        assert resp.status_code == 200
        data = resp.json()
        assert data["station_id"] == station
        assert "overall_status" in data
        assert "overall_health_score" in data
        assert "environment" in data
        assert "energy" in data
        assert "infrastructure" in data
        assert "logistics" in data
        assert "hazards" in data
        assert "active_alerts" in data
        assert "provenance" in data

        # Verify environment
        env = data["environment"]
        assert -45.0 <= env["temperature"] <= 15.0
        assert 0.0 <= env["wind_speed"] <= 60.0
        assert env["atmospheric_pressure"] > 850.0

        # Verify energy
        nrg = data["energy"]
        assert nrg["generation_kw"] > 0
        assert nrg["consumption_kw"] > 0
        assert 0.0 <= nrg["battery_soc_pct"] <= 100.0
        assert nrg["fuel_level_liters"] > 0
        assert nrg["autonomy_days"] > 0

        # Verify infrastructure
        infra = data["infrastructure"]
        assert len(infra["subsystems"]) == 6
        assert infra["overall_health"] > 0

        # Verify logistics
        log = data["logistics"]
        assert len(log["items"]) >= 4
        assert log["fuel_days"] > 0


def test_station_compare(client):
    resp = client.get("/api/v1/stations/compare")
    assert resp.status_code == 200
    data = resp.json()
    assert "Maitri" in data["stations"]
    assert "Bharati" in data["stations"]
    assert len(data["comparison_summary"]) >= 5


def test_cross_domain_impact(client):
    resp = client.get("/api/v1/cross-domain-impact?station=Maitri")
    assert resp.status_code == 200
    data = resp.json()
    assert data["station_id"] == "Maitri"
    assert "nodes" in data
    assert len(data["nodes"]) == 5
    assert "edges" in data
    assert len(data["edges"]) >= 4
    assert "causal_chain" in data
    assert len(data["causal_chain"]) >= 2
    assert "operator_checklist" in data


def test_alert_lifecycle_and_actions(client):
    # 1. Fetch alerts
    resp = client.get("/api/v1/stations/Maitri/alerts")
    assert resp.status_code == 200
    alerts = resp.json()
    assert len(alerts) > 0
    target_alert = alerts[0]
    alert_id = target_alert["id"]

    # 2. Acknowledge alert
    ack_resp = client.post(
        f"/api/v1/alerts/{alert_id}/acknowledge",
        json={"operator": "Dr. Sharma (NCPOR Remote)", "notes": "Inspected guy wires. SOP initiated."},
    )
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "ACKNOWLEDGED"

    # 3. Check operator actions log
    act_resp = client.get("/api/v1/operator-actions?station=Maitri")
    assert act_resp.status_code == 200
    acts = act_resp.json()
    assert len(acts) > 0
    assert acts[0]["action"] == "ACKNOWLEDGE"


def test_what_if_simulation(client):
    req_body = {
        "station_id": "Maitri",
        "wind_delta_pct": 25.0,
        "temp_delta_c": -6.0,
        "pressure_delta_hpa": -12.0,
        "fuel_delta_pct": -15.0,
        "energy_demand_delta_pct": 20.0,
    }
    resp = client.post("/api/v1/simulation/what-if", json=req_body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["station_id"] == "Maitri"
    assert data["risk_probability_simulated"] >= data["risk_probability_current"]
    assert len(data["metrics_comparison"]) >= 6
    assert len(data["operator_advisory"]) > 20


def test_demo_scenario_engine(client):
    # Start scenario
    start_resp = client.post("/api/v1/simulation/start", json={"scenario": "SEVERE_WEATHER"})
    assert start_resp.status_code == 200
    assert start_resp.json()["running"] is True

    # Advance steps
    step4 = client.post("/api/v1/simulation/step", json={"step": 4})
    assert step4.status_code == 200
    data4 = step4.json()
    assert data4["step"] == 4
    assert data4["telemetry"]["wind_speed"] > 25.0

    step10 = client.post("/api/v1/simulation/step", json={"step": 10})
    assert step10.status_code == 200

    # Stop scenario
    stop_resp = client.post("/api/v1/simulation/stop")
    assert stop_resp.status_code == 200
    assert stop_resp.json()["running"] is False


def test_historical_replay(client):
    resp = client.get("/api/v1/replay?station=Maitri&event_id=JAN_2015_STORM")
    assert resp.status_code == 200
    data = resp.json()
    assert "event_metadata" in data
    assert "frames" in data
    assert len(data["frames"]) > 10


def test_data_quality_dashboard(client):
    resp = client.get("/api/v1/data-quality")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_records"] > 0
    assert data["valid_records"] > 0
    assert 90.0 <= data["data_quality_score_pct"] <= 100.0
    assert len(data["validation_rules_applied"]) >= 5


def test_connectivity_offline_and_sync(client):
    # Toggle offline
    off_resp = client.post(
        "/api/v1/connectivity/toggle",
        json={"station_id": "Maitri", "status": "OFFLINE"},
    )
    assert off_resp.status_code == 200
    assert off_resp.json()["connectivity_status"] == "OFFLINE"

    # Get twin in offline mode - must return cached last-known-good state tagged OFFLINE
    twin_resp = client.get("/api/v1/stations/Maitri/digital-twin")
    assert twin_resp.status_code == 200
    twin_data = twin_resp.json()
    assert twin_data["connectivity_status"] == "OFFLINE"
    assert twin_data["data_mode"] == "OFFLINE"

    # Sync back online
    sync_resp = client.post("/api/v1/connectivity/sync?station_id=Maitri")
    assert sync_resp.status_code == 200
    assert sync_resp.json()["connectivity_status"] == "ONLINE"
