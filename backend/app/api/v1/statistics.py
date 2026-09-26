from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_repository
from app.schemas.observation import StationName, StationStatistics
from app.storage.repository import ObservationRepository

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("", response_model=StationStatistics)
def get_statistics(
    station: Optional[StationName] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    repo: ObservationRepository = Depends(get_repository),
) -> StationStatistics:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date must be earlier than end_date")
    return repo.get_statistics(station=station, start_date=start_date, end_date=end_date)
