import logging
from typing import Dict, List, Optional
from app.schemas.cross_domain import (
    CrossDomainImpactAnalysis,
    DependencyNode,
    DependencyEdge,
    CausalChainStep,
)

logger = logging.getLogger(__name__)


class CrossDomainService:
    def analyze_impact(
        self,
        station_id: str,
        temperature: float,
        wind_speed: float,
        pressure: float,
        pressure_trend: float,
        energy_consumption: float,
        fuel_autonomy_days: float,
        battery_soc: float,
        hazard_level: str,
    ) -> CrossDomainImpactAnalysis:
        """
        Builds the cross-domain causal dependency graph and step-by-step causal chain.
        """
        # Determine primary driving event
        if wind_speed > 20.0 and pressure_trend < -0.6:
            primary_event = f"Severe Katabatic Storm Front ({wind_speed:.1f} m/s, ΔP {pressure_trend:.2f} hPa/hr)"
        elif wind_speed > 16.0:
            primary_event = f"Elevated Katabatic Winds ({wind_speed:.1f} m/s)"
        elif temperature < -25.0:
            primary_event = f"Deep Polar Cold Inversion ({temperature:.1f} °C)"
        elif fuel_autonomy_days < 18.0:
            primary_event = f"Critical Fuel Reserve Threshold ({fuel_autonomy_days:.1f} Days Autonomy)"
        elif battery_soc < 50.0:
            primary_event = f"BESS Battery Drain Pressure (SoC {battery_soc:.1f}%)"
        else:
            primary_event = "Nominal Antarctic Environmental & Station Operations"

        # Calculate stress levels across domains
        env_stress = min(100.0, max(10.0, (wind_speed / 28.0) * 60.0 + max(0.0, (-temperature - 10.0) * 1.5)))
        infra_stress = min(100.0, max(5.0, env_stress * 0.75 + (15.0 if wind_speed > 18.0 else 0.0)))
        energy_stress = min(100.0, max(15.0, (energy_consumption / 110.0) * 70.0 + (30.0 if battery_soc < 55.0 else 0.0)))
        logistics_stress = min(100.0, max(10.0, max(0.0, (35.0 - fuel_autonomy_days) * 2.5)))
        ops_stress = max(env_stress, infra_stress, energy_stress) * 0.85

        overall_stress = round((env_stress * 0.25 + infra_stress * 0.25 + energy_stress * 0.3 + logistics_stress * 0.2), 1)

        def get_status(stress: float) -> str:
            if stress >= 68.0:
                return "CRITICAL"
            elif stress >= 38.0:
                return "WARNING"
            return "NORMAL"

        # 1. Graph Nodes
        nodes = [
            DependencyNode(
                id="env_node",
                label="Environment & Atmosphere",
                category="environment",
                status=get_status(env_stress),
                value=f"{temperature:.1f}°C | {wind_speed:.1f} m/s | {pressure:.0f} hPa",
                stress_level=round(env_stress, 1),
            ),
            DependencyNode(
                id="infra_node",
                label="Infrastructure & Building Envelope",
                category="infrastructure",
                status=get_status(infra_stress),
                value=f"Mast Deflection {min(4.5, wind_speed * 0.12):.1f}° | Lake Trace Heat",
                stress_level=round(infra_stress, 1),
            ),
            DependencyNode(
                id="energy_node",
                label="Microgrid Power & BESS",
                category="energy",
                status=get_status(energy_stress),
                value=f"{energy_consumption:.1f} kW Load | SoC {battery_soc:.0f}%",
                stress_level=round(energy_stress, 1),
            ),
            DependencyNode(
                id="logistics_node",
                label="Fuel & Arctic Resupply",
                category="logistics",
                status=get_status(logistics_stress),
                value=f"{fuel_autonomy_days:.1f} Days Reserve",
                stress_level=round(logistics_stress, 1),
            ),
            DependencyNode(
                id="ops_node",
                label="Station Operations & Life Safety",
                category="operations",
                status=get_status(ops_stress),
                value=f"Risk Level: {hazard_level}",
                stress_level=round(ops_stress, 1),
            ),
        ]

        # 2. Graph Directed Edges
        edges = [
            DependencyEdge(
                source="env_node",
                target="infra_node",
                relationship="Atmospheric Buffeting & Cold Thermal Gradients",
                impact_magnitude=round(min(1.0, env_stress / 80.0), 2),
                active=env_stress > 35.0,
                description="High wind loads stress antenna guy-wires, radar masts; sub-zero cold chills water piping.",
            ),
            DependencyEdge(
                source="infra_node",
                target="energy_node",
                relationship="Thermal & Pumping Electrical Load Demand",
                impact_magnitude=round(min(1.0, infra_stress / 75.0), 2),
                active=infra_stress > 30.0,
                description="Hydronic space heaters and lake pump trace heaters ramp to maximum kW.",
            ),
            DependencyEdge(
                source="energy_node",
                target="logistics_node",
                relationship="Diesel Burn Rate & Endurance Depletion",
                impact_magnitude=round(min(1.0, energy_stress / 80.0), 2),
                active=energy_stress > 35.0,
                description="Higher kW output increases hourly diesel fuel burn, reducing operational days remaining.",
            ),
            DependencyEdge(
                source="env_node",
                target="ops_node",
                relationship="Blizzard Outdoor Travel Restrictions",
                impact_magnitude=round(min(1.0, env_stress / 90.0), 2),
                active=env_stress > 40.0,
                description="Zero-visibility whiteout conditions trigger mandatory station lockdown.",
            ),
            DependencyEdge(
                source="logistics_node",
                target="ops_node",
                relationship="Fuel Autonomy & Resupply Priority Escalation",
                impact_magnitude=round(min(1.0, logistics_stress / 70.0), 2),
                active=logistics_stress > 40.0,
                description="Declining fuel reserves escalate tanker traverse and vessel priority dispatch.",
            ),
        ]

        # 3. Dynamic Step-by-Step Causal Chain
        causal_chain: List[CausalChainStep] = []
        checklist: List[str] = []

        if wind_speed > 16.0 or pressure_trend < -0.5:
            causal_chain.append(
                CausalChainStep(
                    step_number=1,
                    system="Atmospheric Frontier",
                    event=f"Katabatic gust acceleration to {wind_speed:.1f} m/s and barometric drop of {pressure_trend:.2f} hPa/hr",
                    consequence="Severe outdoor turbulence and rapid thermal dissipation across external structures",
                    severity="ELEVATED",
                    recommended_check="Verify AWS barometer calibration and inspect exterior perimeter camera feeds",
                )
            )
            causal_chain.append(
                CausalChainStep(
                    step_number=2,
                    system="Station Infrastructure",
                    event="Increased aerodynamic drag on communication towers and trace heat cold soak",
                    consequence=f"SatCom antenna deflection, risk of water pipeline freezing at {station_id}",
                    severity="WARNING" if wind_speed < 22.0 else "CRITICAL",
                    recommended_check="Confirm lake water pump trace heating amperage draw (> 18A nominal)",
                )
            )
            causal_chain.append(
                CausalChainStep(
                    step_number=3,
                    system="Microgrid & Energy",
                    event=f"Electrical demand surge to {energy_consumption:.1f} kW to sustain station life-support heaters",
                    consequence="Secondary diesel generator DG-02 auto-synchronized; battery discharge buffer active",
                    severity="WARNING",
                    recommended_check="Verify DG-02 oil pressure and exhaust gas temperature sensors",
                )
            )
            causal_chain.append(
                CausalChainStep(
                    step_number=4,
                    system="Logistics & Fuel Inventory",
                    event=f"Diesel burn rate elevated; calculated autonomy adjusted to {fuel_autonomy_days:.1f} days",
                    consequence="Fuel reserve depletion rate accelerated by 18-28% during storm duration",
                    severity="WARNING" if fuel_autonomy_days < 25.0 else "INFO",
                    recommended_check="Review daily fuel manifest and recalculate emergency reserve buffer",
                )
            )
            causal_chain.append(
                CausalChainStep(
                    step_number=5,
                    system="Remote Mission Operations",
                    event="Overall station operational hazard elevated to HIGH/CRITICAL",
                    consequence="Outdoor scientific traverses suspended; life support and communication fail-safes verified",
                    severity="HIGH",
                    recommended_check="Execute SOP-01 Class 3 Blizzard Protocol and notify NCPOR Expedition Lead",
                )
            )
            checklist = [
                "Execute SOP-01 (Blizzard Class 3 Pre-Flight Lockdown)",
                "Verify water intake trace heat current and temperature loop",
                "Ensure secondary genset DG-02 ready for auto-load transfer",
                "Lock SatCom dish azimuth and secure outdoor meteorological booms",
                "Log operational acknowledgement and dispatch alert summary to NCPOR Goa",
            ]
        else:
            causal_chain.append(
                CausalChainStep(
                    step_number=1,
                    system="Atmospheric Frontier",
                    event=f"Stable polar weather conditions ({temperature:.1f}°C, {wind_speed:.1f} m/s)",
                    consequence="Nominal thermal gradient and minimal aerodynamic structural load",
                    severity="NOMINAL",
                    recommended_check="Routine automated AWS telemetry logging",
                )
            )
            causal_chain.append(
                CausalChainStep(
                    step_number=2,
                    system="Infrastructure & Microgrid",
                    event=f"Base electrical load at steady state ({energy_consumption:.1f} kW)",
                    consequence="DG-01 operating in peak thermal efficiency envelope (65-72% load)",
                    severity="NOMINAL",
                    recommended_check="Check routine lube oil scheduled maintenance hours",
                )
            )
            causal_chain.append(
                CausalChainStep(
                    step_number=3,
                    system="Logistics & Supplies",
                    event=f"Fuel autonomy holding steady at {fuel_autonomy_days:.1f} days",
                    consequence="Reserve levels well above Antarctic safety threshold (threshold: 25 days)",
                    severity="NOMINAL",
                    recommended_check="Monitor upcoming 46th ISEA cargo vessel logistics manifest",
                )
            )
            checklist = [
                "Conduct routine daily subsystem telemetry audit",
                "Log solar PV / wind turbine renewable yield",
                "Inspect BESS state of charge equalization",
            ]

        affected_domains = []
        if env_stress > 35.0:
            affected_domains.append("Environment")
        if infra_stress > 35.0:
            affected_domains.append("Infrastructure")
        if energy_stress > 35.0:
            affected_domains.append("Energy Microgrid")
        if logistics_stress > 35.0:
            affected_domains.append("Logistics & Fuel")

        return CrossDomainImpactAnalysis(
            station_id=station_id,
            primary_event=primary_event,
            overall_system_stress=overall_stress,
            affected_domains=affected_domains if affected_domains else ["Nominal Operations"],
            nodes=nodes,
            edges=edges,
            causal_chain=causal_chain,
            operator_checklist=checklist,
        )


cross_domain_service = CrossDomainService()
