from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


def utc_now():
    return datetime.now(timezone.utc)


class AcknowledgeAlertRequest(BaseModel):
    operator: str = Field(default="NCPOR Remote Operator", description="Operator name or callsign")
    notes: Optional[str] = Field(None, description="Operational notes or reasoning")


class ResolveAlertRequest(BaseModel):
    operator: str = Field(default="NCPOR Remote Operator")
    resolution_notes: str = Field(..., description="Action taken to resolve hazard/alert")


class OperatorActionCreate(BaseModel):
    station_id: str
    action: str = Field(..., description="ACKNOWLEDGE, INVESTIGATE, ESCALATE, RESOLVE, NOTE")
    alert_id: Optional[str] = None
    operator: str = Field(default="NCPOR Duty Officer")
    notes: Optional[str] = None
    resulting_state: Optional[str] = None


class OperatorActionResponse(BaseModel):
    id: str
    station_id: str
    timestamp: datetime
    operator: str
    action: str
    alert_id: Optional[str] = None
    notes: Optional[str] = None
    resulting_state: Optional[str] = None


class AlertDetailResponse(BaseModel):
    id: str
    station_id: str
    timestamp: datetime
    severity: str
    category: str
    title: str
    description: str
    risk_score: float
    drivers: List[str]
    affected_systems: List[str]
    recommended_action: str
    status: str
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    notes: Optional[str] = None
