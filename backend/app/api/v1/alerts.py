from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.alerts import (
    AcknowledgeAlertRequest,
    ResolveAlertRequest,
    OperatorActionCreate,
    OperatorActionResponse,
)
from app.schemas.digital_twin import StationAlert
from app.services.alert_service import alert_service

router = APIRouter(tags=["Alerts & Operator Actions"])


@router.post("/alerts/{alert_id}/acknowledge", response_model=StationAlert)
def acknowledge_alert(
    alert_id: str,
    req: AcknowledgeAlertRequest,
) -> StationAlert:
    alert = alert_service.acknowledge_alert(
        alert_id=alert_id,
        operator=req.operator,
        notes=req.notes,
    )
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert


@router.post("/alerts/{alert_id}/resolve", response_model=StationAlert)
def resolve_alert(
    alert_id: str,
    req: ResolveAlertRequest,
) -> StationAlert:
    alert = alert_service.resolve_alert(
        alert_id=alert_id,
        operator=req.operator,
        resolution_notes=req.resolution_notes,
    )
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert


@router.get("/operator-actions", response_model=List[OperatorActionResponse])
def get_operator_actions(
    station: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
) -> List[OperatorActionResponse]:
    """Returns chronological audit timeline of operator interventions and system transitions."""
    return alert_service.get_operator_actions(station_id=station, limit=limit)


@router.post("/operator-actions", response_model=OperatorActionResponse)
def record_operator_action(
    req: OperatorActionCreate,
) -> OperatorActionResponse:
    return alert_service.record_operator_action(
        station_id=req.station_id,
        action=req.action,
        operator=req.operator,
        alert_id=req.alert_id,
        notes=req.notes,
        resulting_state=req.resulting_state,
    )
