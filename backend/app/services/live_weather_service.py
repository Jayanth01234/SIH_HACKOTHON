import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

from app.schemas.digital_twin import DataMode

logger = logging.getLogger(__name__)

STATION_COORDINATES = {
    "Maitri": {"lat": -70.767, "lon": 11.733, "elevation": 117.0},
    "Bharati": {"lat": -69.407, "lon": 76.190, "elevation": 35.0},
}


class LiveWeatherService:
    def __init__(self, timeout_seconds: float = 6.0):
        self.timeout = timeout_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_fetch_time: Dict[str, datetime] = {}

    def fetch_public_live_weather(self, station_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches authentic live meteorological conditions for Antarctic station coordinates
        using Open-Meteo global numerical weather prediction models (ECMWF/GFS polar resolution).
        """
        coords = STATION_COORDINATES.get(station_id, STATION_COORDINATES["Maitri"])
        now = datetime.now(timezone.utc)

        # Check in-memory cache (valid for 3 minutes to respect rate limits)
        if station_id in self._cache and station_id in self._last_fetch_time:
            age = (now - self._last_fetch_time[station_id]).total_seconds()
            if age < 180:
                return self._cache[station_id]

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": coords["lat"],
            "longitude": coords["lon"],
            "current": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code",
            "timezone": "UTC",
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.get(url, params=params)
                res.raise_for_status()
                data = res.json()

            current = data.get("current", {})
            temp = float(current.get("temperature_2m", -12.0))
            # Open-Meteo returns wind in km/h by default or m/s if specified; default is km/h, convert to m/s
            ws_kmh = float(current.get("wind_speed_10m", 25.0))
            ws_ms = round(ws_kmh / 3.6, 1)
            press = float(current.get("surface_pressure", 985.0))
            rh = float(current.get("relative_humidity_2m", 65.0))
            wd = float(current.get("wind_direction_10m", 120.0))

            obs_data = {
                "temperature": round(temp, 1),
                "wind_speed": ws_ms,
                "wind_direction": wd,
                "atmospheric_pressure": round(press, 1),
                "relative_humidity": round(rh, 1),
                "visibility_km": 15.0 if ws_ms < 15.0 else max(1.0, 15.0 - (ws_ms - 15.0) * 1.2),
                "source": "Open-Meteo ECMWF Antarctic Live Feed",
                "data_mode": DataMode.PUBLIC_LIVE,
                "timestamp": now,
                "quality": "VALID",
            }

            self._cache[station_id] = obs_data
            self._last_fetch_time[station_id] = now
            logger.info(f"Fetched public live weather for {station_id}: {temp}°C, {ws_ms} m/s, {press} hPa")
            return obs_data

        except Exception as e:
            logger.warning(f"Could not reach public live weather API for {station_id}: {e}")
            if station_id in self._cache:
                cached = self._cache[station_id].copy()
                cached["quality"] = "STALE"
                return cached
            return None


live_weather_service = LiveWeatherService()
