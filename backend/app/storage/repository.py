import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

from app.config import settings
from app.ingestion.base import BaseDataSource
from app.ingestion.csv_source import NCPORCSVSource
from app.processing.cleaner import DataCleaner
from app.schemas.observation import (
    StationName,
    WeatherObservation,
    MetricSummary,
    StationStatistics,
    StationInfo,
    HealthResponse,
)

logger = logging.getLogger(__name__)


class ObservationRepository:
    def __init__(self, data_source: Optional[BaseDataSource] = None):
        self.data_source: BaseDataSource = data_source or NCPORCSVSource()
        self._df: pd.DataFrame = pd.DataFrame()
        self._station_dfs: Dict[str, pd.DataFrame] = {}
        self._is_loaded: bool = False

    def load_data(self) -> None:
        dfs: List[pd.DataFrame] = []
        for station in StationName:
            try:
                if self.data_source.is_available(station):
                    raw_df = self.data_source.load_raw_dataframe(station)
                    clean_df = DataCleaner.clean_dataframe(raw_df, station)
                    self._station_dfs[station.value] = clean_df
                    dfs.append(clean_df)
            except Exception as e:
                logger.error(f"Error ingesting station {station.value}: {e}")

        if dfs:
            self._df = pd.concat(dfs, ignore_index=True)
            self._df["timestamp"] = pd.to_datetime(self._df["timestamp"])
            self._df = self._df.sort_values(by="timestamp", ascending=True).reset_index(drop=True)
        else:
            self._df = pd.DataFrame()

        self._is_loaded = True

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def _ensure_loaded(self) -> None:
        if not self._is_loaded:
            self.load_data()

    def get_dataframe(self, station: Optional[StationName] = None) -> pd.DataFrame:
        self._ensure_loaded()
        if station:
            return self._station_dfs.get(station.value, pd.DataFrame())
        return self._df

    def get_observations(
        self,
        station: Optional[StationName] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
        sort_order: str = "asc",
    ) -> Tuple[List[WeatherObservation], int]:
        self._ensure_loaded()
        df = self.get_dataframe(station)

        if df.empty:
            return [], 0

        mask = pd.Series(True, index=df.index)
        if start_date is not None:
            mask &= (df["timestamp"] >= start_date.replace(tzinfo=None))
        if end_date is not None:
            mask &= (df["timestamp"] <= end_date.replace(tzinfo=None))

        filtered = df[mask]
        total_count = len(filtered)

        ascending = sort_order.lower() != "desc"
        filtered = filtered.sort_values(by="timestamp", ascending=ascending)
        paginated = filtered.iloc[offset : offset + limit]

        observations = DataCleaner.to_observation_models(paginated)
        return observations, total_count

    def get_latest_observation(
        self, station: Optional[StationName] = None
    ) -> Optional[WeatherObservation]:
        self._ensure_loaded()
        df = self.get_dataframe(station)
        if df.empty:
            return None
        latest_row = df.sort_values(by="timestamp", ascending=False).iloc[0:1]
        models = DataCleaner.to_observation_models(latest_row)
        return models[0] if models else None

    def get_observation_by_id(self, observation_id: str) -> Optional[WeatherObservation]:
        self._ensure_loaded()
        if self._df.empty:
            return None
        match = self._df[self._df["id"] == observation_id]
        if match.empty:
            return None
        models = DataCleaner.to_observation_models(match)
        return models[0] if models else None

    def compute_metric_stats(self, series: pd.Series) -> Optional[MetricSummary]:
        clean = series.dropna()
        count = len(clean)
        if count == 0:
            return MetricSummary(count=0, min=None, max=None, mean=None, median=None, std=None)
        return MetricSummary(
            count=count,
            min=round(float(clean.min()), 2),
            max=round(float(clean.max()), 2),
            mean=round(float(clean.mean()), 2),
            median=round(float(clean.median()), 2),
            std=round(float(clean.std()), 2) if count > 1 else 0.0,
        )

    def get_statistics(
        self,
        station: Optional[StationName] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> StationStatistics:
        self._ensure_loaded()
        df = self.get_dataframe(station)

        if not df.empty:
            mask = pd.Series(True, index=df.index)
            if start_date is not None:
                mask &= (df["timestamp"] >= start_date.replace(tzinfo=None))
            if end_date is not None:
                mask &= (df["timestamp"] <= end_date.replace(tzinfo=None))
            df = df[mask]

        target_station = station or StationName.MAITRI
        total_records = len(df)

        if df.empty:
            return StationStatistics(
                station=target_station,
                start_time=start_date,
                end_time=end_date,
                total_records=0,
            )

        return StationStatistics(
            station=target_station,
            start_time=df["timestamp"].min().to_pydatetime(),
            end_time=df["timestamp"].max().to_pydatetime(),
            total_records=total_records,
            temperature=self.compute_metric_stats(df["temperature"]),
            relative_humidity=self.compute_metric_stats(df["relative_humidity"]),
            wind_speed=self.compute_metric_stats(df["wind_speed"]),
            wind_direction=self.compute_metric_stats(df["wind_direction"]),
            atmospheric_pressure=self.compute_metric_stats(df["atmospheric_pressure"]),
        )

    def get_station_metadata(self, station: StationName) -> Optional[StationInfo]:
        self._ensure_loaded()
        meta = settings.STATIONS_METADATA.get(station.value, {})
        st_df = self._station_dfs.get(station.value, pd.DataFrame())
        total = len(st_df)
        earliest = st_df["timestamp"].min().to_pydatetime() if total > 0 else None
        latest = st_df["timestamp"].max().to_pydatetime() if total > 0 else None

        return StationInfo(
            station=station,
            country=meta.get("country", "India"),
            commissioned=meta.get("commissioned", 0),
            region=meta.get("region", "Antarctica"),
            latitude=meta.get("latitude", 0.0),
            longitude=meta.get("longitude", 0.0),
            elevation_meters=meta.get("elevation_meters", 0.0),
            data_source=meta.get("data_source", "NCPOR"),
            total_observations=total,
            earliest_observation=earliest,
            latest_observation=latest,
        )

    def list_stations(self) -> List[StationInfo]:
        return [self.get_station_metadata(st) for st in StationName if self.get_station_metadata(st)]

    def get_health(self) -> HealthResponse:
        self._ensure_loaded()
        return HealthResponse(
            status="healthy" if self._is_loaded and len(self._df) > 0 else "degraded",
            project=settings.PROJECT_NAME,
            version=settings.VERSION,
            ingested_stations=list(self._station_dfs.keys()),
            total_observations=len(self._df),
            timestamp=datetime.now(timezone.utc),
        )
