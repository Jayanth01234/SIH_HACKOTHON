from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_repository
from app.schemas.observation import (
    ObservationListResponse,
    StationName,
    WeatherObservation,
)
from app.storage.repository import ObservationRepository

router = APIRouter(prefix="/observations", tags=["Observations"])


@router.get(
    "/latest",
    response_model=WeatherObservation,
    summary="Get Latest Observation",
)
def get_latest_observation(
    station: Optional[StationName] = Query(None),
    repo: ObservationRepository = Depends(get_repository),
) -> WeatherObservation:
    latest = repo.get_latest_observation(station=station)
    if not latest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No observations found")
    return latest


@router.get(
    "",
    response_model=ObservationListResponse,
    summary="Query Weather Observations",
)
def get_observations(
    station: Optional[StationName] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
    repo: ObservationRepository = Depends(get_repository),
) -> ObservationListResponse:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be earlier than or equal to end_date",
        )

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


@router.get(
    "/{observation_id}",
    response_model=WeatherObservation,
    summary="Get Observation by ID",
)
def get_observation_by_id(
    observation_id: str,
    repo: ObservationRepository = Depends(get_repository),
) -> WeatherObservation:
    observation = repo.get_observation_by_id(observation_id)
    if not observation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return observation
