import logging
from typing import Optional
import pandas as pd
from app.ingestion.base import BaseDataSource
from app.schemas.observation import StationName

logger = logging.getLogger(__name__)


class NCPORAPISource(BaseDataSource):
    def __init__(self, api_base_url: str = "https://npdc.gov.in/api/v1", api_key: Optional[str] = None):
        self.api_base_url = api_base_url
        self.api_key = api_key

    @property
    def source_type(self) -> str:
        return "ncpor_live_api"

    def is_available(self, station: StationName) -> bool:
        return False

    def load_raw_dataframe(self, station: StationName) -> pd.DataFrame:
        raise NotImplementedError("Live NCPOR API integration will be enabled when remote telemetry credentials are provided.")
