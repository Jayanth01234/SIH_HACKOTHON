import React from 'react';
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

export const Dashboard = () => {
  const {
    selectedStation,
    latestObservation,
    recentObservations,
    statistics,
    stationInfo,
    setCurrentPage,
  } = useStation();

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

  return (
    <div className="page-container">
      {/* Station Hero Card */}
      <div className="station-hero-card">
        <div className="station-hero-info">
          <h2>{selectedStation} Research Station, Antarctica</h2>
          <p>
            Digital Twin & Remote Telemetry Operations Center • National Centre for Polar and Ocean Research
            (NCPOR). Monitoring environmental life support, microgrid power, and scientific systems.
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
              <span>Commissioned {stationMeta.commissioned} • 34th ISEA Expedition</span>
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

      {/* Dataset timestamp notification */}
      <div
        style={{
          background: 'var(--bg-ice-subtle)',
          border: '1px solid #BAE6FD',
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
            <strong>Latest available observation in loaded dataset:</strong> {latestTimeStr}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-info">Historical NCPOR AWS Data</span>
          <button
            onClick={() => setCurrentPage('environmental')}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            Open Full Telemetry <ArrowUpRight size={12} />
          </button>
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
