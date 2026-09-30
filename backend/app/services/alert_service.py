import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.schemas.digital_twin import StationAlert
from app.schemas.alerts import OperatorActionResponse, AlertDetailResponse

logger = logging.getLogger(__name__)


def utc_now():
    return datetime.now(timezone.utc)


class AlertService:
    def __init__(self):
        self._alerts: Dict[str, StationAlert] = {}
        self._operator_actions: List[OperatorActionResponse] = []
        self._seed_initial_alerts()

    def _seed_initial_alerts(self):
        m1 = StationAlert(
            id="ALT-M-101",
            station_id="Maitri",
            timestamp=utc_now(),
            severity="MEDIUM",
            category="Meteorological & Microgrid",
            title="Approaching Katabatic Wind Gust Frontier",
            description="Wind speeds trending above 16.5 m/s with falling barometric pressure (-0.85 hPa/hr). Exterior antenna buffeting expected.",
            risk_score=0.62,
            drivers=["Wind acceleration (+4.2 m/s over 3h)", "Barometric pressure drop (-0.85 hPa/hr)"],
            affected_systems=["Infrastructure (Antenna Mast)", "Energy (Heating Load Surge)"],
            recommended_action="Execute SOP-01 Level 2 Weather Advisory. Check trace heating lines.",
            status="ACTIVE",
        )
        m2 = StationAlert(
            id="ALT-M-102",
            station_id="Maitri",
            timestamp=utc_now(),
            severity="LOW",
            category="Microgrid Maintenance",
            title="Genset DG-02 Scheduled Lube Oil Filter Service",
            description="DG-02 has clocked 3,110 operational hours. Filter element replacement due within 48 running hours.",
            risk_score=0.28,
            drivers=["Cumulative running hours threshold"],
            affected_systems=["Energy (Diesel Generation House)"],
            recommended_action="Schedule filter replacement during low-demand midday window.",
            status="ACTIVE",
        )
        b1 = StationAlert(
            id="ALT-B-201",
            station_id="Bharati",
            timestamp=utc_now(),
            severity="LOW",
            category="Communications",
            title="GSAT Satellite Azimuth Auto-Calibration Check",
            description="Radome tracking angle calibrated within ±0.04°. Uplink SNR 18.4 dB. Nominal state verified.",
            risk_score=0.15,
            drivers=["Routine 30-day tracking sweep"],
            affected_systems=["Communications (Radome Ground Station)"],
            recommended_action="Log calibration verification in monthly NCPOR SatCom register.",
            status="ACTIVE",
        )
        self._alerts[m1.id] = m1
        self._alerts[m2.id] = m2
        self._alerts[b1.id] = b1

        # Seed initial operator action
        self._operator_actions.append(
            OperatorActionResponse(
                id="ACT-001",
                station_id="Maitri",
                timestamp=utc_now(),
                operator="NCPOR Duty Officer (Goa)",
                action="SYSTEM_INIT",
                alert_id=None,
                notes="POLARIS telemetry ingest engine linked to Indian Antarctic Research Stations Digital Twin.",
                resulting_state="NORMAL",
            )
        )

    def get_alerts_for_station(self, station_id: str, status_filter: Optional[str] = None) -> List[StationAlert]:
        alerts = [a for a in self._alerts.values() if a.station_id.lower() == station_id.lower()]
        if status_filter:
            alerts = [a for a in alerts if a.status.upper() == status_filter.upper()]
        return sorted(alerts, key=lambda a: a.timestamp, reverse=True)

    def get_alert_by_id(self, alert_id: str) -> Optional[StationAlert]:
        return self._alerts.get(alert_id)

    def add_alert(self, alert: StationAlert) -> StationAlert:
        # Deduplicate: if an alert with identical title and station exists within last 5 minutes, update it
        for existing in self._alerts.values():
            if (
                existing.station_id.lower() == alert.station_id.lower()
                and existing.title == alert.title
                and existing.status == "ACTIVE"
            ):
                existing.severity = alert.severity
                existing.risk_score = alert.risk_score
                existing.description = alert.description
                existing.timestamp = utc_now()
                return existing

        self._alerts[alert.id] = alert
        return alert

    def acknowledge_alert(self, alert_id: str, operator: str, notes: Optional[str] = None) -> Optional[StationAlert]:
        alert = self._alerts.get(alert_id)
        if not alert:
            return None
        alert.status = "ACKNOWLEDGED"
        alert.acknowledged_by = operator
        alert.notes = notes

        # Log operator action
        self.record_operator_action(
            station_id=alert.station_id,
            action="ACKNOWLEDGE",
            operator=operator,
            alert_id=alert_id,
            notes=notes or f"Acknowledged alert {alert.title}",
            resulting_state="ACKNOWLEDGED",
        )
        return alert

    def resolve_alert(self, alert_id: str, operator: str, resolution_notes: str) -> Optional[StationAlert]:
        alert = self._alerts.get(alert_id)
        if not alert:
            return None
        alert.status = "RESOLVED"
        alert.notes = f"Resolved by {operator}: {resolution_notes}"

        self.record_operator_action(
            station_id=alert.station_id,
            action="RESOLVE",
            operator=operator,
            alert_id=alert_id,
            notes=resolution_notes,
            resulting_state="RESOLVED",
        )
        return alert

    def record_operator_action(
        self,
        station_id: str,
        action: str,
        operator: str = "NCPOR Remote Operator",
        alert_id: Optional[str] = None,
        notes: Optional[str] = None,
        resulting_state: Optional[str] = None,
    ) -> OperatorActionResponse:
        entry = OperatorActionResponse(
            id=f"ACT-{uuid.uuid4().hex[:6].upper()}",
            station_id=station_id,
            timestamp=utc_now(),
            operator=operator,
            action=action,
            alert_id=alert_id,
            notes=notes,
            resulting_state=resulting_state,
        )
        self._operator_actions.insert(0, entry)
        return entry

    def get_operator_actions(self, station_id: Optional[str] = None, limit: int = 50) -> List[OperatorActionResponse]:
        if station_id:
            acts = [a for a in self._operator_actions if a.station_id.lower() == station_id.lower()]
        else:
            acts = self._operator_actions
        return acts[:limit]


alert_service = AlertService()
