import logging
from typing import Dict, Any, Tuple
from app.schemas.digital_twin import EnergyState, SubsystemStatus

logger = logging.getLogger(__name__)

STATION_ENERGY_CONFIGS = {
    "Maitri": {
        "fuel_capacity": 180000.0,  # Liters Arctic Grade HSD
        "initial_fuel": 128400.0,
        "battery_capacity_kwh": 350.0,
        "wind_capacity_kw": 25.0,
        "base_load_kw": 36.0,
        "dg_rated_kw": 125.0,
    },
    "Bharati": {
        "fuel_capacity": 250000.0,  # Liters
        "initial_fuel": 194200.0,
        "battery_capacity_kwh": 500.0,
        "wind_capacity_kw": 40.0,
        "base_load_kw": 44.0,
        "dg_rated_kw": 160.0,
    },
}


class EnergyService:
    def __init__(self):
        self._state: Dict[str, Dict[str, float]] = {}
        for st, cfg in STATION_ENERGY_CONFIGS.items():
            self._state[st] = {
                "fuel_liters": cfg["initial_fuel"],
                "battery_soc": 78.5,
                "dg_load_kw": 68.0,
            }

    def compute_energy_state(
        self,
        station_id: str,
        temperature: float,
        wind_speed: float,
        demand_override_pct: float = 0.0,
        fuel_override_liters: float = None,
    ) -> EnergyState:
        cfg = STATION_ENERGY_CONFIGS.get(station_id, STATION_ENERGY_CONFIGS["Maitri"])
        curr = self._state.get(station_id, {
            "fuel_liters": cfg["initial_fuel"],
            "battery_soc": 75.0,
            "dg_load_kw": 65.0,
        })

        # 1. Wind generation based on aerodynamic power curve
        wind_kw = 0.0
        if 3.0 <= wind_speed < 12.0:
            wind_kw = cfg["wind_capacity_kw"] * ((wind_speed - 3.0) / 9.0) ** 1.8
        elif 12.0 <= wind_speed < 25.0:
            wind_kw = cfg["wind_capacity_kw"]
        elif wind_speed >= 25.0:
            # High-wind cut-out for mechanical storm protection
            wind_kw = 0.0

        wind_kw = round(wind_kw, 1)

        # 2. Consumption: base load + climate-dependent thermal heating load + wind chill factor
        base = cfg["base_load_kw"] * (1.0 + demand_override_pct / 100.0)
        thermal_load = max(0.0, (-temperature) * 1.45)
        wind_chill_heating = max(0.0, (wind_speed - 8.0) * 0.6) if wind_speed > 8.0 else 0.0
        trace_heat = 12.0 if temperature < -8.0 else 4.0

        total_consumption = round(base + thermal_load + wind_chill_heating + trace_heat, 1)

        # 3. Diesel generation needed to meet load while maintaining battery buffer
        dg_needed = max(30.0, total_consumption - wind_kw)
        dg_needed = min(cfg["dg_rated_kw"] * 1.8, dg_needed)
        dg_kw = round(dg_needed, 1)

        # 4. Net generation
        solar_kw = 2.5 if -5.0 < temperature < 5.0 else 0.0
        total_gen = round(dg_kw + wind_kw + solar_kw, 1)

        # 5. Battery State of Charge (BESS)
        net_power = total_gen - total_consumption
        soc = curr["battery_soc"] + (net_power * 0.015)
        soc = round(max(20.0, min(100.0, soc)), 1)
        curr["battery_soc"] = soc

        # 6. Fuel Burn Rate (Specific fuel consumption ~ 0.255 L/kWh)
        hourly_burn = round(dg_kw * 0.255 + 2.0, 1)

        # Fuel level
        fuel_remaining = fuel_override_liters if fuel_override_liters is not None else curr["fuel_liters"]
        fuel_pct = round((fuel_remaining / cfg["fuel_capacity"]) * 100.0, 1)
        autonomy_days = round(fuel_remaining / (hourly_burn * 24.0), 1) if hourly_burn > 0 else 999.0

        status = SubsystemStatus.NORMAL
        if fuel_pct < 20.0 or autonomy_days < 10.0 or soc < 35.0:
            status = SubsystemStatus.CRITICAL
        elif fuel_pct < 35.0 or autonomy_days < 20.0 or total_consumption > 115.0 or soc < 50.0:
            status = SubsystemStatus.WARNING

        return EnergyState(
            generation_kw=total_gen,
            consumption_kw=total_consumption,
            diesel_gen_kw=dg_kw,
            wind_gen_kw=wind_kw,
            solar_gen_kw=solar_kw,
            battery_soc_pct=soc,
            battery_power_kw=round(net_power, 1),
            fuel_level_liters=round(fuel_remaining, 1),
            fuel_capacity_liters=cfg["fuel_capacity"],
            fuel_pct=fuel_pct,
            hourly_burn_liters=hourly_burn,
            autonomy_days=autonomy_days,
            status=status,
        )

    def apply_fuel_consumption(self, station_id: str, hours_elapsed: float = 0.05):
        """Gradually decrements fuel during simulation ticks."""
        curr = self._state.get(station_id)
        if curr:
            burn = curr.get("dg_load_kw", 65.0) * 0.255 * hours_elapsed
            curr["fuel_liters"] = max(1000.0, curr["fuel_liters"] - burn)


energy_service = EnergyService()
