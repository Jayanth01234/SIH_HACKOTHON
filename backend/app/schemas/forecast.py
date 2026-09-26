from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.observation import StationName


class MetricForecast(BaseModel):
    current: float = Field(..., description="Most recent recorded baseline observation")
    forecast_next_hour: float = Field(..., description="Immediate next hour forecast (weighted avg + trend)")
    forecast_24h: float = Field(..., description="Projected 24-hour forward value")
    trend_slope: float = Field(..., description="Least-squares linear trend rate of change per hour")
    std_dev: float = Field(..., description="Standard deviation across baseline window")
    ci_lower: float = Field(..., description="95% Confidence Interval Lower Bound")
    ci_upper: float = Field(..., description="95% Confidence Interval Upper Bound")
    unit: str = Field(..., description="Physical measurement unit")


class ForecastPoint(BaseModel):
    step_hours: int = Field(..., description="Hours forward from reference observation")
    timestamp: datetime
    temperature: float
    temp_ci_lower: float
    temp_ci_upper: float
    wind_speed: float
    wind_ci_lower: float
    wind_ci_upper: float
    atmospheric_pressure: float
    pressure_ci_lower: float
    pressure_ci_upper: float


class ForecastAccuracy(BaseModel):
    mae_temperature: Optional[float] = Field(None, description="Mean Absolute Error (°C)")
    mape_temperature: Optional[float] = Field(None, description="Mean Absolute Percentage Error (%)")
    mae_wind_speed: Optional[float] = Field(None, description="Mean Absolute Error (m/s)")
    mape_wind_speed: Optional[float] = Field(None, description="Mean Absolute Percentage Error (%)")
    mae_pressure: Optional[float] = Field(None, description="Mean Absolute Error (hPa)")
    mape_pressure: Optional[float] = Field(None, description="Mean Absolute Percentage Error (%)")
    tracked_evaluations: int = Field(default=0, description="Total rolling backtest verification points")


class ForecastResponse(BaseModel):
    station: StationName
    generated_at: datetime
    reference_observation_time: datetime
    horizon_hours: int = 24
    methodology: str = Field(
        default="Weighted Moving Average [0.35, 0.25, 0.20, 0.12, 0.08] + Least-Squares Linear Trend Extrapolation",
        description="Explainable statistical forecast algorithm specification"
    )
    weights: List[float] = Field(
        default=[0.35, 0.25, 0.20, 0.12, 0.08],
        description="Recency decay weights applied to past 5 chronological observations"
    )
    data_integrity_tag: str = Field(
        default="[ AI FORECAST ]",
        description="Strict data integrity and provenance label"
    )
    temperature: MetricForecast
    wind_speed: MetricForecast
    atmospheric_pressure: MetricForecast
    hourly_projection: List[ForecastPoint]
    accuracy_metrics: ForecastAccuracy
