# POLARIS ML Training Datasets

## Attribution & Data Provenance
- **Source**: Open-Meteo Antarctic Historical Reanalysis Archive (derived from ECMWF ERA5 reanalysis).
- **Purpose**: Multi-year training dataset for POLARIS extreme weather hazard prediction models (blizzards, gale-force winds, katabatic storms, and severe hypothermic temperature drops).
- **Stations & Coordinates**:
  - **Maitri Station**: 70.7658° S, 11.7358° E (Schirmacher Oasis, Queen Maud Land)
  - **Bharati Station**: 69.4078° S, 76.1872° E (Larsemann Hills)
- **Time Range**: 2021-01-01 00:00 to 2023-12-31 23:00 (3 continuous years, ~26,280 hourly observations per station).
- **Physical Metrics**:
  - `timestamp`: ISO 8601 UTC timestamp
  - `station`: Station identifier ('Maitri' or 'Bharati')
  - `temperature`: 2m air temperature (°C)
  - `relative_humidity`: 2m relative humidity (%)
  - `wind_speed`: 10m wind speed (m/s)
  - `wind_direction`: 10m wind direction (degrees)
  - `atmospheric_pressure`: Surface barometric pressure (hPa)

> **Important**: This multi-year training dataset is isolated in `data/training/` and does not alter the historical NCPOR/NPDC January 2015 observations in `data/maitri/jan_2015.csv` and `data/bharathi/jan_2015.csv`.
