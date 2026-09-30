from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_repository
from app.schemas.cross_domain import CrossDomainImpactAnalysis
from app.schemas.replay import ReplaySessionResponse, DataQualitySummary
from app.storage.repository import ObservationRepository
from app.services.cross_domain_service import cross_domain_service
from app.services.replay_service import replay_service
from app.services.data_quality_service import data_quality_service
from app.services.digital_twin_service import digital_twin_service

router = APIRouter(tags=["Analytics, Replay & Quality"])


@router.get("/cross-domain-impact", response_model=CrossDomainImpactAnalysis)
def get_cross_domain_impact(
    station: str = Query("Maitri"),
    repo: ObservationRepository = Depends(get_repository),
) -> CrossDomainImpactAnalysis:
    """Computes real-time causal graph and impact chains across Environment, Infrastructure, Energy, and Logistics."""
    twin = digital_twin_service.get_station_digital_twin(station, repo)
    return cross_domain_service.analyze_impact(
        station_id=station,
        temperature=twin.environment.temperature,
        wind_speed=twin.environment.wind_speed,
        pressure=twin.environment.atmospheric_pressure,
        pressure_trend=twin.environment.pressure_trend,
        energy_consumption=twin.energy.consumption_kw,
        fuel_autonomy_days=twin.energy.autonomy_days,
        battery_soc=twin.energy.battery_soc_pct,
        hazard_level=twin.hazards.hazard_level,
    )


@router.get("/replay", response_model=ReplaySessionResponse)
def get_historical_replay(
    station: str = Query("Maitri"),
    event_id: str = Query("JAN_2015_STORM"),
    repo: ObservationRepository = Depends(get_repository),
) -> ReplaySessionResponse:
    """Returns chronological timeline playback data of historical Antarctic storms."""
    return replay_service.get_historical_replay(station_id=station, repo=repo, event_id=event_id)


@router.get("/data-quality", response_model=DataQualitySummary)
def get_data_quality(
    repo: ObservationRepository = Depends(get_repository),
) -> DataQualitySummary:
    """Provides comprehensive data quality metrics, missing value rates, and validation rule enforcement summary."""
    return data_quality_service.get_data_quality_summary(repo)
