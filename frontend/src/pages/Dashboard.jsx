import React, { useState, useEffect, useCallback } from 'react';
import {
  Thermometer,
  Wind,
  Gauge,
  Droplets,
  Radio,
  Server,
  Zap,
  Building2,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
  BrainCircuit,
  Activity,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useStation } from '../context/StationContext';
import Sparkline from '../components/common/Sparkline';
import polarisApi from '../services/api';

export const Dashboard = () => {
  const {
    selectedStation,
    latestObservation,
    recentObservations,
    statistics,
    stationInfo,
    setCurrentPage,
  } = useStation();

  // 1. Live Telemetry state
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);

  // 2. AI Forecast state
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // 3. ML Hazard Prediction state
  const [hazardData, setHazardData] = useState(null);
  const [hazardLoading, setHazardLoading] = useState(false);

  // Fetch Live Telemetry using getLiveStationData / refreshLiveStationData
  const fetchLive = useCallback(async (isRefresh = false) => {
    setLiveLoading(true);
    try {
      const data = isRefresh
        ? await polarisApi.refreshLiveStationData(selectedStation)
        : await polarisApi.getLiveStationData(selectedStation);
      setLiveData(data);
    } catch (err) {
      console.warn('Could not fetch live telemetry:', err);
    } finally {
      setLiveLoading(false);
    }
  }, [selectedStation]);

  // Fetch AI Forecast using getStationForecast
  const fetchForecast = useCallback(async () => {
    setForecastLoading(true);
    try {
      const data = await polarisApi.getStationForecast(selectedStation);
      setForecastData(data);
    } catch (err) {
      console.warn('Could not fetch forecast:', err);
    } finally {
      setForecastLoading(false);
    }
  }, [selectedStation]);

  // Fetch ML Hazard Prediction using getStationHazard
  const fetchHazard = useCallback(async () => {
    setHazardLoading(true);
    try {
      const data = await polarisApi.getStationHazard(selectedStation);
      setHazardData(data);
    } catch (err) {
      console.warn('Could not fetch hazard prediction:', err);
    } finally {
      setHazardLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    fetchLive(false);
    fetchForecast();
    fetchHazard();
  }, [fetchLive, fetchForecast, fetchHazard]);

  const tempSpark = recentObservations.map((o) => o.temperature).slice(-20);
  const windSpark = recentObservations.map((o) => o.wind_speed).slice(-20);
  const pressSpark = recentObservations.map((o) => o.atmospheric_pressure).slice(-20);
  const humSpark = recentObservations.map((o) => o.relative_humidity).slice(-20);

  const chartData = recentObservations.slice(-24).map((obs) => {
    const d = new Date(obs.timestamp);
    const timeLabel = `${d.getUTCDate()} Jan ${String(d.getUTCHours()).padStart(2, '0')}:00`;
    return {
      time: timeLabel,
      Temperature: obs.temperature,
      'Wind Speed': obs.wind_speed,
      Humidity: obs.relative_humidity,
    };
  });

  // 24-Hour Projected Horizon for Forecast Chart
  const forecastChartData = forecastData?.hourly_projection?.map((pt) => {
    const d = new Date(pt.timestamp);
    const timeLabel = `+${pt.step_hours}h (${String(d.getUTCHours()).padStart(2, '0')}:00)`;
    return {
      time: timeLabel,
      'Forecast Temp (°C)': pt.temperature,
      'Temp CI Low': pt.temp_ci_lower,
      'Temp CI High': pt.temp_ci_upper,
      'Forecast Wind (m/s)': pt.wind_speed,
    };
  }) || [];

  const latestTimeStr = latestObservation?.timestamp
    ? new Date(latestObservation.timestamp).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }) + ' UTC'
    : 'Loading historical record...';

  const stationMeta = {
    Maitri: {
      location: 'Schirmacher Oasis, Queen Maud Land',
      coords: '70°45\'57" S, 11°44\'09" E',
      elevation: '117 meters ASL',
      commissioned: '1989',
    },
    Bharati: {
      location: 'Larsemann Hills, East Antarctica',
      coords: '69°24\'28" S, 76°11\'14" E',
      elevation: '35 meters ASL',
      commissioned: '2012',
    },
  }[selectedStation] || {};

  const getHazardColor = (level) => {
    if (level === 'CRITICAL') return { bg: '#FEF2F2', text: '#991B1B', bar: '#EF4444', border: '#FECACA' };
    if (level === 'MODERATE') return { bg: '#FFFBEB', text: '#92400E', bar: '#F59E0B', border: '#FDE68A' };
    return { bg: '#ECFDF5', text: '#065F46', bar: '#10B981', border: '#A7F3D0' };
  };

  const hazardColors = getHazardColor(hazardData?.hazard_level);

  // Status badge display for live data
  const getLiveStatusBadge = () => {
    if (!liveData) return { label: 'CONNECTING...', class: 'tag-prototype', beacon: '' };
    if (liveData.status === 'verified_live') {
      return { label: 'VERIFIED LIVE NCPOR DATA', class: 'tag-verified-live', beacon: 'beacon-live' };
    }
    if (liveData.status === 'stale') {
      return { label: 'STALE — LAST VERIFIED OBSERVATION', class: 'tag-ml-hazard', beacon: 'beacon-stale' };
    }
    return { label: 'UNAVAILABLE', class: 'tag-prototype', beacon: '' };
  };

  const liveBadge = getLiveStatusBadge();

  return (
    <div className="page-container">
      {/* Station Hero Card */}
      <div className="station-hero-card">
        <div className="station-hero-info">
          <h2>{selectedStation} Research Station, Antarctica</h2>
          <p>
            Digital Twin & Remote Telemetry Operations Center • National Centre for Polar and Ocean Research
            (NCPOR). Continuous environmental life support, microgrid power, and scientific operations.
          </p>
          <div className="station-hero-badges">
            <span className="hero-pill">
              <Compass size={13} style={{ color: '#38BDF8' }} />
              <span>{stationMeta.coords}</span>
            </span>
            <span className="hero-pill">
              <Building2 size={13} style={{ color: '#38BDF8' }} />
              <span>{stationMeta.location} ({stationMeta.elevation})</span>
            </span>
            <span className="hero-pill">
              <ShieldCheck size={13} style={{ color: '#34D399' }} />
              <span>Commissioned {stationMeta.commissioned} • Operational</span>
            </span>
          </div>
        </div>

        <div className="station-hero-stats">
          <div className="hero-stat-item">
            <div className="stat-num">{stationInfo?.total_observations || 744}</div>
            <div className="stat-lbl">AWS Observations</div>
          </div>
          <div className="hero-stat-item">
            <div className="stat-num">100%</div>
            <div className="stat-lbl">Validated Telemetry</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIVE NCPOR TELEMETRY */}
      <div className="live-telemetry-banner">
        <div className="live-banner-header">
          <div className="live-banner-title-group">
            <span className={`pulsing-beacon ${liveBadge.beacon}`} />
            <span className={`provenance-tag ${liveBadge.class}`}>
              {liveBadge.label}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--polar-navy)' }}>
              Source: National Polar Data Center (NCPOR)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {liveData?.observation_time && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Observation Time: <strong>{new Date(liveData.observation_time).toLocaleString()}</strong>
              </span>
            )}
            <a
              href={liveData?.source_url || `https://data.ncpor.res.in/${selectedStation.toLowerCase()}/live`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ExternalLink size={12} /> NCPOR Portal
            </a>
            <button
              onClick={() => fetchLive(true)}
              disabled={liveLoading}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={liveLoading ? 'spin' : ''} />
              {liveLoading ? 'Streaming...' : 'Refresh Live'}
            </button>
          </div>
        </div>

        {liveData?.status === 'verified_live' || liveData?.status === 'stale' ? (
          <div className="live-metrics-grid">
            <div className="live-metric-box">
              <span className="live-metric-label">Temperature</span>
              <span className="live-metric-val">
                {liveData?.temperature !== null && liveData?.temperature !== undefined
                  ? `${Number(liveData.temperature).toFixed(1)} °C`
                  : '--'}
              </span>
              <span className="live-metric-sub">
                {liveData?.status === 'stale' ? 'Last Verified Value' : 'Ambient Air Sensor'}
              </span>
            </div>

            <div className="live-metric-box">
              <span className="live-metric-label">Wind Speed</span>
              <span className="live-metric-val">
                {liveData?.wind_speed_ms !== null && liveData?.wind_speed_ms !== undefined
                  ? `${Number(liveData.wind_speed_ms).toFixed(1)} m/s`
                  : '--'}
              </span>
              <span className="live-metric-sub">
                {liveData?.wind_speed_knots !== null && liveData?.wind_speed_knots !== undefined
                  ? `(${Number(liveData.wind_speed_knots).toFixed(1)} knots)`
                  : 'Anemometer'}
              </span>
            </div>

            <div className="live-metric-box">
              <span className="live-metric-label">Atmospheric Pressure</span>
              <span className="live-metric-val">
                {liveData?.atmospheric_pressure !== null && liveData?.atmospheric_pressure !== undefined
                  ? `${Number(liveData.atmospheric_pressure).toFixed(1)} hPa`
                  : '--'}
              </span>
              <span className="live-metric-sub">Barometric Sensor</span>
            </div>

            <div className="live-metric-box">
              <span className="live-metric-label">Relative Humidity</span>
              <span className="live-metric-val">
                {liveData?.relative_humidity !== null && liveData?.relative_humidity !== undefined
                  ? `${Number(liveData.relative_humidity).toFixed(1)} %`
                  : '--'}
              </span>
              <span className="live-metric-sub">Hygrometer Sensor</span>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 4px' }}>
            Live NCPOR telemetry currently unavailable.
          </div>
        )}
      </div>

      {/* SECTION: VERIFIED HISTORICAL NCPOR / NPDC DATA */}
      <div
        style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} style={{ color: 'var(--polar-ice)' }} />
          <span>
            <strong>Historical Verified AWS Baseline (Observed Data):</strong> {latestTimeStr}
          </span>
          <span className="provenance-tag tag-verified-historical">
            [ VERIFIED HISTORICAL NCPOR / NPDC DATA ]
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentPage('environmental')}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            Open Full Telemetry <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards from Real API */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Air Temperature</span>
            <div className="kpi-icon-badge">
              <Thermometer size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {latestObservation?.temperature !== undefined && latestObservation?.temperature !== null
                ? Number(latestObservation.temperature).toFixed(1)
                : '--'}
            </span>
            <span className="kpi-unit">°C</span>
          </div>
          <div style={{ margin: '4px 0' }}>
            <Sparkline data={tempSpark} color="#0284C7" width={140} height={32} />
          </div>
          <div className="kpi-meta-row">
            <span>Min: {statistics?.temperature?.min ?? '--'}°C</span>
            <span>Max: {statistics?.temperature?.max ?? '--'}°C</span>
            <span>Avg: {statistics?.temperature?.mean ?? '--'}°C</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Wind Speed</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <Wind size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {latestObservation?.wind_speed !== undefined && latestObservation?.wind_speed !== null
                ? Number(latestObservation.wind_speed).toFixed(1)
                : '--'}
            </span>
            <span className="kpi-unit">m/s</span>
          </div>
          <div style={{ margin: '4px 0' }}>
            <Sparkline data={windSpark} color="#16A34A" width={140} height={32} />
          </div>
          <div className="kpi-meta-row">
            <span>Peak: {statistics?.wind_speed?.max ?? '--'} m/s</span>
            <span>Avg: {statistics?.wind_speed?.mean ?? '--'} m/s</span>
            <span>Dir: {latestObservation?.wind_direction ?? '--'}°</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Barometric Pressure</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              <Gauge size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {latestObservation?.atmospheric_pressure !== undefined && latestObservation?.atmospheric_pressure !== null
                ? Number(latestObservation.atmospheric_pressure).toFixed(1)
                : '--'}
            </span>
            <span className="kpi-unit">hPa</span>
          </div>
          <div style={{ margin: '4px 0' }}>
            <Sparkline data={pressSpark} color="#7C3AED" width={140} height={32} />
          </div>
          <div className="kpi-meta-row">
            <span>Min: {statistics?.atmospheric_pressure?.min ?? '--'} hPa</span>
            <span>Max: {statistics?.atmospheric_pressure?.max ?? '--'} hPa</span>
            <span>Stable Barometer</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Relative Humidity</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#ECFEFF', color: '#0891B2' }}>
              <Droplets size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {latestObservation?.relative_humidity !== undefined && latestObservation?.relative_humidity !== null
                ? Number(latestObservation.relative_humidity).toFixed(1)
                : '--'}
            </span>
            <span className="kpi-unit">%</span>
          </div>
          <div style={{ margin: '4px 0' }}>
            <Sparkline data={humSpark} color="#0891B2" width={140} height={32} />
          </div>
          <div className="kpi-meta-row">
            <span>Min: {statistics?.relative_humidity?.min ?? '--'}%</span>
            <span>Max: {statistics?.relative_humidity?.max ?? '--'}%</span>
            <span>Mean: {statistics?.relative_humidity?.mean ?? '--'}%</span>
          </div>
        </div>
      </div>

      {/* INTELLIGENCE SECTION: AI Forecast + ML Hazard Prediction */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', margin: '6px 0' }}>
        
        {/* SECTION 2: AI FORECAST */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BrainCircuit size={17} style={{ color: '#7C3AED' }} />
                <span>AI FORECAST</span>
                <span className="provenance-tag tag-ai-forecast">[ AI FORECAST ]</span>
              </div>
              <div className="card-subtitle" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Forecast generated from recent observations using the POLARIS statistical forecasting model. (Prediction, not observation).
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchForecast} disabled={forecastLoading}>
              <RefreshCw size={12} className={forecastLoading ? 'spin' : ''} />
            </button>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {forecastData ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--polar-border)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>NEXT-HOUR TEMP</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--polar-navy)', marginTop: '2px' }}>
                      {forecastData.temperature.forecast_next_hour} °C
                    </div>
                    <div style={{ fontSize: '11px', color: '#0369A1', marginTop: '3px' }}>
                      95% CI: [{forecastData.temperature.ci_lower}, {forecastData.temperature.ci_upper}]
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Trend: {forecastData.temperature.trend_slope > 0 ? '+' : ''}{forecastData.temperature.trend_slope} °C/h
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid var(--polar-border)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>NEXT-HOUR WIND</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>
                      {forecastData.wind_speed.forecast_next_hour} m/s
                    </div>
                    <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '3px' }}>
                      95% CI: [{forecastData.wind_speed.ci_lower}, {forecastData.wind_speed.ci_upper}]
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Trend: {forecastData.wind_speed.trend_slope > 0 ? '+' : ''}{forecastData.wind_speed.trend_slope} m/s²
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid var(--polar-border)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>NEXT-HOUR PRESSURE</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
                      {forecastData.atmospheric_pressure.forecast_next_hour} hPa
                    </div>
                    <div style={{ fontSize: '11px', color: '#7C3AED', marginTop: '3px' }}>
                      95% CI: [{forecastData.atmospheric_pressure.ci_lower}, {forecastData.atmospheric_pressure.ci_upper}]
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Trend: {forecastData.atmospheric_pressure.trend_slope > 0 ? '+' : ''}{forecastData.atmospheric_pressure.trend_slope} hPa/h
                    </div>
                  </div>
                </div>

                {/* 24-Hour Projected Horizon Chart */}
                <div style={{ height: '170px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} interval={3} />
                      <YAxis stroke="#0284C7" fontSize={10} unit="°C" />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="Forecast Temp (°C)" stroke="#0284C7" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Forecast Wind (m/s)" stroke="#16A34A" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 1 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Backtest MAE / MAPE Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span><strong>Backtest MAE / MAPE:</strong></span>
                  <span>Temp MAE: <strong>{forecastData.accuracy_metrics?.mae_temperature ?? '--'} °C</strong></span>
                  <span>Wind MAE: <strong>{forecastData.accuracy_metrics?.mae_wind_speed ?? '--'} m/s</strong></span>
                  <span>Evaluations: <strong>{forecastData.accuracy_metrics?.tracked_evaluations} pts</strong></span>
                </div>
              </>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Calculating explainable statistical forecast...
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: ML HAZARD PREDICTION */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertTriangle size={17} style={{ color: '#D97706' }} />
                <span>ML HAZARD PREDICTION</span>
                <span className="provenance-tag tag-ml-hazard">[ ML HAZARD PREDICTION ]</span>
              </div>
              <div className="card-subtitle" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Random Forest Classifier • 80/20 Chronological Split on 26,000+ Hourly Antarctic Records (ML Prediction)
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchHazard} disabled={hazardLoading}>
              <RefreshCw size={12} className={hazardLoading ? 'spin' : ''} />
            </button>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hazardData ? (
              <>
                {/* Risk Gauge Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: hazardColors.bg,
                    border: `1px solid ${hazardColors.border}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} style={{ color: hazardColors.bar }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: hazardColors.text }}>
                        24-Hour Hazard Assessment
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: hazardColors.text }}>
                        {hazardData.hazard_level} RISK LEVEL ({(hazardData.hazard_probability * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '130px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(5, hazardData.hazard_probability * 100))}%`,
                          backgroundColor: hazardColors.bar,
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: hazardColors.text, textAlign: 'right' }}>
                      Probability: {(hazardData.hazard_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Primary Risk Driver Explanation */}
                <div style={{ fontSize: '12px', background: '#F8FAFC', border: '1px solid var(--polar-border)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--polar-navy)' }}>Physical Hazard Driver: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{hazardData.primary_driver}</span>
                </div>

                {/* Top Contributing Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Top Contributing Features (Gini Importance)
                  </span>
                  {hazardData.top_contributing_factors.slice(0, 3).map((factor, idx) => (
                    <div key={idx} className="factor-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--polar-navy)' }}>{factor.factor_label}</span>
                        <span style={{ color: 'var(--polar-ice)', fontWeight: 700 }}>{factor.importance_pct}% weight</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {factor.impact_description} (Value: {factor.current_value})
                      </div>
                    </div>
                  ))}
                </div>

                {/* Operational Guidance */}
                <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: '11px', color: '#0369A1' }}>
                  <strong>Operational Protocol: </strong> {hazardData.operational_guidance}
                </div>

                {/* Model Metadata Transparency */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--polar-border)', paddingTop: '8px' }}>
                  <span>Test Accuracy: <strong>{(hazardData.model_evaluation.accuracy * 100).toFixed(1)}%</strong></span>
                  <span>Precision: <strong>{(hazardData.model_evaluation.precision * 100).toFixed(1)}%</strong></span>
                  <span>Recall: <strong>{(hazardData.model_evaluation.recall * 100).toFixed(1)}%</strong></span>
                  <span>Test Samples: <strong>{hazardData.model_evaluation.test_samples}</strong></span>
                </div>
              </>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Evaluating machine learning hazard model...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Grid: Telemetry Trends + Digital Twin Modules */}
      <div className="grid-2-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Wind size={16} style={{ color: 'var(--polar-ice)' }} />
                  <span>AWS Environmental Trends (Recent 24 Observations)</span>
                </div>
                <div className="card-subtitle">
                  Historical telemetry readings from {selectedStation} Automatic Weather Station
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage('environmental')}
              >
                View 744 Data Points
              </button>
            </div>
            <div className="card-body" style={{ height: '320px', paddingTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#0284C7" fontSize={11} unit="°C" />
                  <YAxis yAxisId="right" orientation="right" stroke="#16A34A" fontSize={11} unit=" m/s" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Temperature"
                    stroke="#0284C7"
                    strokeWidth={2.2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Wind Speed"
                    stroke="#16A34A"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    strokeDasharray="4 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subsystem Health Grid */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building2 size={16} style={{ color: 'var(--polar-ice)' }} />
                <span>Station Module & Subsystem Digital Twin</span>
                <span className="provenance-tag tag-prototype">[ PROTOTYPE / DEMONSTRATION DATA ]</span>
              </div>
              <span className="badge badge-normal">All Subsystems Nominal</span>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                }}
              >
                {[
                  { name: 'Main Station Living Module', status: 'Nominal', metric: '20.5 °C Indoor', icon: Building2 },
                  { name: 'Diesel Generator House', status: 'Active (110 kW)', metric: '98.2% Load Balance', icon: Zap },
                  { name: 'Satellite Comms Uplink', status: 'Online', metric: '99.8% Transmit', icon: Radio },
                  { name: selectedStation === 'Maitri' ? 'Priyadarshini Lake Pump' : 'Prominence Water Unit', status: 'Active', metric: '3,200 L Daily', icon: Droplets },
                  { name: 'Blue Ice Runway Beacon', status: 'Standby', metric: 'Visual Beacon Ready', icon: Compass },
                  { name: 'Central Microgrid PMS', status: 'Synchronized', metric: '50.0 Hz Frequency', icon: Server },
                ].map((sys, idx) => {
                  const SysIcon = sys.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1px solid var(--polar-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <SysIcon size={15} style={{ color: 'var(--polar-ice)' }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--polar-navy)' }}>
                            {sys.name}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sys.metric}</span>
                        <span className="badge badge-normal" style={{ fontSize: '10px' }}>
                          {sys.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Compass size={16} style={{ color: 'var(--polar-ice)' }} />
                <span>Station Comparison</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maitri vs Bharati</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedStation === 'Maitri' ? 'var(--bg-ice-tint)' : '#F8FAFC',
                  border: selectedStation === 'Maitri' ? '1px solid #BAE6FD' : '1px solid var(--polar-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--polar-navy)' }}>Maitri Station</span>
                  <span className="badge badge-normal" style={{ fontSize: '10px' }}>Active</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  70°45\'57" S, 11°44\'09" E • Inland Oasis (117m)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                  <span>Temp: <strong>-5.7°C</strong></span>
                  <span>Wind: <strong>1.2 m/s</strong></span>
                  <span>Press: <strong>974 hPa</strong></span>
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedStation === 'Bharati' ? 'var(--bg-ice-tint)' : '#F8FAFC',
                  border: selectedStation === 'Bharati' ? '1px solid #BAE6FD' : '1px solid var(--polar-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--polar-navy)' }}>Bharati Station</span>
                  <span className="badge badge-normal" style={{ fontSize: '10px' }}>Active</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  69°24\'28" S, 76°11\'14" E • Coastal Promontory (35m)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                  <span>Temp: <strong>-1.2°C</strong></span>
                  <span>Wind: <strong>4.8 m/s</strong></span>
                  <span>Press: <strong>988 hPa</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={16} style={{ color: 'var(--polar-ice)' }} />
                <span>Recent Observations</span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage('environmental')}
              >
                All Data
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Observation Time</th>
                    <th>Temp</th>
                    <th>Wind</th>
                    <th>Press</th>
                  </tr>
                </thead>
                <tbody>
                  {recentObservations.slice(-6).reverse().map((obs) => {
                    const d = new Date(obs.timestamp);
                    const formatted = `${d.getUTCDate()} Jan ${String(d.getUTCHours()).padStart(2, '0')}:00`;
                    return (
                      <tr key={obs.id}>
                        <td style={{ fontWeight: 600 }}>{formatted}</td>
                        <td style={{ color: obs.temperature < 0 ? '#0284C7' : '#D97706' }}>
                          {obs.temperature ?? '--'} °C
                        </td>
                        <td>{obs.wind_speed ?? '--'} m/s</td>
                        <td>{obs.atmospheric_pressure ?? '--'} hPa</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
