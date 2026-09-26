import logging
from typing import Optional
from app.storage.repository import ObservationRepository
from app.ingestion.csv_source import NCPORCSVSource

logger = logging.getLogger(__name__)
_repository_instance: Optional[ObservationRepository] = None


def get_repository() -> ObservationRepository:
    global _repository_instance
    if _repository_instance is None:
        source = NCPORCSVSource()
        _repository_instance = ObservationRepository(data_source=source)
        _repository_instance.load_data()
    return _repository_instance
