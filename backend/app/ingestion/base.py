from abc import ABC, abstractmethod
from typing import Any, Dict, List
import pandas as pd
from app.schemas.observation import StationName


class IngestionError(Exception):
    pass


class MissingSourceError(IngestionError):
    pass


class InvalidDataFormatError(IngestionError):
    pass


class BaseDataSource(ABC):
    @property
    @abstractmethod
    def source_type(self) -> str:
        pass

    @abstractmethod
    def load_raw_dataframe(self, station: StationName) -> pd.DataFrame:
        pass

    @abstractmethod
    def is_available(self, station: StationName) -> bool:
        pass
