import pandas as pd
from app.processing.validator import DataValidator, COLUMN_MAPPING


def test_validator_schema_success():
    sample_df = pd.DataFrame(columns=list(COLUMN_MAPPING.keys()))
    is_valid, errors = DataValidator.validate_schema(sample_df)
    assert is_valid is True
    assert len(errors) == 0


def test_validator_missing_column_failure():
    sample_df = pd.DataFrame(columns=["Observation Time", "Temperature"])
    is_valid, errors = DataValidator.validate_schema(sample_df)
    assert is_valid is False
    assert len(errors) > 0


def test_validator_audit_dataframe():
    data = {
        "Observation Time": ["2015-01-01 01:00:00", "2015-01-01 02:00:00"],
        "Temperature": [-15.5, 999.0],
        "RH": [50.0, 150.0],
        "WS": [10.2, 5.0],
        "WD": [180.0, 200.0],
        "AP": [980.0, 982.0],
    }
    df = pd.DataFrame(data)
    report = DataValidator.audit_dataframe(df)
    assert report.is_valid is True
    assert report.total_records == 2
    assert "temperature" in report.out_of_bounds_counts
    assert "relative_humidity" in report.out_of_bounds_counts
