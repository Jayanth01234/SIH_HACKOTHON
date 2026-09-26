from fastapi import APIRouter, Depends
from app.api.dependencies import get_repository
from app.schemas.observation import HealthResponse
from app.storage.repository import ObservationRepository

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health & Data Readiness Check",
)
def get_health_status(
    repo: ObservationRepository = Depends(get_repository),
) -> HealthResponse:
    return repo.get_health()
