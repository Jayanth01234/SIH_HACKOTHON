from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class StationName(str, Enum):
    MAITRI = "Maitri"
    BHARATI = "Bharati"


class WeatherObservation(BaseModel):
    id: str = Field(..., description="Unique deterministic identifier for observation")
    station: StationName = Field(..., description="Station name (Maitri or Bharati)")
    timestamp: datetime = Field(..., description="Timestamp in ISO 8601 format")
    temperature: Optional[float] = Field(None, description="Air temperature in °C")
    relative_humidity: Optional[float] = Field(None, description="Relative humidity in %")
    wind_speed: Optional[float] = Field(None, description="Wind speed in m/s")
    wind_direction: Optional[float] = Field(None, description="Wind direction in degrees")
    atmospheric_pressure: Optional[float] = Field(None, description="Atmospheric barometric pressure in hPa")

    model_config = ConfigDict(from_attributes=True)


class MetricSummary(BaseModel):
    count: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None


class StationStatistics(BaseModel):
    station: StationName
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    total_records: int
    temperature: Optional[MetricSummary] = None
    relative_humidity: Optional[MetricSummary] = None
    wind_speed: Optional[MetricSummary] = None
    wind_direction: Optional[MetricSummary] = None
    atmospheric_pressure: Optional[MetricSummary] = None


class StationInfo(BaseModel):
    station: StationName
    country: str
    commissioned: int
    region: str
    latitude: float
    longitude: float
    elevation_meters: float
    data_source: str
    total_observations: int
    earliest_observation: Optional[datetime] = None
    latest_observation: Optional[datetime] = None


class ObservationListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    station: Optional[StationName] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    data: List[WeatherObservation]


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    ingested_stations: List[str]
    total_observations: int
    timestamp: datetime
