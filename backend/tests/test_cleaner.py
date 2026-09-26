import pandas as pd
from app.processing.cleaner import DataCleaner
from app.schemas.observation import StationName, WeatherObservation


def test_cleaner_renaming_and_station_injection():
    data = {
        "Observation Time": ["2015-01-01 01:00:00", "2015-01-01 02:00:00"],
        "Temperature": [-2.07999992, 1.25],
        "RH": [52.0299988, 48.0],
        "WS": [5.23000002, 3.4],
        "WD": [205.839996, 180.0],
        "AP": [972.0, 975.419983],
    }
    raw_df = pd.DataFrame(data)
    clean_df = DataCleaner.clean_dataframe(raw_df, StationName.MAITRI)

    expected_cols = [
        "id", "station", "timestamp", "temperature",
        "relative_humidity", "wind_speed", "wind_direction",
        "atmospheric_pressure",
    ]
    assert list(clean_df.columns) == expected_cols
    assert (clean_df["station"] == "Maitri").all()
    assert clean_df.iloc[0]["temperature"] == -2.08
    assert clean_df.iloc[0]["relative_humidity"] == 52.03
    assert clean_df.iloc[0]["wind_speed"] == 5.23
    assert clean_df.iloc[0]["wind_direction"] == 205.84
    assert clean_df.iloc[0]["id"] == "Maitri-20150101-010000"


def test_cleaner_invalid_rows_handling():
    data = {
        "Observation Time": ["2015-01-01 01:00:00", "invalid-date", "2015-01-01 03:00:00"],
        "Temperature": [-10.0, 5.0, 999.0],
        "RH": [50.0, 60.0, -10.0],
        "WS": [5.0, 6.0, 7.0],
        "WD": [100.0, 120.0, 140.0],
        "AP": [980.0, 985.0, 990.0],
    }
    raw_df = pd.DataFrame(data)
    clean_df = DataCleaner.clean_dataframe(raw_df, StationName.BHARATI)
    assert len(clean_df) == 2
    row_last = clean_df.iloc[1]
    assert pd.isna(row_last["temperature"])
    assert pd.isna(row_last["relative_humidity"])


def test_cleaner_to_observation_models():
    data = {
        "Observation Time": ["2015-01-01 01:00:00"],
        "Temperature": [-1.5],
        "RH": [65.0],
        "WS": [4.0],
        "WD": [90.0],
        "AP": [990.0],
    }
    clean_df = DataCleaner.clean_dataframe(pd.DataFrame(data), StationName.BHARATI)
    models = DataCleaner.to_observation_models(clean_df)
    assert len(models) == 1
    obs = models[0]
    assert isinstance(obs, WeatherObservation)
    assert obs.station == StationName.BHARATI
    assert obs.temperature == -1.5
    assert obs.relative_humidity == 65.0
