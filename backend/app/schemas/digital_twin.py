from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ConnectivityStatus(str, Enum):
    ONLINE = "ONLINE"
    DEGRADED = "DEGRADED"
    OFFLINE = "OFFLINE"


class DataMode(str, Enum):
    LIVE = "LIVE"
    PUBLIC_LIVE = "PUBLIC_LIVE"
    SIMULATION = "SIMULATION"
    HISTORICAL = "HISTORICAL"
    OFFLINE = "OFFLINE"


class OverallStatus(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class SubsystemStatus(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    OFFLINE = "OFFLINE"


class EnvironmentState(BaseModel):
    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., description="Relative humidity %")
    wind_speed: float = Field(..., description="Wind speed in m/s")
    wind_direction: float = Field(..., description="Wind direction in degrees")
    atmospheric_pressure: float = Field(..., description="Pressure in hPa")
    visibility_km: float = Field(10.0, description="Visibility in km")
    precipitation_snow: bool = Field(False, description="Precipitation/snow active")
    pressure_trend: float = Field(0.0, description="6-hour pressure change in hPa")
    wind_trend: float = Field(0.0, description="6-hour wind change in m/s")
    trend_arrow: str = Field("→", description="Directional trend indicator")
    quality: str = Field("VALID", description="Data quality flag")
    source: str = Field("SIMULATION", description="Underlying telemetry source")


class EnergyState(BaseModel):
    generation_kw: float = Field(..., description="Total active generation in kW")
    consumption_kw: float = Field(..., description="Total station power consumption in kW")
    diesel_gen_kw: float = Field(..., description="Genset output in kW")
    wind_gen_kw: float = Field(0.0, description="Wind turbine contribution in kW")
    solar_gen_kw: float = Field(0.0, description="Solar PV contribution in kW")
    battery_soc_pct: float = Field(..., description="BESS Battery State of Charge %")
    battery_power_kw: float = Field(0.0, description="Net battery charge (+) or discharge (-) in kW")
    fuel_level_liters: float = Field(..., description="Active diesel fuel remaining in liters")
    fuel_capacity_liters: float = Field(..., description="Total diesel storage capacity in liters")
    fuel_pct: float = Field(..., description="Fuel reserve percentage")
    hourly_burn_liters: float = Field(..., description="Current fuel consumption rate in L/h")
    autonomy_days: float = Field(..., description="Estimated endurance at current burn rate")
    status: SubsystemStatus = Field(SubsystemStatus.NORMAL)


class SubsystemDetail(BaseModel):
    id: str
    name: str
    status: SubsystemStatus
    health_score: float = Field(..., ge=0.0, le=100.0, description="0-100 subsystem health score")
    stress_index: float = Field(0.0, ge=0.0, le=100.0, description="Thermal or physical stress %")
    temperature_c: Optional[float] = None
    maintenance_hours_left: float
    last_inspection: str
    details: str


class InfrastructureState(BaseModel):
    subsystems: List[SubsystemDetail]
    overall_health: float = Field(..., ge=0.0, le=100.0)
    status: SubsystemStatus


class LogisticsItem(BaseModel):
    id: str
    category: str
    name: str
    quantity: float
    capacity: float
    unit: str
    daily_consumption: float
    days_remaining: float
    reorder_threshold: float
    status: SubsystemStatus


class LogisticsState(BaseModel):
    items: List[LogisticsItem]
    fuel_days: float
    rations_days: float
    spares_health: float
    resupply_ship_status: str
    resupply_window_days: int
    status: SubsystemStatus


class StationAlert(BaseModel):
    id: str
    station_id: str
    timestamp: datetime
    severity: str = Field(..., description="INFO, LOW, MEDIUM, HIGH, CRITICAL")
    category: str
    title: str
    description: str
    risk_score: float
    drivers: List[str]
    affected_systems: List[str]
    recommended_action: str
    status: str = Field("ACTIVE", description="ACTIVE, ACKNOWLEDGED, RESOLVED")
    acknowledged_by: Optional[str] = None
    notes: Optional[str] = None


class DigitalTwinIntelligence(BaseModel):
    hazard_level: str
    hazard_probability: float
    primary_driver: str
    top_drivers: List[Dict[str, Any]]
    affected_systems: List[str]
    operational_advisory: str
    model_version: str


class ProvenanceInfo(BaseModel):
    source_name: str
    data_mode: DataMode
    last_synchronized_utc: datetime
    quality_flags: List[str]
    queued_packets: int = 0
    is_live_feed: bool = False


class DigitalTwinState(BaseModel):
    station_id: str
    station_name: str
    location: Dict[str, Any]
    timestamp: datetime
    connectivity_status: ConnectivityStatus
    data_mode: DataMode
    overall_status: OverallStatus
    overall_health_score: float
    environment: EnvironmentState
    energy: EnergyState
    infrastructure: InfrastructureState
    logistics: LogisticsState
    hazards: DigitalTwinIntelligence
    active_alerts: List[StationAlert]
    provenance: ProvenanceInfo
