from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.observation import StationName


class LiveStatus(str, Enum):
    VERIFIED_LIVE = "verified_live"
    STALE = "stale"
    UNAVAILABLE = "unavailable"


class LiveDataPoint(BaseModel):
    timestamp: datetime
    temperature: Optional[float] = None
    wind_speed: Optional[float] = None
    atmospheric_pressure: Optional[float] = None
    relative_humidity: Optional[float] = None


class LiveObservationResponse(BaseModel):
    station: StationName
    status: LiveStatus = Field(..., description="'verified_live', 'stale', or 'unavailable'")
    data_integrity_tag: str = Field(
        default="[ VERIFIED LIVE NCPOR DATA ]",
        description="Formal strict provenance label for UI presentation"
    )
    source_url: str = Field(..., description="Official NCPOR public portal source URL")
    observation_time: Optional[datetime] = None
    temperature: Optional[float] = Field(None, description="Air temperature in °C")
    relative_humidity: Optional[float] = Field(None, description="Relative humidity in %")
    atmospheric_pressure: Optional[float] = Field(None, description="Barometric pressure in hPa")
    wind_speed_ms: Optional[float] = Field(None, description="Wind speed in m/s")
    wind_speed_knots: Optional[float] = Field(None, description="Wind speed in knots as published by NCPOR")
    last_fetched_at: datetime
    series_24h: List[LiveDataPoint] = Field(
        default_factory=list,
        description="Chronological recent telemetry data points extracted from live dashboard"
    )
    summary_stats: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
