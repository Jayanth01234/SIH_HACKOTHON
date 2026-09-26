import json
import os
import urllib.request
import pandas as pd
from pathlib import Path

STATIONS = {
    "Maitri": {
        "lat": -70.7658,
        "lon": 11.7358,
        "dir": "data/training/maitri",
    },
    "Bharati": {
        "lat": -69.4078,
        "lon": 76.1872,
        "dir": "data/training/bharati",
    }
}

START_DATE = "2021-01-01"
END_DATE = "2023-12-31"

def fetch_and_save_station_data(station_name, config):
    out_dir = Path(config["dir"])
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "historical_training.csv"
    
    print(f"Fetching historical reanalysis data for {station_name} ({START_DATE} to {END_DATE})...")
    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={config['lat']}&longitude={config['lon']}&"
        f"start_date={START_DATE}&end_date={END_DATE}&"
        f"hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure&"
        f"wind_speed_unit=ms"
    )
    
    req = urllib.request.Request(url, headers={"User-Agent": "POLARIS/2.0 Research Pipeline"})
    with urllib.request.urlopen(req, timeout=60) as response:
        payload = json.loads(response.read().decode("utf-8"))
        
    hourly = payload["hourly"]
    df = pd.DataFrame({
        "timestamp": pd.to_datetime(hourly["time"]),
        "station": station_name,
        "temperature": hourly["temperature_2m"],
        "relative_humidity": hourly["relative_humidity_2m"],
        "wind_speed": hourly["wind_speed_10m"],
        "wind_direction": hourly["wind_direction_10m"],
        "atmospheric_pressure": hourly["surface_pressure"],
    })
    
    df = df.sort_values("timestamp").reset_index(drop=True)
    df.to_csv(out_file, index=False)
    print(f"Saved {len(df)} records to {out_file}")
    return df

def write_training_readme():
    readme_path = Path("data/training/README.md")
    content = """# POLARIS ML Training Datasets

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
"""
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Saved README to {readme_path}")

def main():
    for station_name, config in STATIONS.items():
        fetch_and_save_station_data(station_name, config)
    write_training_readme()

if __name__ == "__main__":
    main()
