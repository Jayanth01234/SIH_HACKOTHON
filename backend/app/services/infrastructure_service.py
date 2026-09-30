import logging
from typing import Dict, List, Optional
from app.schemas.digital_twin import (
    InfrastructureState,
    SubsystemDetail,
    SubsystemStatus,
)

logger = logging.getLogger(__name__)


class InfrastructureService:
    def __init__(self):
        # Initial health states per station
        self._subsystems_state: Dict[str, Dict[str, Dict]] = {
            "Maitri": {
                "heating": {
                    "health": 94.0,
                    "stress": 12.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 19.5,
                    "hours": 740.0,
                    "details": "Central hydronic heating loop operating nominal. Living module ambient: 19.5°C.",
                },
                "power": {
                    "health": 91.0,
                    "stress": 22.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 28.0,
                    "hours": 120.0,
                    "details": "DG-01 primary bus connected, harmonic distortion < 2.1%. Switchgear nominal.",
                },
                "comms": {
                    "health": 97.0,
                    "stress": 8.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 18.2,
                    "hours": 2100.0,
                    "details": "GSAT-7A / Inmarsat tracking lock active (SNR: 18.2 dB). VHF expedition link up.",
                },
                "water": {
                    "health": 88.0,
                    "stress": 26.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 4.1,
                    "hours": 310.0,
                    "details": "Priyadarshini Lake intake trace heating active (+4.1°C). Tank reserve: 14,200 L.",
                },
                "life_support": {
                    "health": 98.0,
                    "stress": 5.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 20.1,
                    "hours": 4200.0,
                    "details": "Atmospheric O2: 20.9%, CO2: 480 ppm. Overpressure dampers sealed.",
                },
                "science": {
                    "health": 93.0,
                    "stress": 10.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 17.5,
                    "hours": 1850.0,
                    "details": "Broadband Seismometer, Riometer and AWS mast telemetry streaming nominal.",
                },
            },
            "Bharati": {
                "heating": {
                    "health": 96.0,
                    "stress": 9.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 21.0,
                    "hours": 1200.0,
                    "details": "Automated energy-efficient HVAC loop active across 134 interlinked containers.",
                },
                "power": {
                    "health": 95.0,
                    "stress": 15.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 26.5,
                    "hours": 450.0,
                    "details": "Triple Volvo Penta D13 genset synchronization bus online. BESS charge nominal.",
                },
                "comms": {
                    "health": 99.0,
                    "stress": 4.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 19.0,
                    "hours": 3200.0,
                    "details": "Dedicated radome high-throughput dual satellite links to NRSC / NCPOR active.",
                },
                "water": {
                    "health": 94.0,
                    "stress": 14.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 5.8,
                    "hours": 890.0,
                    "details": "Reverse osmosis desalination and greywater membrane bioreactor functioning nominal.",
                },
                "life_support": {
                    "health": 99.0,
                    "stress": 3.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 20.8,
                    "hours": 5100.0,
                    "details": "Inergen clean-agent fire suppression system armed. Airlock differential nominal.",
                },
                "science": {
                    "health": 96.0,
                    "stress": 8.0,
                    "status": SubsystemStatus.NORMAL,
                    "temp": 18.0,
                    "hours": 2400.0,
                    "details": "Space weather ionospheric radar & coastal oceanographic lidar operational.",
                },
            },
        }

    def compute_infrastructure_state(
        self,
        station_id: str,
        temperature: float,
        wind_speed: float,
        stress_override: Optional[Dict[str, float]] = None,
    ) -> InfrastructureState:
        st_data = self._subsystems_state.get(station_id, self._subsystems_state["Maitri"])
        subsystems_list: List[SubsystemDetail] = []
        health_scores: List[float] = []

        # Weather impacts on subsystem stress
        # Extreme wind creates physical vibrations on comms antenna guy wires and outdoor masts
        comms_stress = 5.0 + (max(0.0, wind_speed - 15.0) * 2.8) if wind_speed > 15.0 else 5.0
        # Cold temperature stresses water intake lines and trace heating
        water_stress = 10.0 + (max(0.0, -temperature - 10.0) * 2.2) if temperature < -10.0 else 10.0
        # Heating system load stress
        heat_stress = 10.0 + (max(0.0, -temperature - 5.0) * 1.8) if temperature < -5.0 else 10.0

        for sub_id, data in st_data.items():
            base_stress = data["stress"]
            if sub_id == "comms":
                curr_stress = min(100.0, max(base_stress, comms_stress))
            elif sub_id == "water":
                curr_stress = min(100.0, max(base_stress, water_stress))
            elif sub_id == "heating":
                curr_stress = min(100.0, max(base_stress, heat_stress))
            else:
                curr_stress = base_stress

            if stress_override and sub_id in stress_override:
                curr_stress = stress_override[sub_id]

            # Dynamic health calculation based on stress
            calc_health = max(10.0, min(100.0, 100.0 - (curr_stress * 0.55)))

            status = SubsystemStatus.NORMAL
            details = data["details"]

            if curr_stress >= 75.0 or calc_health < 45.0:
                status = SubsystemStatus.CRITICAL
                if sub_id == "comms":
                    details = "CRITICAL: Severe antenna mast sway & guy-wire deflection. SatCom link intermittent."
                elif sub_id == "water":
                    details = "CRITICAL: Intake freeze alarm! Thermal trace circuit load exceeding emergency breaker."
                elif sub_id == "heating":
                    details = "CRITICAL: Hydronic heat exchanger thermal deficit. Zone 2 temperature declining."
            elif curr_stress >= 40.0 or calc_health < 75.0:
                status = SubsystemStatus.WARNING
                if sub_id == "comms":
                    details = f"WARNING: Katabatic wind buffeting ({wind_speed:.1f} m/s). SatCom SNR margin reduced."
                elif sub_id == "water":
                    details = f"WARNING: Water intake line temperature dropping (+{max(1.1, 4.0 - curr_stress*0.04):.1f}°C). Trace heat load elevated."
                elif sub_id == "heating":
                    details = f"WARNING: High exterior thermal gradient ({temperature:.1f}°C). Continuous heating burn active."

            name_map = {
                "heating": "Climate & Heating HVAC",
                "power": "Microgrid Switchgear & UPS",
                "comms": "SatCom & Expedition Comms",
                "water": "Water Line & Trace Heating",
                "life_support": "Atmospheric Life Support",
                "science": "Scientific Instrumentation",
            }

            sub = SubsystemDetail(
                id=sub_id,
                name=name_map.get(sub_id, sub_id.title()),
                status=status,
                health_score=round(calc_health, 1),
                stress_index=round(curr_stress, 1),
                temperature_c=data.get("temp"),
                maintenance_hours_left=data.get("hours", 500.0),
                last_inspection="2026-08-15 UTC",
                details=details,
            )
            subsystems_list.append(sub)
            health_scores.append(calc_health)

        avg_health = round(sum(health_scores) / len(health_scores), 1)
        overall_status = SubsystemStatus.NORMAL
        if any(s.status == SubsystemStatus.CRITICAL for s in subsystems_list):
            overall_status = SubsystemStatus.CRITICAL
        elif any(s.status == SubsystemStatus.WARNING for s in subsystems_list):
            overall_status = SubsystemStatus.WARNING

        return InfrastructureState(
            subsystems=subsystems_list,
            overall_health=avg_health,
            status=overall_status,
        )

    def set_subsystem_override(self, station_id: str, sub_id: str, stress: float, status: SubsystemStatus):
        if station_id in self._subsystems_state and sub_id in self._subsystems_state[station_id]:
            self._subsystems_state[station_id][sub_id]["stress"] = stress
            self._subsystems_state[station_id][sub_id]["status"] = status


infrastructure_service = InfrastructureService()
