import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional

FEATURE_COLUMNS = [
    "wind_mean_3d",
    "temperature_mean_3d",
    "wind_trend_3d",
    "temperature_trend_3d",
    "wind_delta",
    "temperature_delta",
    "pressure_trend",
]

FEATURE_DESCRIPTIONS = {
    "wind_mean_3d": "Sustained rolling average wind velocity",
    "temperature_mean_3d": "Baseline ambient temperature trend",
    "wind_trend_3d": "Rate of acceleration in wind speed",
    "temperature_trend_3d": "Rate of atmospheric cooling or warming",
    "wind_delta": "24-hour gust acceleration delta",
    "temperature_delta": "24-hour thermal change / cold front intrusion",
    "pressure_trend": "Rate of barometric pressure change",
}


def get_linear_trend_kernel(w: int) -> np.ndarray:
    """Computes exact linear regression slope weights for a window of size w."""
    if w < 2:
        return np.zeros(w)
    x = np.arange(w)
    c = x - (w - 1) / 2.0
    denom = np.sum(c ** 2)
    return c / denom if denom != 0 else np.zeros(w)


def compute_hazard_features_df(
    df: pd.DataFrame,
    window_hours: int = 72,
    delta_hours: int = 24,
) -> pd.DataFrame:
    """
    Computes Antarctic hazard prediction features for full historical datasets.
    Requires columns: ['timestamp', 'temperature', 'wind_speed', 'atmospheric_pressure']
    """
    data = df.copy()
    data = data.sort_values("timestamp").reset_index(drop=True)

    # 1. Rolling Means
    data["wind_mean_3d"] = (
        data["wind_speed"].rolling(window=window_hours, min_periods=3).mean()
    )
    data["temperature_mean_3d"] = (
        data["temperature"].rolling(window=window_hours, min_periods=3).mean()
    )

    # 2. 24-hour Deltas
    data["wind_delta"] = data["wind_speed"] - data["wind_speed"].shift(delta_hours)
    data["temperature_delta"] = (
        data["temperature"] - data["temperature"].shift(delta_hours)
    )

    # 3. Trends via exact convolution filters
    k_72 = get_linear_trend_kernel(window_hours)
    wind_arr = data["wind_speed"].ffill().bfill().values
    conv_wind = np.convolve(wind_arr, k_72[::-1], mode="full")[: len(wind_arr)]
    conv_wind[: window_hours - 1] = conv_wind[window_hours - 1] if len(conv_wind) >= window_hours else 0.0
    data["wind_trend_3d"] = conv_wind

    temp_arr = data["temperature"].ffill().bfill().values
    conv_temp = np.convolve(temp_arr, k_72[::-1], mode="full")[: len(temp_arr)]
    conv_temp[: window_hours - 1] = conv_temp[window_hours - 1] if len(conv_temp) >= window_hours else 0.0
    data["temperature_trend_3d"] = conv_temp

    k_24 = get_linear_trend_kernel(delta_hours)
    press_arr = data["atmospheric_pressure"].ffill().bfill().values
    conv_press = np.convolve(press_arr, k_24[::-1], mode="full")[: len(press_arr)]
    conv_press[: delta_hours - 1] = conv_press[delta_hours - 1] if len(conv_press) >= delta_hours else 0.0
    data["pressure_trend"] = conv_press

    data[FEATURE_COLUMNS] = data[FEATURE_COLUMNS].bfill().ffill().fillna(0.0)
    return data


def compute_single_inference_features(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Computes feature row for live inference from a list of recent observation records.
    Each record must have keys: 'timestamp', 'temperature', 'wind_speed', 'atmospheric_pressure'.
    Works robustly with 5 to 25+ recent observations.
    """
    if not records:
        return pd.DataFrame([np.zeros(len(FEATURE_COLUMNS))], columns=FEATURE_COLUMNS)

    df = pd.DataFrame(records)
    df = df.sort_values("timestamp").reset_index(drop=True)
    n = len(df)

    wind = df["wind_speed"].astype(float).values
    temp = df["temperature"].astype(float).values
    press = df["atmospheric_pressure"].astype(float).values

    wind_mean = float(np.nanmean(wind)) if len(wind) > 0 else 0.0
    temp_mean = float(np.nanmean(temp)) if len(temp) > 0 else -10.0

    def _slope(arr: np.ndarray) -> float:
        l = len(arr)
        if l < 2:
            return 0.0
        x = np.arange(l)
        c = x - (l - 1) / 2.0
        denom = np.sum(c ** 2)
        if denom == 0:
            return 0.0
        return float(np.sum(c * (arr - np.nanmean(arr))) / denom)

    wind_trend = _slope(wind)
    temp_trend = _slope(temp)
    press_trend = _slope(press)

    wind_delta = float(wind[-1] - wind[0]) if n >= 2 else 0.0
    temp_delta = float(temp[-1] - temp[0]) if n >= 2 else 0.0

    row = {
        "wind_mean_3d": round(wind_mean, 2),
        "temperature_mean_3d": round(temp_mean, 2),
        "wind_trend_3d": round(wind_trend, 3),
        "temperature_trend_3d": round(temp_trend, 3),
        "wind_delta": round(wind_delta, 2),
        "temperature_delta": round(temp_delta, 2),
        "pressure_trend": round(press_trend, 3),
    }

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)
