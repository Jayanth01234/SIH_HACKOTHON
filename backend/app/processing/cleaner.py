import logging
from typing import List, Optional
import pandas as pd
import numpy as np

from app.schemas.observation import StationName, WeatherObservation
from app.processing.validator import COLUMN_MAPPING, PHYSICAL_BOUNDS

logger = logging.getLogger(__name__)


class DataCleaner:
    @staticmethod
    def clean_dataframe(df: pd.DataFrame, station: StationName) -> pd.DataFrame:
        if df.empty:
            return pd.DataFrame(
                columns=[
                    "id", "station", "timestamp", "temperature",
                    "relative_humidity", "wind_speed", "wind_direction",
                    "atmospheric_pressure",
                ]
            )

        clean_df = df.copy()
        clean_df.columns = [col.strip() for col in clean_df.columns]
        rename_map = {k: v for k, v in COLUMN_MAPPING.items() if k in clean_df.columns}
        clean_df = clean_df.rename(columns=rename_map)

        clean_df["timestamp"] = pd.to_datetime(clean_df["timestamp"], errors="coerce")
        clean_df = clean_df.dropna(subset=["timestamp"])

        metric_columns = [
            "temperature", "relative_humidity", "wind_speed",
            "wind_direction", "atmospheric_pressure",
        ]

        for col in metric_columns:
            if col in clean_df.columns:
                clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce")
                clean_df[col] = clean_df[col].replace([np.inf, -np.inf], np.nan)
                if col in PHYSICAL_BOUNDS:
                    min_val, max_val = PHYSICAL_BOUNDS[col]
                    out_of_bounds = (clean_df[col] < min_val) | (clean_df[col] > max_val)
                    if out_of_bounds.any():
                        clean_df.loc[out_of_bounds, col] = np.nan
                clean_df[col] = clean_df[col].round(2)
            else:
                clean_df[col] = np.nan

        clean_df["station"] = station.value
        clean_df = clean_df.drop_duplicates(subset=["timestamp"], keep="last")
        clean_df = clean_df.sort_values(by="timestamp", ascending=True).reset_index(drop=True)

        clean_df["id"] = clean_df.apply(
            lambda row: f"{station.value}-{row['timestamp'].strftime('%Y%m%d-%H%M%S')}",
            axis=1,
        )

        ordered_cols = [
            "id", "station", "timestamp", "temperature",
            "relative_humidity", "wind_speed", "wind_direction",
            "atmospheric_pressure",
        ]
        return clean_df[ordered_cols]

    @staticmethod
    def to_observation_models(clean_df: pd.DataFrame) -> List[WeatherObservation]:
        observations: List[WeatherObservation] = []
        for row in clean_df.to_dict(orient="records"):
            sanitized = {
                k: (None if pd.isna(v) else v) for k, v in row.items()
            }
            sanitized["station"] = StationName(sanitized["station"])
            observations.append(WeatherObservation(**sanitized))
        return observations
