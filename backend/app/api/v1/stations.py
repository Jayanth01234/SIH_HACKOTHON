from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_repository
from app.schemas.observation import (
    ObservationListResponse,
    StationInfo,
    StationName,
    StationStatistics,
    WeatherObservation,
)
from app.storage.repository import ObservationRepository

router = APIRouter(prefix="/stations", tags=["Stations"])


@router.get("", response_model=List[StationInfo])
def list_stations(
    repo: ObservationRepository = Depends(get_repository),
) -> List[StationInfo]:
    return repo.list_stations()


@router.get("/{station}", response_model=StationInfo)
def get_station_info(
    station: StationName,
    repo: ObservationRepository = Depends(get_repository),
) -> StationInfo:
    info = repo.get_station_metadata(station)
    if not info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")
    return info


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
