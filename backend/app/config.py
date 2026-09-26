from pathlib import Path
from typing import Dict, List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""

    PROJECT_NAME: str = "POLARIS Data Engine"
    DESCRIPTION: str = (
        "Digital Twin & Remote Management Platform for India's Antarctic Research Stations (Maitri & Bharati). "
        "Standardized AWS telemetry ingestion, validation, and analytics API."
    )
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    ROOT_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = ROOT_DIR / "data"

    MAITRI_CSV_PATH: Path = DATA_DIR / "maitri" / "jan_2015.csv"
    BHARATI_CSV_PATH: Path = DATA_DIR / "bharati" / "jan_2015.csv"
    BHARATI_CSV_FALLBACK_PATH: Path = DATA_DIR / "bharathi" / "jan_2015.csv"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["*"]

    STATIONS_METADATA: Dict[str, dict] = {
        "Maitri": {
            "name": "Maitri",
            "country": "India",
            "commissioned": 1989,
            "region": "Schirmacher Oasis, Queen Maud Land, East Antarctica",
            "latitude": -70.767,
            "longitude": 11.733,
            "elevation_meters": 117.0,
            "data_source": "NCPOR / NPDC AWS Historical Archive (Jan 2015)",
        },
        "Bharati": {
            "name": "Bharati",
            "country": "India",
            "commissioned": 2012,
            "region": "Larsemann Hills, Princess Elizabeth Land, East Antarctica",
            "latitude": -69.407,
            "longitude": 76.190,
            "elevation_meters": 35.0,
            "data_source": "NCPOR / NPDC AWS Historical Archive (Jan 2015)",
        },
    }

    def get_station_csv_path(self, station: str) -> Path:
        st_lower = station.lower().strip()
        if st_lower == "maitri":
            return self.MAITRI_CSV_PATH
        elif st_lower in ("bharati", "bharathi"):
            if self.BHARATI_CSV_PATH.exists():
                return self.BHARATI_CSV_PATH
            elif self.BHARATI_CSV_FALLBACK_PATH.exists():
                return self.BHARATI_CSV_FALLBACK_PATH
            return self.BHARATI_CSV_PATH
        raise ValueError(f"Unknown station: {station}")

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
