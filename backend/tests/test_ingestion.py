import pytest
from app.ingestion.csv_source import NCPORCSVSource
from app.ingestion.base import MissingSourceError
from app.schemas.observation import StationName


def test_csv_source_availability():
    source = NCPORCSVSource()
    assert source.is_available(StationName.MAITRI) is True
    assert source.is_available(StationName.BHARATI) is True


def test_csv_source_load_raw_dataframe():
    source = NCPORCSVSource()
    df_maitri = source.load_raw_dataframe(StationName.MAITRI)
    assert not df_maitri.empty
    assert len(df_maitri) > 600

    required_cols = {"Observation Time", "Temperature", "RH", "WS", "WD", "AP"}
    assert required_cols.issubset(set(df_maitri.columns))

    df_bharati = source.load_raw_dataframe(StationName.BHARATI)
    assert not df_bharati.empty
    assert len(df_bharati) >= 700
    assert required_cols.issubset(set(df_bharati.columns))


def test_missing_station_source_error(tmp_path):
    source = NCPORCSVSource(data_dir=tmp_path / "empty_dir")
    with pytest.raises(MissingSourceError):
        source.load_raw_dataframe(StationName.MAITRI)
