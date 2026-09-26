import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple
import pandas as pd

logger = logging.getLogger(__name__)

COLUMN_MAPPING: Dict[str, str] = {
    "Observation Time": "timestamp",
    "Temperature": "temperature",
    "RH": "relative_humidity",
    "WS": "wind_speed",
    "WD": "wind_direction",
    "AP": "atmospheric_pressure",
}

PHYSICAL_BOUNDS: Dict[str, Tuple[float, float]] = {
    "temperature": (-100.0, 50.0),
    "relative_humidity": (0.0, 100.0),
    "wind_speed": (0.0, 150.0),
    "wind_direction": (0.0, 360.0),
    "atmospheric_pressure": (700.0, 1100.0)
}


@dataclass
class ValidationReport:
    is_valid: bool
    total_records: int
    valid_records: int
    corrupted_records: int
    missing_columns: List[str] = field(default_factory=list)
    out_of_bounds_counts: Dict[str, int] = field(default_factory=dict)
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class DataValidator:
    @staticmethod
    def validate_schema(df: pd.DataFrame) -> Tuple[bool, List[str]]:
        missing = [col for col in COLUMN_MAPPING.keys() if col not in df.columns]
        if missing:
            return False, [f"Missing required columns: {missing}"]
        return True, []

    @staticmethod
    def audit_dataframe(df: pd.DataFrame) -> ValidationReport:
        total = len(df)
        is_schema_valid, schema_errors = DataValidator.validate_schema(df)
        if not is_schema_valid:
            return ValidationReport(
                is_valid=False,
                total_records=total,
                valid_records=0,
                corrupted_records=total,
                missing_columns=[col for col in COLUMN_MAPPING.keys() if col not in df.columns],
                errors=schema_errors,
            )

        warnings: List[str] = []
        errors: List[str] = []
        out_of_bounds: Dict[str, int] = {}

        parsed_dates = pd.to_datetime(df["Observation Time"], errors="coerce")
        bad_dates_count = parsed_dates.isna().sum()
        if bad_dates_count > 0:
            warnings.append(f"{bad_dates_count} records contain unparseable timestamps.")

        for raw_col, std_col in COLUMN_MAPPING.items():
            if std_col in PHYSICAL_BOUNDS:
                min_val, max_val = PHYSICAL_BOUNDS[std_col]
                numeric_series = pd.to_numeric(df[raw_col], errors="coerce")
                nan_count = numeric_series.isna().sum()
                if nan_count > 0:
                    warnings.append(f"Column '{raw_col}' contains {nan_count} non-numeric or NaN values.")
                oob = numeric_series[(numeric_series < min_val) | (numeric_series > max_val)]
                if len(oob) > 0:
                    out_of_bounds[std_col] = len(oob)
                    warnings.append(
                        f"Column '{raw_col}' ({std_col}) has {len(oob)} values outside bounds [{min_val}, {max_val}]."
                    )

        valid = total - bad_dates_count
        return ValidationReport(
            is_valid=True,
            total_records=total,
            valid_records=valid,
            corrupted_records=bad_dates_count,
            out_of_bounds_counts=out_of_bounds,
            warnings=warnings,
            errors=errors,
        )
