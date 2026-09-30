from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_repository
from app.schemas.digital_twin import ConnectivityStatus, DataMode
from app.schemas.what_if import WhatIfRequest, WhatIfResponse
from app.storage.repository import ObservationRepository
from app.services.simulation_service import simulation_service
from app.services.what_if_service import what_if_service
from app.services.digital_twin_service import digital_twin_service

router = APIRouter(tags=["Simulation & What-If Engine"])


class ScenarioStartRequest(BaseModel):
    scenario: str = Field(default="SEVERE_WEATHER", description="SEVERE_WEATHER, MICROGRID_STRESS, CONNECTIVITY_LOSS")


class StepAdvanceRequest(BaseModel):
    step: int = Field(..., ge=1, le=12, description="Target scenario step number")


class ConnectivityToggleRequest(BaseModel):
    station_id: str = Field(default="Maitri")
    status: ConnectivityStatus = Field(default=ConnectivityStatus.OFFLINE)


class DataModeRequest(BaseModel):
    station_id: str = Field(default="Maitri")
    mode: DataMode = Field(default=DataMode.SIMULATION)


@router.get("/simulation/state")
def get_simulation_state() -> Dict[str, Any]:
    return {
        "is_demo_running": simulation_service.is_demo_running,
        "current_step": simulation_service.demo_current_step + 1,
        "scenario_name": simulation_service.demo_scenario_name,
        "connectivity": simulation_service.connectivity_override,
        "active_mode": simulation_service.active_mode,
        "data_modes": digital_twin_service._current_data_mode,
    }


@router.post("/simulation/start")
def start_demo_scenario(req: Optional[ScenarioStartRequest] = None) -> Dict[str, Any]:
    scen = req.scenario if req else "SEVERE_WEATHER"
    simulation_service.start_demo_scenario(scen)
    return {
        "message": f"Demo scenario '{scen}' initiated.",
        "step": 1,
        "total_steps": 12,
        "running": True,
    }


@router.post("/simulation/stop")
def stop_demo_scenario() -> Dict[str, Any]:
    simulation_service.stop_demo_scenario()
    return {
        "message": "Demo scenario terminated. Restored standard simulation telemetry.",
        "running": False,
    }


@router.post("/simulation/step")
def advance_scenario_step(req: StepAdvanceRequest) -> Dict[str, Any]:
    return simulation_service.advance_demo_step(req.step)


@router.post("/simulation/what-if", response_model=WhatIfResponse)
def evaluate_what_if(
    req: WhatIfRequest,
    repo: ObservationRepository = Depends(get_repository),
) -> WhatIfResponse:
    """Calculates cross-domain consequences of hypothetical environmental and microgrid shifts."""
    twin = digital_twin_service.get_station_digital_twin(req.station_id, repo)
    curr_env = {
        "temperature": twin.environment.temperature,
        "wind_speed": twin.environment.wind_speed,
        "atmospheric_pressure": twin.environment.atmospheric_pressure,
    }
    return what_if_service.evaluate_what_if(req, curr_env)


@router.post("/simulation/data-mode")
def set_data_mode(req: DataModeRequest) -> Dict[str, Any]:
    digital_twin_service.set_data_mode(req.station_id, req.mode)
    return {
        "station_id": req.station_id,
        "new_data_mode": req.mode,
        "status": "success",
    }


@router.post("/connectivity/toggle")
def toggle_connectivity(req: ConnectivityToggleRequest) -> Dict[str, Any]:
    simulation_service.set_connectivity(req.station_id, req.status)
    return {
        "station_id": req.station_id,
        "connectivity_status": req.status,
        "message": f"Station {req.station_id} network link set to {req.status}.",
    }


@router.post("/connectivity/sync")
def sync_offline_packets(station_id: str = Query("Maitri")) -> Dict[str, Any]:
    synced = simulation_service.sync_offline_queue(station_id)
    return {
        "station_id": station_id,
        "synced_packets": synced,
        "connectivity_status": "ONLINE",
        "message": f"Successfully synchronized {synced} buffered packets to central archive.",
    }
