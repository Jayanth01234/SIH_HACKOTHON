import logging
from pathlib import Path
from typing import Optional, Set
import pandas as pd

from app.config import settings
from app.ingestion.base import BaseDataSource, MissingSourceError, InvalidDataFormatError
from app.schemas.observation import StationName

logger = logging.getLogger(__name__)

REQUIRED_NCPOR_COLUMNS: Set[str] = {
    "Observation Time",
    "Temperature",
    "RH",
    "WS",
    "WD",
    "AP",
}


class NCPORCSVSource(BaseDataSource):
    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or settings.DATA_DIR

    @property
    def source_type(self) -> str:
        return "ncpor_historical_csv"

    def _resolve_station_path(self, station: StationName) -> Path:
        if self.data_dir == settings.DATA_DIR:
            try:
                return settings.get_station_csv_path(station.value)
            except ValueError as e:
                raise MissingSourceError(str(e))

        st_lower = station.value.lower().strip()
        path1 = self.data_dir / st_lower / "jan_2015.csv"
        if path1.exists():
            return path1
        if st_lower in ("bharati", "bharathi"):
            alt_name = "bharathi" if st_lower == "bharati" else "bharati"
            path2 = self.data_dir / alt_name / "jan_2015.csv"
            if path2.exists():
                return path2
        return path1

    def is_available(self, station: StationName) -> bool:
        try:
            path = self._resolve_station_path(station)
            return path.exists() and path.is_file()
        except Exception:
            return False

    def _find_header_line_index(self, file_path: Path) -> int:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            for idx, line in enumerate(f):
                stripped = line.strip()
                if "Observation Time" in stripped and "Temperature" in stripped:
                    return idx
        raise InvalidDataFormatError(
            f"Could not find valid NCPOR header row containing 'Observation Time' in {file_path}"
        )

    def load_raw_dataframe(self, station: StationName) -> pd.DataFrame:
        file_path = self._resolve_station_path(station)
        if not file_path.exists():
            raise MissingSourceError(f"Data file for station '{station.value}' not found at: {file_path}")

        header_index = self._find_header_line_index(file_path)
        try:
            df = pd.read_csv(
                file_path,
                skiprows=header_index,
                skip_blank_lines=True,
                encoding="utf-8",
            )
        except Exception as e:
            raise InvalidDataFormatError(f"Failed to read CSV for {station.value}: {e}")

        df.columns = [c.strip() for c in df.columns]
        missing_cols = REQUIRED_NCPOR_COLUMNS - set(df.columns)
        if missing_cols:
            raise InvalidDataFormatError(f"CSV for {station.value} is missing required columns: {missing_cols}")

        return df
