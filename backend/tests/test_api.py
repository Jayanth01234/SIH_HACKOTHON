import pytest
from fastapi.testclient import TestClient


def test_api_root_and_health(client: TestClient):
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["system"] == "POLARIS Data Engine"

    res_health = client.get("/health")
    assert res_health.status_code == 200
    data_health = res_health.json()
    assert data_health["status"] == "healthy"
    assert data_health["total_observations"] > 1300
    assert "Maitri" in data_health["ingested_stations"]
    assert "Bharati" in data_health["ingested_stations"]


def test_api_stations_list_and_detail(client: TestClient):
    res = client.get("/api/v1/stations")
    assert res.status_code == 200
    stations = res.json()
    assert len(stations) == 2
    names = [s["station"] for s in stations]
    assert "Maitri" in names
    assert "Bharati" in names

    res_m = client.get("/api/v1/stations/Maitri")
    assert res_m.status_code == 200
    assert res_m.json()["station"] == "Maitri"
    assert res_m.json()["total_observations"] == 634


def test_api_latest_observation(client: TestClient):
    res_latest = client.get("/api/v1/observations/latest")
    assert res_latest.status_code == 200
    data = res_latest.json()
    assert "temperature" in data
    assert "station" in data
    assert "timestamp" in data

    res_m = client.get("/api/v1/stations/Maitri/latest")
    assert res_m.status_code == 200
    assert res_m.json()["station"] == "Maitri"

    res_b = client.get("/api/v1/stations/Bharati/latest")
    assert res_b.status_code == 200
    assert res_b.json()["station"] == "Bharati"


def test_api_observations_by_station_and_date_range(client: TestClient):
    params = {
        "station": "Maitri",
        "start_date": "2015-01-01T00:00:00",
        "end_date": "2015-01-05T23:59:59",
        "limit": 50,
        "offset": 0,
        "sort": "asc",
    }
    res = client.get("/api/v1/observations", params=params)
    assert res.status_code == 200
    payload = res.json()
    assert payload["total"] == 98
    assert len(payload["data"]) == 50
    assert payload["station"] == "Maitri"

    first = payload["data"][0]
    assert first["station"] == "Maitri"
    assert "timestamp" in first
    assert "temperature" in first
    assert "relative_humidity" in first
    assert "wind_speed" in first
    assert "wind_direction" in first
    assert "atmospheric_pressure" in first


def test_api_statistics_endpoints(client: TestClient):
    res = client.get("/api/v1/statistics?station=Maitri")
    assert res.status_code == 200
    stats = res.json()
    assert stats["station"] == "Maitri"
    assert stats["total_records"] == 634
    assert stats["temperature"]["count"] == 634

    res_st = client.get("/api/v1/stations/Bharati/statistics")
    assert res_st.status_code == 200
    stats_b = res_st.json()
    assert stats_b["station"] == "Bharati"
    assert stats_b["total_records"] == 720


def test_api_invalid_date_range(client: TestClient):
    params = {
        "start_date": "2015-01-10T00:00:00",
        "end_date": "2015-01-01T00:00:00",
    }
    res = client.get("/api/v1/observations", params=params)
    assert res.status_code == 400
