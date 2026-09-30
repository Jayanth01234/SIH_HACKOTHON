from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_repository
from app.schemas.observation import (
    ObservationListResponse,
    StationInfo,
    StationName,
    StationStatistics,
    WeatherObservation,
)
from app.schemas.forecast import ForecastResponse
from app.schemas.hazard import HazardPredictionResponse
from app.schemas.live import LiveObservationResponse
from app.schemas.digital_twin import DigitalTwinState, EnergyState, InfrastructureState, LogisticsState, StationAlert
from app.storage.repository import ObservationRepository
from app.services.forecast_service import forecast_service
from app.services.hazard_service import hazard_service
from app.services.live_ingestion import live_ingestion_service
from app.services.digital_twin_service import digital_twin_service
from app.services.energy_service import energy_service
from app.services.infrastructure_service import infrastructure_service
from app.services.logistics_service import logistics_service
from app.services.alert_service import alert_service

router = APIRouter(prefix="/stations", tags=["Stations & Digital Twin"])


@router.get("", response_model=List[StationInfo])
def list_stations(
    repo: ObservationRepository = Depends(get_repository),
) -> List[StationInfo]:
    return repo.list_stations()


@router.get("/compare")
def compare_stations(
    repo: ObservationRepository = Depends(get_repository),
) -> Dict[str, Any]:
    """Provides side-by-side comparative operational analysis between Maitri and Bharati."""
    return digital_twin_service.compare_stations(repo)


@router.get("/{station}", response_model=StationInfo)
def get_station_info(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> StationInfo:
    info = repo.get_station_metadata(station)
    if not info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")
    return info


@router.get("/{station}/digital-twin", response_model=DigitalTwinState)
def get_station_digital_twin(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> DigitalTwinState:
    """Returns the unified operational Digital Twin state for the selected Antarctic station."""
    return digital_twin_service.get_station_digital_twin(station.value, repo)


@router.get("/{station}/latest", response_model=WeatherObservation)
def get_station_latest(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> WeatherObservation:
    latest = repo.get_latest_observation(station=station)
    if not latest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No observations found")
    return latest


@router.get("/{station}/observations", response_model=ObservationListResponse)
def get_station_observations(
    station: StationName,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
    repo: ObservationRepository = Depends(get_repository),
) -> ObservationListResponse:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date must be earlier than end_date")
    records, total = repo.get_observations(
        station=station,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
        sort_order=sort,
    )
    return ObservationListResponse(
        total=total,
        limit=limit,
        offset=offset,
        station=station,
        start_date=start_date,
        end_date=end_date,
        data=records,
    )


@router.get("/{station}/statistics", response_model=StationStatistics)
def get_station_statistics(
    station: StationName,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    repo: ObservationRepository = Depends(get_repository),
) -> StationStatistics:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date must be earlier than end_date")
    return repo.get_statistics(station=station, start_date=start_date, end_date=end_date)


@router.get("/{station}/live", response_model=LiveObservationResponse)
def get_station_live(
    station: StationName,
) -> LiveObservationResponse:
    """Returns verified live telemetry scraped directly from NCPOR portal if reachable, or cached fallback."""
    return live_ingestion_service.get_cached_or_fetch(station)


@router.post("/{station}/live/refresh", response_model=LiveObservationResponse)
def refresh_station_live(
    station: StationName,
) -> LiveObservationResponse:
    """Forces immediate live network refresh from NCPOR portal."""
    return live_ingestion_service.fetch_live(station)


@router.get("/{station}/forecast", response_model=ForecastResponse)
def get_station_forecast(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> ForecastResponse:
    """Generates explainable 24-hour forward projection with confidence bounds and accuracy metrics."""
    return forecast_service.generate_forecast(station, repo)


@router.get("/{station}/hazard", response_model=HazardPredictionResponse)
@router.get("/{station}/hazards", response_model=HazardPredictionResponse)
def get_station_hazard(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> HazardPredictionResponse:
    """Runs trained RandomForestClassifier inference with Gini feature importance explainability."""
    return hazard_service.predict_hazard(station, repo)


@router.get("/{station}/energy", response_model=EnergyState)
def get_station_energy(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> EnergyState:
    twin = digital_twin_service.get_station_digital_twin(station.value, repo)
    return twin.energy


@router.get("/{station}/infrastructure", response_model=InfrastructureState)
def get_station_infrastructure(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> InfrastructureState:
    twin = digital_twin_service.get_station_digital_twin(station.value, repo)
    return twin.infrastructure


@router.get("/{station}/logistics", response_model=LogisticsState)
def get_station_logistics(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> LogisticsState:
    twin = digital_twin_service.get_station_digital_twin(station.value, repo)
    return twin.logistics


@router.get("/{station}/alerts", response_model=List[StationAlert])
def get_station_alerts(
    station: StationName,
    status_filter: Optional[str] = Query(None),
) -> List[StationAlert]:
    return alert_service.get_alerts_for_station(station.value, status_filter=status_filter)
