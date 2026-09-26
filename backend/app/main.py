import sys
from pathlib import Path

# Ensure backend root is in sys.path so 'app...' imports work regardless of working directory
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.dependencies import get_repository
from app.api.v1.router import api_v1_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("polaris")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing POLARIS Antarctic telemetry data engine...")
    repo = get_repository()
    logger.info(f"POLARIS Data Engine ready. Total active observations: {len(repo._df)}")
    yield
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
        "description": "Digital Twin & Remote Management for India's Antarctic Stations",
        "version": settings.VERSION,
        "stations": ["Maitri", "Bharati"],
        "api_v1": settings.API_V1_PREFIX,
        "interactive_docs": "/docs",
        "alternative_docs": "/redoc",
    }


@app.get("/health", tags=["Health"])
def health_check():
    repo = get_repository()
    return repo.get_health()
