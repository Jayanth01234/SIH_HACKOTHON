import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx
from bs4 import BeautifulSoup

from app.schemas.live import (
    LiveDataPoint,
    LiveObservationResponse,
    LiveStatus,
)
from app.schemas.observation import StationName

logger = logging.getLogger(__name__)

NCPOR_URLS = {
    StationName.MAITRI: "https://data.ncpor.res.in/maitri/live",
    StationName.BHARATI: "https://data.ncpor.res.in/bharati/live",
}


class LiveIngestionService:
    def __init__(self, timeout_seconds: float = 12.0):
        self.timeout = timeout_seconds
        self._cache: Dict[str, LiveObservationResponse] = {}
        self._last_successful_fetch: Dict[str, datetime] = {}

    def get_cached_or_fetch(self, station: StationName) -> LiveObservationResponse:
        """Returns cached observation if fresh, otherwise triggers fetch."""
        if station.value in self._cache:
            cached = self._cache[station.value]
            # If fetched within last 5 minutes, return cached
            age = (datetime.now(timezone.utc) - cached.last_fetched_at).total_seconds()
            if age < 300:
                return cached

        return self.fetch_live(station)

    def fetch_live(self, station: StationName) -> LiveObservationResponse:
        """Directly fetches and parses live telemetry from NCPOR website."""
        url = NCPOR_URLS.get(station)
        if not url:
            raise ValueError(f"Unknown station: {station}")

        now = datetime.now(timezone.utc)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) POLARIS/2.0 Research Platform (Antarctic Telemetry Client)"
        }

        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                resp = client.get(url, headers=headers)
                resp.raise_for_status()
                html = resp.text

            parsed = self._parse_ncpor_html(html, station, url, now)
            self._cache[station.value] = parsed
            self._last_successful_fetch[station.value] = now
            logger.info(f"Successfully ingested verified live NCPOR telemetry for {station.value}")
            return parsed

        except Exception as e:
            logger.warning(f"Failed to fetch live NCPOR data for {station.value}: {e}")
            if station.value in self._cache:
                cached = self._cache[station.value]
                # Return cached with STALE status
                return LiveObservationResponse(
                    station=station,
                    status=LiveStatus.STALE,
                    data_integrity_tag="[ VERIFIED LIVE NCPOR DATA - STALE ]",
                    source_url=url,
                    observation_time=cached.observation_time,
                    temperature=cached.temperature,
                    relative_humidity=cached.relative_humidity,
                    atmospheric_pressure=cached.atmospheric_pressure,
                    wind_speed_ms=cached.wind_speed_ms,
                    wind_speed_knots=cached.wind_speed_knots,
                    last_fetched_at=cached.last_fetched_at,
                    series_24h=cached.series_24h,
                    summary_stats=cached.summary_stats,
                    message=f"NCPOR live portal temporarily unreachable. Displaying cached observation from {cached.last_fetched_at.isoformat()}.",
                )

            # Never succeeded before
            return LiveObservationResponse(
                station=station,
                status=LiveStatus.UNAVAILABLE,
                data_integrity_tag="[ TELEMETRY FEED UNAVAILABLE ]",
                source_url=url,
                last_fetched_at=now,
                message=f"Unable to reach NCPOR live server ({url}). Network or server timeout: {e}",
            )

    def refresh_all(self) -> None:
        """Called periodically by background scheduler."""
        for station in StationName:
            try:
                self.fetch_live(station)
            except Exception as e:
                logger.error(f"Periodic live fetch error for {station.value}: {e}")

    def _parse_ncpor_html(
        self, html: str, station: StationName, url: str, fetch_time: datetime
    ) -> LiveObservationResponse:
        soup = BeautifulSoup(html, "html.parser")

        # 1. Extract KPI line
        kpi_div = soup.find(class_=re.compile(r"chart-heading-kpi"))
        kpi_text = kpi_div.get_text(separator=" ", strip=True) if kpi_div else ""
        if not kpi_text:
            for div in soup.find_all(["div", "p"]):
                t = div.get_text(separator=" ", strip=True)
                if "temperature:" in t.lower() and "relative humidity:" in t.lower():
                    kpi_text = t
                    break

        date_match = re.search(r"(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})", kpi_text)
        temp_match = re.search(r"Temperature:\s*(-?[\d\.]+)", kpi_text, re.IGNORECASE)
        rh_match = re.search(r"Relative\s+Humidity:\s*([\d\.]+)%", kpi_text, re.IGNORECASE)
        press_match = re.search(
            r"Air\s+Pressure:\s*([\d\.]+)\s*(?:mBar|hPa)?", kpi_text, re.IGNORECASE
        )
        ws_match = re.search(r"Wind\s+Speed\s*([\d\.]+)\s*knots", kpi_text, re.IGNORECASE)

        temp = float(temp_match.group(1)) if temp_match else None
        rh = float(rh_match.group(1)) if rh_match else None
        press = float(press_match.group(1)) if press_match else None
        ws_knots = float(ws_match.group(1)) if ws_match else None
        ws_ms = round(ws_knots * 0.514444, 2) if ws_knots is not None else None

        # Parse observation timestamp
        obs_time = None
        if date_match:
            try:
                parsed_date = datetime.strptime(date_match.group(1), "%d %b %Y").date()
                obs_time = datetime(
                    parsed_date.year,
                    parsed_date.month,
                    parsed_date.day,
                    fetch_time.hour,
                    fetch_time.minute,
                    tzinfo=timezone.utc,
                )
            except Exception:
                obs_time = fetch_time
        else:
            obs_time = fetch_time

        # 2. Extract CanvasJS chart dataPoints
        script_text = ""
        for s in soup.find_all("script"):
            if s.string and "CanvasJS.Chart" in s.string:
                script_text = s.string
                break

        series_matches = re.findall(
            r"dataPoints:\s*\[([\s\S]*?)\]\s*(?:,|\})", script_text
        )

        series_points: Dict[int, Dict[str, Any]] = {}
        for s_idx, raw_series in enumerate(series_matches[:4]):
            for pt in re.finditer(r"\{\s*x\s*:\s*(\d+)\s*,\s*y\s*:\s*(-?[\d\.]+)\s*\}", raw_series):
                ts_ms = int(pt.group(1))
                val = float(pt.group(2))
                if ts_ms not in series_points:
                    series_points[ts_ms] = {
                        "timestamp": datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
                    }
                if s_idx == 0:
                    series_points[ts_ms]["temperature"] = val
                elif s_idx == 1:
                    series_points[ts_ms]["wind_speed"] = round(val * 0.514444, 2)
                elif s_idx == 2:
                    series_points[ts_ms]["atmospheric_pressure"] = val
                elif s_idx == 3:
                    series_points[ts_ms]["relative_humidity"] = val

        sorted_times = sorted(series_points.keys())
        history: List[LiveDataPoint] = []
        for ts in sorted_times:
            pt = series_points[ts]
            history.append(
                LiveDataPoint(
                    timestamp=pt["timestamp"],
                    temperature=pt.get("temperature"),
                    wind_speed=pt.get("wind_speed"),
                    atmospheric_pressure=pt.get("atmospheric_pressure"),
                    relative_humidity=pt.get("relative_humidity"),
                )
            )

        # 3. Extract Summary table (Average, Minimum, Maximum)
        summary: Dict[str, Any] = {}
        full_text = soup.get_text(separator=" ", strip=True)
        for stat_type in ["Average", "Minimum", "Maxmimum", "Maximum"]:
            stat_match = re.search(
                rf"Data\s+{stat_type}\s+Temperature\s*(-?[\d\.]+)\s*°?C\s+Wind\s+Speed\s*([\d\.]+)\s*m/s\s+Air\s+Pressure\s*([\d\.]+)\s*hPa\s+Rel\.\s+Humidity\s*([\d\.]+)\s*%",
                full_text,
                re.IGNORECASE,
            )
            if stat_match:
                key = "maximum" if "max" in stat_type.lower() else stat_type.lower()
                summary[key] = {
                    "temperature": float(stat_match.group(1)),
                    "wind_speed_ms": float(stat_match.group(2)),
                    "atmospheric_pressure": float(stat_match.group(3)),
                    "relative_humidity": float(stat_match.group(4)),
                }

        return LiveObservationResponse(
            station=station,
            status=LiveStatus.VERIFIED_LIVE,
            data_integrity_tag="[ VERIFIED LIVE NCPOR DATA ]",
            source_url=url,
            observation_time=obs_time,
            temperature=temp,
            relative_humidity=rh,
            atmospheric_pressure=press,
            wind_speed_ms=ws_ms,
            wind_speed_knots=ws_knots,
            last_fetched_at=fetch_time,
            series_24h=history,
            summary_stats=summary if summary else None,
            message="Verified live telemetry streaming directly from NCPOR National Polar Data Center portal.",
        )


live_ingestion_service = LiveIngestionService()
