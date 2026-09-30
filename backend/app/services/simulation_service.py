import asyncio
import logging
import math
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.schemas.digital_twin import (
    ConnectivityStatus,
    DataMode,
    StationAlert,
)
from app.services.alert_service import alert_service

logger = logging.getLogger(__name__)


def utc_now():
    return datetime.now(timezone.utc)


DEMO_SEVERE_WEATHER_STEPS = [
    {
        "step": 1,
        "title": "Baseline Katabatic Wind Build-up",
        "description": "Inland plateau air cooling accelerates gravity-driven katabatic wind down the slope toward Maitri. Wind rises from 8.2 m/s to 14.5 m/s.",
        "wind_speed": 14.5,
        "temperature": -14.2,
        "pressure": 981.0,
        "pressure_trend": -0.4,
        "alert_trigger": None,
    },
    {
        "step": 2,
        "title": "Barometric Depolarization & Pressure Plunge",
        "description": "Cyclonic low-pressure system encroaches from Southern Ocean. Barometer drops sharply by -1.4 hPa/hr to 974.5 hPa.",
        "wind_speed": 19.8,
        "temperature": -17.5,
        "pressure": 974.5,
        "pressure_trend": -1.4,
        "alert_trigger": None,
    },
    {
        "step": 3,
        "title": "ML Hazard Probability Spike",
        "description": "RandomForest feature extractor flags correlated wind acceleration and pressure plunge. Risk probability climbs to 0.74.",
        "wind_speed": 23.4,
        "temperature": -19.8,
        "pressure": 968.2,
        "pressure_trend": -2.1,
        "alert_trigger": None,
    },
    {
        "step": 4,
        "title": "System Predicts CRITICAL Blizzard Risk",
        "description": "Model outputs CRITICAL risk level (prob 0.88). Explainable AI attributes 54% weight to pressure decline rate.",
        "wind_speed": 27.6,
        "temperature": -22.4,
        "pressure": 962.0,
        "pressure_trend": -2.8,
        "alert_trigger": "CRITICAL_WEATHER",
    },
    {
        "step": 5,
        "title": "Infrastructure Mechanical Stress",
        "description": "Antenna guy-wire tension monitors signal 68% load. Priyadarshini lake pump trace heat demand reaches peak duty cycle.",
        "wind_speed": 31.2,
        "temperature": -24.8,
        "pressure": 956.4,
        "pressure_trend": -3.2,
        "alert_trigger": "INFRA_STRESS",
    },
    {
        "step": 6,
        "title": "Energy Microgrid Surge",
        "description": "Space heating and lake trace heating demand surge by +28.5 kW. Diesel Genset DG-02 auto-synchronizes to take secondary load.",
        "wind_speed": 33.5,
        "temperature": -26.1,
        "pressure": 952.8,
        "pressure_trend": -3.0,
        "alert_trigger": None,
    },
    {
        "step": 7,
        "title": "Cross-Domain Impact Engine Activation",
        "description": "Causal reasoning engine traces chain: High Wind → Guy-Wire Deflection → Trace Heat Surge → Fuel Autonomy reduced by 4.2 days.",
        "wind_speed": 34.8,
        "temperature": -26.9,
        "pressure": 951.0,
        "pressure_trend": -2.5,
        "alert_trigger": None,
    },
    {
        "step": 8,
        "title": "Automated Mission Alert Dispatched",
        "description": "POLARIS Alert Engine raises ALT-M-901 (Class 3 Blizzard Lockdown Required) to NCPOR Mission Control console.",
        "wind_speed": 34.0,
        "temperature": -27.2,
        "pressure": 950.5,
        "pressure_trend": -1.8,
        "alert_trigger": "DISPATCH_LOCKDOWN",
    },
    {
        "step": 9,
        "title": "Operator Investigates & Assesses Drivers",
        "description": "Remote NCPOR operator inspects explainable AI radar and cross-domain impact graph. All 5 affected nodes flagged in console.",
        "wind_speed": 33.2,
        "temperature": -26.5,
        "pressure": 951.2,
        "pressure_trend": -0.8,
        "alert_trigger": None,
    },
    {
        "step": 10,
        "title": "Operator Acknowledges Alert & Initiates SOP-01",
        "description": "Operator records digital acknowledgement: 'Class 3 Blizzard Protocol activated. All outdoor traverses frozen. DG-02 verified.'",
        "wind_speed": 31.0,
        "temperature": -25.2,
        "pressure": 953.0,
        "pressure_trend": +0.2,
        "alert_trigger": "AUTO_ACK",
    },
    {
        "step": 11,
        "title": "Operational Action Logged to Audit Trail",
        "description": "Action logged into immutable POLARIS event timeline. State transitions from UNACKNOWLEDGED to MITIGATED.",
        "wind_speed": 26.5,
        "temperature": -23.0,
        "pressure": 958.0,
        "pressure_trend": +1.5,
        "alert_trigger": None,
    },
    {
        "step": 12,
        "title": "Front Stabilizes & Digital Twin Recalibrates",
        "description": "Storm eye moves offshore. Wind decelerates to 18 m/s, pressure climbs to 966 hPa. Microgrid returns to single-DG baseline.",
        "wind_speed": 18.2,
        "temperature": -18.0,
        "pressure": 966.5,
        "pressure_trend": +2.2,
        "alert_trigger": None,
    },
]


