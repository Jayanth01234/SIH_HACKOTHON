import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.main import app
from app.api.dependencies import get_repository
from app.storage.repository import ObservationRepository


@pytest.fixture(scope="session")
def repository() -> ObservationRepository:
    repo = get_repository()
    repo._ensure_loaded()
    return repo


@pytest.fixture(scope="session")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client
