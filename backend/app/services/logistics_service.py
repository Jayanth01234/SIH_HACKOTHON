import logging
from typing import Dict, List, Optional
from app.schemas.digital_twin import (
    LogisticsItem,
    LogisticsState,
    SubsystemStatus,
)

logger = logging.getLogger(__name__)


class LogisticsService:
    def __init__(self):
        self._inventory: Dict[str, Dict[str, Dict]] = {
            "Maitri": {
                "fuel_diesel": {
                    "category": "Energy & Fuel",
                    "name": "Arctic Grade High Speed Diesel (HSD)",
                    "quantity": 128400.0,
                    "capacity": 180000.0,
                    "unit": "Liters",
                    "daily_consumption": 480.0,
                    "threshold_days": 25.0,
                },
                "food_rations": {
                    "category": "Life Support",
                    "name": "Expedition Rations & Freeze-Dried Stocks",
                    "quantity": 3800.0,
                    "capacity": 5000.0,
                    "unit": "Ration Packs (P-days)",
                    "daily_consumption": 24.0,  # 24 winter expeditioners
                    "threshold_days": 45.0,
                },
                "dg_spares": {
                    "category": "Maintenance",
                    "name": "Diesel Generator Injector & Filter Kits",
                    "quantity": 14.0,
                    "capacity": 20.0,
                    "unit": "Service Kits",
                    "daily_consumption": 0.05,
                    "threshold_days": 30.0,
                },
                "medical_oxygen": {
                    "category": "Medical",
                    "name": "Medical Grade Compressed Oxygen Cylinders",
                    "quantity": 28.0,
                    "capacity": 30.0,
                    "unit": "Cylinders (50L)",
                    "daily_consumption": 0.04,
                    "threshold_days": 60.0,
                },
                "water_membrane": {
                    "category": "Life Support",
                    "name": "Reverse Osmosis / Intake Filter Modules",
                    "quantity": 8.0,
                    "capacity": 12.0,
                    "unit": "Modules",
                    "daily_consumption": 0.02,
                    "threshold_days": 45.0,
                },
            },
            "Bharati": {
                "fuel_diesel": {
                    "category": "Energy & Fuel",
                    "name": "Arctic Grade High Speed Diesel (HSD)",
                    "quantity": 194200.0,
                    "capacity": 250000.0,
                    "unit": "Liters",
                    "daily_consumption": 540.0,
                    "threshold_days": 30.0,
                },
                "food_rations": {
                    "category": "Life Support",
                    "name": "Expedition Rations & Frozen Stores",
                    "quantity": 4400.0,
                    "capacity": 6000.0,
                    "unit": "Ration Packs (P-days)",
                    "daily_consumption": 23.0,  # 23 winter expeditioners
                    "threshold_days": 50.0,
                },
                "dg_spares": {
                    "category": "Maintenance",
                    "name": "Volvo Penta D13 Spares & Lube Oil Reserves",
                    "quantity": 18.0,
                    "capacity": 24.0,
                    "unit": "Service Sets",
                    "daily_consumption": 0.06,
                    "threshold_days": 40.0,
                },
                "medical_oxygen": {
                    "category": "Medical",
                    "name": "Emergency Medical O2 & Trauma Packs",
                    "quantity": 32.0,
                    "capacity": 36.0,
                    "unit": "Cylinders (50L)",
                    "daily_consumption": 0.04,
                    "threshold_days": 60.0,
                },
                "water_membrane": {
                    "category": "Life Support",
                    "name": "Desalination RO Spiral Wound Elements",
                    "quantity": 12.0,
                    "capacity": 16.0,
                    "unit": "Cartridges",
                    "daily_consumption": 0.03,
                    "threshold_days": 50.0,
                },
            },
        }

    def compute_logistics_state(
        self,
        station_id: str,
        active_fuel_liters: Optional[float] = None,
        hourly_burn_liters: Optional[float] = None,
    ) -> LogisticsState:
        st_inv = self._inventory.get(station_id, self._inventory["Maitri"])
        items_list: List[LogisticsItem] = []

        # If live energy burn rate is provided, update daily fuel consumption dynamically!
        if hourly_burn_liters and hourly_burn_liters > 0:
            st_inv["fuel_diesel"]["daily_consumption"] = round(hourly_burn_liters * 24.0, 1)

        if active_fuel_liters is not None:
            st_inv["fuel_diesel"]["quantity"] = round(active_fuel_liters, 1)

        fuel_days = 0.0
        rations_days = 0.0

        for item_id, item in st_inv.items():
            qty = item["quantity"]
            daily = item["daily_consumption"]
            days_rem = round(qty / daily, 1) if daily > 0 else 999.0
            thresh = item["threshold_days"]

            if item_id == "fuel_diesel":
                fuel_days = days_rem
            elif item_id == "food_rations":
                rations_days = days_rem

            status = SubsystemStatus.NORMAL
            if days_rem < thresh * 0.5:
                status = SubsystemStatus.CRITICAL
            elif days_rem < thresh:
                status = SubsystemStatus.WARNING

            items_list.append(
                LogisticsItem(
                    id=item_id,
                    category=item["category"],
                    name=item["name"],
                    quantity=round(qty, 1),
                    capacity=item["capacity"],
                    unit=item["unit"],
                    daily_consumption=round(daily, 2),
                    days_remaining=days_rem,
                    reorder_threshold=thresh,
                    status=status,
                )
            )

        overall_status = SubsystemStatus.NORMAL
        if any(i.status == SubsystemStatus.CRITICAL for i in items_list):
            overall_status = SubsystemStatus.CRITICAL
        elif any(i.status == SubsystemStatus.WARNING for i in items_list):
            overall_status = SubsystemStatus.WARNING

        return LogisticsState(
            items=items_list,
            fuel_days=fuel_days,
            rations_days=rations_days,
            spares_health=92.5,
            resupply_ship_status="MV Vasiliy Golovnin scheduled Cape Town - Antarctica voyage (46th ISEA)",
            resupply_window_days=68,
            status=overall_status,
        )


logistics_service = LogisticsService()
