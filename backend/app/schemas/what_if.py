from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class WhatIfRequest(BaseModel):
    station_id: str = Field("Maitri", description="Maitri or Bharati")
    wind_delta_pct: float = Field(0.0, description="Percentage change in wind speed (e.g. +25.0)")
    temp_delta_c: float = Field(0.0, description="Degrees change in ambient temperature (e.g. -6.0)")
    pressure_delta_hpa: float = Field(0.0, description="hPa change in atmospheric pressure (e.g. -12.0)")
    fuel_delta_pct: float = Field(0.0, description="Percentage drop/change in fuel reserve (e.g. -15.0)")
    energy_demand_delta_pct: float = Field(0.0, description="Percentage change in base station load (e.g. +20.0)")


class WhatIfComparisonMetric(BaseModel):
    metric_name: str
    unit: str
    current_value: float
    simulated_value: float
    delta_value: float
    current_status: str
    simulated_status: str
    impact_description: str


class WhatIfResponse(BaseModel):
    station_id: str
    inputs: WhatIfRequest
    risk_level_current: str
    risk_level_simulated: str
    risk_probability_current: float
    risk_probability_simulated: float
    metrics_comparison: List[WhatIfComparisonMetric]
    affected_subsystems: List[str]
    emergent_alerts: List[Dict[str, Any]]
    operator_advisory: str
