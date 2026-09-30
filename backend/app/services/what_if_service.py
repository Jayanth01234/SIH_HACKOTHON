import logging
from typing import Any, Dict, List
from app.schemas.what_if import (
    WhatIfRequest,
    WhatIfResponse,
    WhatIfComparisonMetric,
)
from app.services.energy_service import energy_service
from app.services.infrastructure_service import infrastructure_service
from app.services.logistics_service import logistics_service
from app.services.cross_domain_service import cross_domain_service

logger = logging.getLogger(__name__)


class WhatIfService:
    def evaluate_what_if(
        self,
        req: WhatIfRequest,
        current_env: Dict[str, float],
    ) -> WhatIfResponse:
        st_id = req.station_id

        curr_t = current_env.get("temperature", -12.0)
        curr_w = current_env.get("wind_speed", 8.0)
        curr_p = current_env.get("atmospheric_pressure", 985.0)

        # 1. Apply user hypothetical perturbations
        sim_w = max(0.0, curr_w * (1.0 + req.wind_delta_pct / 100.0))
        sim_t = curr_t + req.temp_delta_c
        sim_p = curr_p + req.pressure_delta_hpa

        # 2. Compute current vs simulated Energy
        curr_energy = energy_service.compute_energy_state(st_id, curr_t, curr_w)
        sim_fuel = curr_energy.fuel_level_liters * (1.0 + req.fuel_delta_pct / 100.0)
        sim_energy = energy_service.compute_energy_state(
            st_id,
            sim_t,
            sim_w,
            demand_override_pct=req.energy_demand_delta_pct,
            fuel_override_liters=sim_fuel,
        )

        # 3. Compute current vs simulated Infrastructure
        curr_infra = infrastructure_service.compute_infrastructure_state(st_id, curr_t, curr_w)
        sim_infra = infrastructure_service.compute_infrastructure_state(st_id, sim_t, sim_w)

        # 4. Compute current vs simulated Logistics
        curr_log = logistics_service.compute_logistics_state(
            st_id,
            active_fuel_liters=curr_energy.fuel_level_liters,
            hourly_burn_liters=curr_energy.hourly_burn_liters,
        )
        sim_log = logistics_service.compute_logistics_state(
            st_id,
            active_fuel_liters=sim_energy.fuel_level_liters,
            hourly_burn_liters=sim_energy.hourly_burn_liters,
        )

        # 5. Calculate hypothetical ML hazard probability
        # Correlated formula matching RandomForest weighting
        wind_factor = min(1.0, sim_w / 28.0) * 0.45
        temp_factor = min(1.0, max(0.0, (-sim_t - 5.0) / 30.0)) * 0.25
        press_factor = min(1.0, max(0.0, (1000.0 - sim_p) / 45.0)) * 0.30
        sim_prob = round(min(0.98, max(0.05, wind_factor + temp_factor + press_factor)), 2)

        curr_wind_f = min(1.0, curr_w / 28.0) * 0.45
        curr_temp_f = min(1.0, max(0.0, (-curr_t - 5.0) / 30.0)) * 0.25
        curr_press_f = min(1.0, max(0.0, (1000.0 - curr_p) / 45.0)) * 0.30
        curr_prob = round(min(0.98, max(0.05, curr_wind_f + curr_temp_f + curr_press_f)), 2)

        def get_risk_level(prob: float) -> str:
            if prob >= 0.70:
                return "CRITICAL"
            elif prob >= 0.35:
                return "MODERATE"
            return "LOW"

        curr_risk = get_risk_level(curr_prob)
        sim_risk = get_risk_level(sim_prob)

        # 6. Detailed comparison metrics
        metrics: List[WhatIfComparisonMetric] = [
            WhatIfComparisonMetric(
                metric_name="Wind Speed",
                unit="m/s",
                current_value=round(curr_w, 1),
                simulated_value=round(sim_w, 1),
                delta_value=round(sim_w - curr_w, 1),
                current_status="NORMAL" if curr_w < 15.0 else "WARNING",
                simulated_status="NORMAL" if sim_w < 15.0 else ("CRITICAL" if sim_w > 25.0 else "WARNING"),
                impact_description=f"Wind speed shifts by {req.wind_delta_pct:+.1f}%. High katabatic stress on mast.",
            ),
            WhatIfComparisonMetric(
                metric_name="Ambient Temperature",
                unit="°C",
                current_value=round(curr_t, 1),
                simulated_value=round(sim_t, 1),
                delta_value=round(sim_t - curr_t, 1),
                current_status="NORMAL",
                simulated_status="WARNING" if sim_t < -20.0 else "NORMAL",
                impact_description=f"Thermal envelope change of {req.temp_delta_c:+.1f}°C alters perimeter trace heating.",
            ),
            WhatIfComparisonMetric(
                metric_name="Atmospheric Pressure",
                unit="hPa",
                current_value=round(curr_p, 1),
                simulated_value=round(sim_p, 1),
                delta_value=round(sim_p - curr_p, 1),
                current_status="NORMAL",
                simulated_status="WARNING" if sim_p < 960.0 else "NORMAL",
                impact_description=f"Barometer shifts by {req.pressure_delta_hpa:+.1f} hPa. Frontal passage index.",
            ),
            WhatIfComparisonMetric(
                metric_name="Energy Consumption",
                unit="kW",
                current_value=curr_energy.consumption_kw,
                simulated_value=sim_energy.consumption_kw,
                delta_value=round(sim_energy.consumption_kw - curr_energy.consumption_kw, 1),
                current_status=curr_energy.status.value,
                simulated_status=sim_energy.status.value,
                impact_description=f"Net station power demand changes by {sim_energy.consumption_kw - curr_energy.consumption_kw:+.1f} kW.",
            ),
            WhatIfComparisonMetric(
                metric_name="Fuel Burn Rate",
                unit="L/h",
                current_value=curr_energy.hourly_burn_liters,
                simulated_value=sim_energy.hourly_burn_liters,
                delta_value=round(sim_energy.hourly_burn_liters - curr_energy.hourly_burn_liters, 1),
                current_status="NORMAL",
                simulated_status="WARNING" if sim_energy.hourly_burn_liters > 25.0 else "NORMAL",
                impact_description="Genset diesel consumption rate under simulated thermal and electrical load.",
            ),
            WhatIfComparisonMetric(
                metric_name="Fuel Autonomy",
                unit="Days",
                current_value=curr_energy.autonomy_days,
                simulated_value=sim_energy.autonomy_days,
                delta_value=round(sim_energy.autonomy_days - curr_energy.autonomy_days, 1),
                current_status="NORMAL" if curr_energy.autonomy_days > 25.0 else "WARNING",
                simulated_status="CRITICAL" if sim_energy.autonomy_days < 15.0 else ("WARNING" if sim_energy.autonomy_days < 25.0 else "NORMAL"),
                impact_description=f"Total projected station survival days shift by {sim_energy.autonomy_days - curr_energy.autonomy_days:+.1f} days.",
            ),
            WhatIfComparisonMetric(
                metric_name="Infrastructure Health",
                unit="%",
                current_value=curr_infra.overall_health,
                simulated_value=sim_infra.overall_health,
                delta_value=round(sim_infra.overall_health - curr_infra.overall_health, 1),
                current_status=curr_infra.status.value,
                simulated_status=sim_infra.status.value,
                impact_description="Composite health index across Heating, Power, Comms, Water, and Life Support.",
            ),
        ]

        # Emergent hypothetical alerts
        emergent: List[Dict[str, Any]] = []
        if sim_w > 22.0:
            emergent.append({
                "severity": "CRITICAL" if sim_w > 26.0 else "HIGH",
                "title": "Hypothetical Blizzard Class 3 Threat",
                "description": f"Simulated wind velocity ({sim_w:.1f} m/s) triggers mandatory antenna lockdown.",
            })
        if sim_energy.autonomy_days < 25.0:
            emergent.append({
                "severity": "WARNING",
                "title": "Hypothetical Fuel Threshold Breach",
                "description": f"Projected autonomy drops to {sim_energy.autonomy_days:.1f} days (below 25-day safety buffer).",
            })
        if sim_infra.overall_health < 80.0:
            emergent.append({
                "severity": "WARNING",
                "title": "Subsystem Stress Warning",
                "description": "Trace heating and antenna towers experience elevated thermal and aerodynamic stress.",
            })

        affected_subs = [s.name for s in sim_infra.subsystems if s.status.value in ["WARNING", "CRITICAL"]]

        advisory = (
            f"WHAT-IF OUTCOME: Simulated changes elevate risk from {curr_risk} ({int(curr_prob*100)}%) "
            f"to {sim_risk} ({int(sim_prob*100)}%). Microgrid demand moves to {sim_energy.consumption_kw:.1f} kW, "
            f"causing fuel endurance to adjust by {sim_energy.autonomy_days - curr_energy.autonomy_days:+.1f} days. "
            f"Affected systems: {', '.join(affected_subs) if affected_subs else 'None (Nominal tolerances maintained)'}."
        )

        return WhatIfResponse(
            station_id=st_id,
            inputs=req,
            risk_level_current=curr_risk,
            risk_level_simulated=sim_risk,
            risk_probability_current=curr_prob,
            risk_probability_simulated=sim_prob,
            metrics_comparison=metrics,
            affected_subsystems=affected_subs,
            emergent_alerts=emergent,
            operator_advisory=advisory,
        )


what_if_service = WhatIfService()
