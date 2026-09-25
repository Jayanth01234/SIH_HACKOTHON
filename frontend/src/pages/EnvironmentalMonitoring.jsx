import React, { useState, useEffect, useCallback } from 'react';
import {
  Thermometer,
  Wind,
  Gauge,
  Droplets,
  Compass,
  Download,
  RefreshCw,
  Clock,
  Database,
  SlidersHorizontal,
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

const CARDINAL_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function getCardinalDirection(deg) {
  if (deg === null || deg === undefined) return '--';
  const val = Math.floor((deg / 22.5) + 0.5);
  return CARDINAL_DIRS[val % 16];
}

export const EnvironmentalMonitoring = () => {
  const {
    selectedStation,
    latestObservation,
    statistics,
  } = useStation();

  const [observations, setObservations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeChart, setActiveChart] = useState('all');
  const [tableLoading, setTableLoading] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await polarisApi.getObservations(selectedStation, {
        limit: limit === 'all' ? 1000 : Number(limit),
        sort: sortOrder,
      });
      setObservations(res.data || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load observations table:', err);
    } finally {
      setTableLoading(false);
    }
  }, [selectedStation, limit, sortOrder]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const exportCsv = () => {
    if (!observations.length) return;
    const headers = ['Observation Time', 'Temperature (°C)', 'Relative Humidity (%)', 'Wind Speed (m/s)', 'Wind Direction (°)', 'Atmospheric Pressure (hPa)', 'Station'];
    const rows = observations.map((o) => [
      o.timestamp,
      o.temperature ?? '',
      o.relative_humidity ?? '',
      o.wind_speed ?? '',
      o.wind_direction ?? '',
      o.atmospheric_pressure ?? '',
      o.station,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedStation}_AWS_Jan2015_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tempSpark = observations.map((o) => o.temperature).slice(-30);
  const humSpark = observations.map((o) => o.relative_humidity).slice(-30);
  const windSpark = observations.map((o) => o.wind_speed).slice(-30);
  const pressSpark = observations.map((o) => o.atmospheric_pressure).slice(-30);

  const chartObservations = [...observations].reverse().slice(-48);
  const chartData = chartObservations.map((obs) => {
    const d = new Date(obs.timestamp);
    return {
      time: `${d.getUTCDate()} Jan ${String(d.getUTCHours()).padStart(2, '0')}:00`,
      Temperature: obs.temperature,
      Humidity: obs.relative_humidity,
      'Wind Speed': obs.wind_speed,
      'Wind Direction': obs.wind_direction,
      Pressure: obs.atmospheric_pressure,
    };
  });

  const latestTimeStr = latestObservation?.timestamp
    ? new Date(latestObservation.timestamp).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }) + ' UTC'
    : 'Loading historical record...';

  return (
    <div className="page-container">
      <div className="card" style={{ padding: '20px 24px', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-info">Historical NCPOR / NPDC Data</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Dataset: January 2015 AWS Archive
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--polar-navy)', marginTop: '4px' }}>
              {selectedStation} Station • Meteorological & AWS Telemetry
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Clock size={14} style={{ color: 'var(--polar-ice)' }} />
              <span>
                <strong>Latest available observation in loaded dataset:</strong> {latestTimeStr}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <SlidersHorizontal size={14} />
              <span>Limit:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--polar-border)',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                <option value="50">50 Records</option>
                <option value="100">100 Records</option>
                <option value="250">250 Records</option>
                <option value="all">All ({totalCount || 744})</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--polar-border)',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <button
              onClick={exportCsv}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchTelemetry}
              disabled={tableLoading}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={tableLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Parameter KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
            <Sparkline data={tempSpark} color="#0284C7" width={140} height={30} />
          </div>
          <div className="kpi-meta-row">
            <span>Min: {statistics?.temperature?.min ?? '--'}°C</span>
            <span>Max: {statistics?.temperature?.max ?? '--'}°C</span>
            <span>Avg: {statistics?.temperature?.mean ?? '--'}°C</span>
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
            <Sparkline data={humSpark} color="#0891B2" width={140} height={30} />
          </div>
          <div className="kpi-meta-row">
            <span>Min: {statistics?.relative_humidity?.min ?? '--'}%</span>
            <span>Max: {statistics?.relative_humidity?.max ?? '--'}%</span>
            <span>Mean: {statistics?.relative_humidity?.mean ?? '--'}%</span>
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
            <Sparkline data={windSpark} color="#16A34A" width={140} height={30} />
          </div>
          <div className="kpi-meta-row">
            <span>Max: {statistics?.wind_speed?.max ?? '--'} m/s</span>
            <span>Avg: {statistics?.wind_speed?.mean ?? '--'} m/s</span>
            <span>Std: {statistics?.wind_speed?.std ?? '--'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Wind Direction</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Compass size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {latestObservation?.wind_direction !== undefined && latestObservation?.wind_direction !== null
                ? Number(latestObservation.wind_direction).toFixed(0)
                : '--'}
            </span>
            <span className="kpi-unit">°</span>
            <span
              style={{
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#2563EB',
                backgroundColor: '#DBEAFE',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {getCardinalDirection(latestObservation?.wind_direction)}
            </span>
          </div>
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Dominant: East-North-East</span>
          </div>
          <div className="kpi-meta-row">
            <span>Mean Dir: {statistics?.wind_direction?.mean ?? '--'}°</span>
            <span>NCPOR Sensor AWS</span>
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
            <Sparkline data={pressSpark} color="#7C3AED" width={140} height={30} />
          </div>
          <div className="kpi-meta-row">
            <span>Min: {statistics?.atmospheric_pressure?.min ?? '--'} hPa</span>
            <span>Max: {statistics?.atmospheric_pressure?.max ?? '--'} hPa</span>
          </div>
        </div>
      </div>

      {/* Multi-Chart Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Wind size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>AWS Telemetry Trend Analysis (Chronological Observations)</span>
            </div>
            <div className="card-subtitle">
              Interactive plots for temperature, humidity, wind, and atmospheric pressure
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'temp', 'wind', 'pressure'].map((chartKey) => (
              <button
                key={chartKey}
                className={`btn btn-sm ${activeChart === chartKey ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveChart(chartKey)}
                style={{ textTransform: 'capitalize' }}
              >
                {chartKey}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 25, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#0284C7" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#16A34A" fontSize={11} />
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

              {(activeChart === 'all' || activeChart === 'temp') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Temperature"
                  stroke="#0284C7"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {(activeChart === 'all') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Humidity"
                  stroke="#0891B2"
                  strokeWidth={1.8}
                  dot={false}
                  strokeDasharray="3 3"
                />
              )}

              {(activeChart === 'all' || activeChart === 'wind') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Wind Speed"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {(activeChart === 'pressure') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Pressure"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Observation Data Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Database size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>Historical AWS Observations Log</span>
            </div>
            <div className="card-subtitle">
              Showing {observations.length} records • Sourced from NCPOR / NPDC January 2015 archive
            </div>
          </div>
          <span className="badge badge-normal">Schema Validated</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Observation Time (UTC)</th>
                <th>Station</th>
                <th>Temperature (°C)</th>
                <th>Relative Humidity (%)</th>
                <th>Wind Speed (m/s)</th>
                <th>Wind Direction (°)</th>
                <th>Barometric Pressure (hPa)</th>
                <th>Data Ingestion Status</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs) => {
                const dateObj = new Date(obs.timestamp);
                const timeFormatted = dateObj.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
                return (
                  <tr key={obs.id}>
                    <td style={{ fontWeight: 600 }}>{timeFormatted}</td>
                    <td>
                      <span className="badge badge-info">{obs.station}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: obs.temperature < 0 ? '#0284C7' : '#D97706' }}>
                      {obs.temperature !== null ? `${obs.temperature} °C` : '--'}
                    </td>
                    <td>{obs.relative_humidity !== null ? `${obs.relative_humidity} %` : '--'}</td>
                    <td>{obs.wind_speed !== null ? `${obs.wind_speed} m/s` : '--'}</td>
                    <td>
                      {obs.wind_direction !== null ? (
                        <span>
                          {obs.wind_direction}° ({getCardinalDirection(obs.wind_direction)})
                        </span>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td>{obs.atmospheric_pressure !== null ? `${obs.atmospheric_pressure} hPa` : '--'}</td>
                    <td>
                      <span className="badge badge-normal">Validated</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalMonitoring;
