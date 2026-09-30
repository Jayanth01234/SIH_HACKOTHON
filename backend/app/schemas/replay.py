from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ReplayFrame(BaseModel):
    frame_index: int
    timestamp: datetime
    temperature: float
    wind_speed: float
    atmospheric_pressure: float
    hazard_level: str
    hazard_probability: float
    energy_consumption_kw: float
    battery_soc_pct: float
    fuel_autonomy_days: float
    active_alerts_count: int
    dominant_event: str


class ReplayEventMetadata(BaseModel):
    event_id: str
    station_id: str
    title: str
    date_range: str
    description: str
    total_frames: int
    peak_hazard: str
    peak_wind_speed: float
    min_pressure: float


class ReplaySessionResponse(BaseModel):
    event_metadata: ReplayEventMetadata
    frames: List[ReplayFrame]


class DataQualitySummary(BaseModel):
    total_records: int
    valid_records: int
    suspect_records: int
    stale_records: int
    missing_values_detected: int
    duplicate_records_detected: int
    data_quality_score_pct: float
    source_distribution: Dict[str, int]
    validation_rules_applied: List[str]
    recent_anomalies: List[Dict[str, Any]]
