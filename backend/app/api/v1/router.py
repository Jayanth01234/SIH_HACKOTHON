from fastapi import APIRouter
from app.api.v1.observations import router as observations_router
from app.api.v1.stations import router as stations_router
from app.api.v1.statistics import router as statistics_router
from app.api.v1.health import router as health_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.analytics import router as analytics_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(stations_router)
api_v1_router.include_router(observations_router)
api_v1_router.include_router(statistics_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(simulation_router)
api_v1_router.include_router(analytics_router)
