import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.dependencies import get_repository
from app.api.v1.router import api_v1_router
from app.database.session import init_db
from app.services.digital_twin_service import digital_twin_service
from app.services.simulation_service import simulation_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("polaris")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()


async def periodic_telemetry_broadcast():
    """Background task streaming real-time digital twin state updates to connected clients."""
    repo = get_repository()
    while True:
        try:
            await asyncio.sleep(settings.PORT and 3.0)
            if ws_manager.active_connections:
                maitri_twin = digital_twin_service.get_station_digital_twin("Maitri", repo)
                bharati_twin = digital_twin_service.get_station_digital_twin("Bharati", repo)
                await ws_manager.broadcast({
                    "type": "DIGITAL_TWIN_TICK",
                    "timestamp": maitri_twin.timestamp.isoformat(),
                    "demo_running": simulation_service.is_demo_running,
                    "demo_step": simulation_service.demo_current_step + 1,
                    "stations": {
                        "Maitri": {
                            "status": maitri_twin.overall_status.value,
                            "health": maitri_twin.overall_health_score,
                            "temp": maitri_twin.environment.temperature,
                            "wind": maitri_twin.environment.wind_speed,
                            "press": maitri_twin.environment.atmospheric_pressure,
                            "press_trend": maitri_twin.environment.pressure_trend,
                            "consumption_kw": maitri_twin.energy.consumption_kw,
                            "battery_soc": maitri_twin.energy.battery_soc_pct,
                            "fuel_autonomy_days": maitri_twin.energy.autonomy_days,
                            "hazard_level": maitri_twin.hazards.hazard_level,
                            "hazard_prob": maitri_twin.hazards.hazard_probability,
                            "active_alerts": len(maitri_twin.active_alerts),
                            "connectivity": maitri_twin.connectivity_status.value,
                            "data_mode": maitri_twin.data_mode.value,
                        },
                        "Bharati": {
                            "status": bharati_twin.overall_status.value,
                            "health": bharati_twin.overall_health_score,
                            "temp": bharati_twin.environment.temperature,
                            "wind": bharati_twin.environment.wind_speed,
                            "press": bharati_twin.environment.atmospheric_pressure,
                            "press_trend": bharati_twin.environment.pressure_trend,
                            "consumption_kw": bharati_twin.energy.consumption_kw,
                            "battery_soc": bharati_twin.energy.battery_soc_pct,
                            "fuel_autonomy_days": bharati_twin.energy.autonomy_days,
                            "hazard_level": bharati_twin.hazards.hazard_level,
                            "hazard_prob": bharati_twin.hazards.hazard_probability,
                            "active_alerts": len(bharati_twin.active_alerts),
                            "connectivity": bharati_twin.connectivity_status.value,
                            "data_mode": bharati_twin.data_mode.value,
                        },
                    },
                })
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in telemetry broadcast task: {e}")
            await asyncio.sleep(2.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing POLARIS Antarctic telemetry data engine & SQLite persistence...")
    init_db()
    repo = get_repository()
    logger.info(f"POLARIS Data Engine ready. Total active observations: {len(repo._df)}")
    broadcast_task = asyncio.create_task(periodic_telemetry_broadcast())
    yield
    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        pass
    logger.info("POLARIS Data Engine shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root():
    return {
        "system": "POLARIS Data Engine",
        "project": "POLARIS — Digital Twin for Remote Management of Indian Antarctic Research Stations",
        "problem_statement": "26060 (MoES / NCPOR)",
        "team": "InnoByte",
        "stations": ["Maitri", "Bharati"],
        "api_v1": settings.API_V1_PREFIX,
        "websocket_endpoint": "/ws",
        "interactive_docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    repo = get_repository()
    base_health = repo.get_health()
    return {
        **base_health.model_dump(),
        "database": "SQLite (WAL enabled, indexed)",
        "websocket_clients": len(ws_manager.active_connections),
        "demo_scenario_active": simulation_service.is_demo_running,
    }


@app.get("/metrics", tags=["Observability"])
def get_metrics():
    repo = get_repository()
    return {
        "api_status": "ONLINE",
        "database_status": "CONNECTED",
        "ingested_observations_total": len(repo._df),
        "active_websocket_subscribers": len(ws_manager.active_connections),
        "simulation_mode": simulation_service.active_mode,
        "demo_scenario_running": simulation_service.is_demo_running,
        "supported_stations": ["Maitri", "Bharati"],
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Respond to client pings or client command requests
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
