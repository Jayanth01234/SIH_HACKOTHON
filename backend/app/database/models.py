from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    Text,
    Index,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def utc_now():
    return datetime.now(timezone.utc)


class StationRecord(Base):
    __tablename__ = "stations"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    country = Column(String(50), default="India")
    commissioned = Column(Integer, default=1989)
    region = Column(String(200))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_meters = Column(Float, default=0.0)
    data_source = Column(String(200), default="NCPOR")
    created_at = Column(DateTime(timezone=True), default=utc_now)


class ObservationRecord(Base):
    __tablename__ = "observations"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    temperature = Column(Float, nullable=True)
    relative_humidity = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    atmospheric_pressure = Column(Float, nullable=True)
    visibility_km = Column(Float, nullable=True)
    source = Column(String(100), default="SIMULATION")
    data_mode = Column(String(50), default="SIMULATION")
    quality = Column(String(50), default="VALID")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        Index("idx_obs_station_time", "station_id", "timestamp"),
    )


class EnergyTelemetryRecord(Base):
    __tablename__ = "energy_telemetry"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    generation_kw = Column(Float, nullable=False)
    consumption_kw = Column(Float, nullable=False)
    diesel_gen_kw = Column(Float, default=0.0)
    wind_gen_kw = Column(Float, default=0.0)
    solar_gen_kw = Column(Float, default=0.0)
    battery_soc_pct = Column(Float, nullable=False)
    battery_power_kw = Column(Float, default=0.0)
    fuel_level_liters = Column(Float, nullable=False)
    fuel_pct = Column(Float, nullable=False)
    hourly_burn_liters = Column(Float, nullable=False)
    autonomy_days = Column(Float, nullable=False)
    status = Column(String(50), default="NORMAL")
    source = Column(String(100), default="SIMULATION")
    quality = Column(String(50), default="VALID")
    created_at = Column(DateTime(timezone=True), default=utc_now)


class InfrastructureStatusRecord(Base):
    __tablename__ = "infrastructure_status"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    subsystem = Column(String(100), nullable=False)
    status = Column(String(50), default="NORMAL")
    health_score = Column(Float, default=100.0)
    stress_index = Column(Float, default=0.0)
    temperature_c = Column(Float, nullable=True)
    maintenance_hours_left = Column(Float, default=500.0)
    details = Column(Text, nullable=True)
    source = Column(String(100), default="SIMULATION")
    created_at = Column(DateTime(timezone=True), default=utc_now)


class LogisticsInventoryRecord(Base):
    __tablename__ = "logistics_inventory"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    item_category = Column(String(100), nullable=False)
    item_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False)
    capacity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    daily_consumption = Column(Float, default=0.0)
    days_remaining = Column(Float, nullable=False)
    reorder_threshold = Column(Float, nullable=False)
    status = Column(String(50), default="NORMAL")
    source = Column(String(100), default="SIMULATION")
    created_at = Column(DateTime(timezone=True), default=utc_now)


class HazardRecord(Base):
    __tablename__ = "hazards"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    hazard_level = Column(String(50), nullable=False)
    risk_probability = Column(Float, nullable=False)
    primary_driver = Column(String(255), nullable=False)
    horizon = Column(String(50), default="24h")
    model_version = Column(String(100), default="rf-v1.2")
    contributing_factors_json = Column(Text, nullable=True)
    operational_guidance = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(String(100), primary_key=True)
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    severity = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    risk_score = Column(Float, default=0.0)
    drivers = Column(Text, nullable=True)
    affected_systems = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE")
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class OperatorActionRecord(Base):
    __tablename__ = "operator_actions"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=utc_now, index=True)
    operator = Column(String(100), default="NCPOR Duty Officer")
    action = Column(String(100), nullable=False)
    alert_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    resulting_state = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class DataQualityRecord(Base):
    __tablename__ = "data_quality"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    metric = Column(String(100), nullable=False)
    raw_value = Column(Float, nullable=True)
    quality_flag = Column(String(50), default="VALID")
    validation_message = Column(String(255), nullable=True)
    source = Column(String(100), default="SIMULATION")
    created_at = Column(DateTime(timezone=True), default=utc_now)


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(50), nullable=False, index=True)
    forecast_generated_at = Column(DateTime(timezone=True), nullable=False, index=True)
    horizon_hours = Column(Integer, default=24)
    target_timestamp = Column(DateTime(timezone=True), nullable=False)
    temperature_pred = Column(Float, nullable=True)
    wind_speed_pred = Column(Float, nullable=True)
    pressure_pred = Column(Float, nullable=True)
    ci_lower = Column(Float, nullable=True)
    ci_upper = Column(Float, nullable=True)
    model_name = Column(String(100), default="WMA-LinearTrend")
    created_at = Column(DateTime(timezone=True), default=utc_now)