class SimulationService:
    def __init__(self):
        self.active_mode = "NORMAL"  # NORMAL, SEVERE_WEATHER, ENERGY_STRESS, LOW_FUEL, CONNECTIVITY_LOSS
        self.station_states: Dict[str, Dict[str, Any]] = {
            "Maitri": {
                "temperature": -12.4,
                "wind_speed": 7.8,
                "wind_direction": 115.0,
                "atmospheric_pressure": 984.2,
                "pressure_trend": -0.15,
                "humidity": 64.0,
                "visibility_km": 15.0,
                "tick_count": 0,
            },
            "Bharati": {
                "temperature": -9.8,
                "wind_speed": 6.2,
                "wind_direction": 85.0,
                "atmospheric_pressure": 989.5,
                "pressure_trend": 0.05,
                "humidity": 68.0,
                "visibility_km": 18.0,
                "tick_count": 0,
            },
        }
        self.is_demo_running = False
        self.demo_current_step = 0
        self.demo_scenario_name = "SEVERE_WEATHER"
        self.connectivity_override: Dict[str, ConnectivityStatus] = {
            "Maitri": ConnectivityStatus.ONLINE,
            "Bharati": ConnectivityStatus.ONLINE,
        }
        self.offline_queue: Dict[str, List[Dict[str, Any]]] = {
            "Maitri": [],
            "Bharati": [],
        }

    def tick(self):
        """Advances deterministic stateful physics for both stations."""
        for st, s in self.station_states.items():
            s["tick_count"] += 1
            t = s["tick_count"]

            if self.is_demo_running and st == "Maitri":
                # Guided by demo scenario step
                idx = min(self.demo_current_step, len(DEMO_SEVERE_WEATHER_STEPS) - 1)
                step_data = DEMO_SEVERE_WEATHER_STEPS[idx]
                s["wind_speed"] = step_data["wind_speed"]
                s["temperature"] = step_data["temperature"]
                s["atmospheric_pressure"] = step_data["pressure"]
                s["pressure_trend"] = step_data["pressure_trend"]
                s["visibility_km"] = max(0.5, 16.0 - (step_data["wind_speed"] * 0.45))
                continue

            # Deterministic, correlated wandering physics
            # state(t+1) = state(t) + trend + noise
            if self.active_mode == "NORMAL":
                temp_delta = math.sin(t * 0.05) * 0.15 + (random.random() - 0.5) * 0.08
                wind_delta = math.cos(t * 0.04) * 0.35 + (random.random() - 0.5) * 0.2
                press_delta = math.sin(t * 0.02) * 0.2 + (random.random() - 0.5) * 0.1

                s["temperature"] = round(max(-35.0, min(-2.0, s["temperature"] + temp_delta)), 1)
                s["wind_speed"] = round(max(2.0, min(22.0, s["wind_speed"] + wind_delta)), 1)
                s["atmospheric_pressure"] = round(max(940.0, min(1015.0, s["atmospheric_pressure"] + press_delta)), 1)
                s["pressure_trend"] = round(press_delta * 4.0, 2)
                s["wind_direction"] = round((s["wind_direction"] + random.uniform(-3, 3)) % 360, 1)

    def start_demo_scenario(self, scenario_name: str = "SEVERE_WEATHER"):
        self.is_demo_running = True
        self.demo_current_step = 0
        self.demo_scenario_name = scenario_name
        logger.info(f"Started automated demo scenario: {scenario_name}")
        self.advance_demo_step(1)

    def stop_demo_scenario(self):
        self.is_demo_running = False
        self.demo_current_step = 0
        logger.info("Stopped demo scenario. Returning to nominal simulation baseline.")

    def advance_demo_step(self, step_number: int) -> Dict[str, Any]:
        self.is_demo_running = True
        step_idx = max(0, min(step_number - 1, len(DEMO_SEVERE_WEATHER_STEPS) - 1))
        self.demo_current_step = step_idx
        step_data = DEMO_SEVERE_WEATHER_STEPS[step_idx]

        st = self.station_states["Maitri"]
        st["wind_speed"] = step_data["wind_speed"]
        st["temperature"] = step_data["temperature"]
        st["atmospheric_pressure"] = step_data["pressure"]
        st["pressure_trend"] = step_data["pressure_trend"]
        st["visibility_km"] = max(0.5, 16.0 - (step_data["wind_speed"] * 0.45))

        # Handle alerts triggered in demo
        if step_data["alert_trigger"] == "CRITICAL_WEATHER":
            alert_service.add_alert(
                StationAlert(
                    id="ALT-M-901",
                    station_id="Maitri",
                    timestamp=utc_now(),
                    severity="CRITICAL",
                    category="Blizzard & Katabatic Hazard",
                    title="Severe Polar Storm Warning — Class 3 Protocol",
                    description=f"Katabatic blizzard accelerating past 27 m/s with rapid barometric plunge ({step_data['pressure_trend']:.1f} hPa/hr). Zero-visibility whiteout imminent.",
                    risk_score=0.88,
                    drivers=["Extreme wind velocity (27.6 m/s)", "Barometric pressure gradient (-2.8 hPa/hr)", "Thermal chill (-22.4°C)"],
                    affected_systems=["All Outdoor Traverses", "SatCom Mast", "Heating Loop", "Diesel DG-02"],
                    recommended_action="Execute Class 3 Station Lockdown immediately. Verify exterior antenna guy-wires.",
                    status="ACTIVE",
                )
            )
        elif step_data["alert_trigger"] == "AUTO_ACK":
            alert_service.acknowledge_alert(
                alert_id="ALT-M-901",
                operator="NCPOR Expedition Lead (Maitri Ops)",
                notes="Blizzard SOP-01 Class 3 executed. Secondary DG-02 online. All personnel inside main station container.",
            )

        return {
            "scenario": self.demo_scenario_name,
            "step": step_idx + 1,
            "total_steps": len(DEMO_SEVERE_WEATHER_STEPS),
            "step_title": step_data["title"],
            "step_description": step_data["description"],
            "telemetry": {
                "wind_speed": step_data["wind_speed"],
                "temperature": step_data["temperature"],
                "pressure": step_data["pressure"],
                "pressure_trend": step_data["pressure_trend"],
            },
        }

    def set_connectivity(self, station_id: str, status: ConnectivityStatus):
        self.connectivity_override[station_id] = status
        logger.info(f"Connectivity for {station_id} set to {status}")

    def queue_offline_packet(self, station_id: str, packet: Dict[str, Any]):
        self.offline_queue[station_id].append(packet)

    def sync_offline_queue(self, station_id: str) -> int:
        count = len(self.offline_queue.get(station_id, []))
        self.offline_queue[station_id] = []
        self.connectivity_override[station_id] = ConnectivityStatus.ONLINE
        logger.info(f"Synchronized {count} queued telemetry packets for {station_id}")
        return count


simulation_service = SimulationService()
