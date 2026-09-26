from datetime import datetime
from app.schemas.observation import StationName
from app.storage.repository import ObservationRepository


def test_repository_load_and_counts(repository: ObservationRepository):
    assert repository.is_loaded is True
    df_all = repository.get_dataframe()
    assert not df_all.empty
    assert len(df_all) > 1300
    assert len(repository.get_dataframe(StationName.MAITRI)) == 634
    assert len(repository.get_dataframe(StationName.BHARATI)) == 720


def test_repository_get_latest_observation(repository: ObservationRepository):
    latest_all = repository.get_latest_observation()
    assert latest_all is not None

    latest_maitri = repository.get_latest_observation(StationName.MAITRI)
    assert latest_maitri is not None
    assert latest_maitri.station == StationName.MAITRI
    assert latest_maitri.timestamp.strftime("%Y-%m-%d") == "2015-01-30"

    latest_bharati = repository.get_latest_observation(StationName.BHARATI)
    assert latest_bharati is not None
    assert latest_bharati.station == StationName.BHARATI
    assert latest_bharati.timestamp.strftime("%Y-%m-%d") == "2015-01-31"


def test_repository_date_range_filtering(repository: ObservationRepository):
    start = datetime(2015, 1, 1, 0, 0, 0)
    end = datetime(2015, 1, 2, 0, 0, 0)
    obs, count = repository.get_observations(
        station=StationName.MAITRI, start_date=start, end_date=end, limit=50
    )
    assert count == 24
    assert len(obs) == 24
    for o in obs:
        assert start <= o.timestamp <= end


def test_repository_statistics_calculation(repository: ObservationRepository):
    stats = repository.get_statistics(station=StationName.MAITRI)
    assert stats.station == StationName.MAITRI
    assert stats.total_records == 634
    assert stats.temperature is not None
    assert stats.temperature.min < stats.temperature.max
    assert stats.relative_humidity is not None
    assert 0 <= stats.relative_humidity.mean <= 100
    assert stats.wind_speed is not None
    assert stats.wind_speed.min >= 0
