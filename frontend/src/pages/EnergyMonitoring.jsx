import React from 'react';
import {
  Zap,
  BatteryCharging,
  Fuel,
  Activity,
  Sun,
  Wind as WindIcon,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useStation } from '../context/StationContext';

const ENERGY_CURVE = [
  { time: '00:00', Generation: 135, Consumption: 118, Wind: 25, Solar: 0, Diesel: 110 },
  { time: '03:00', Generation: 138, Consumption: 115, Wind: 28, Solar: 0, Diesel: 110 },
  { time: '06:00', Generation: 142, Consumption: 122, Wind: 29, Solar: 3, Diesel: 110 },
  { time: '09:00', Generation: 148, Consumption: 132, Wind: 31, Solar: 7, Diesel: 110 },
  { time: '12:00', Generation: 152, Consumption: 138, Wind: 34, Solar: 8, Diesel: 110 },
  { time: '15:00', Generation: 147, Consumption: 135, Wind: 30, Solar: 7, Diesel: 110 },
  { time: '18:00', Generation: 144, Consumption: 130, Wind: 28, Solar: 6, Diesel: 110 },
  { time: '21:00', Generation: 141, Consumption: 125, Wind: 27, Solar: 4, Diesel: 110 },
];

const SOURCE_MIX = [
  { name: 'Arctic Diesel Gensets', value: 76, color: '#0284C7' },
  { name: 'Wind Turbines', value: 20, color: '#10B981' },
  { name: 'Solar PV Array', value: 4, color: '#F59E0B' },
];

export const EnergyMonitoring = () => {
  const { selectedStation } = useStation();

  return (
    <div className="page-container">
      {/* 4 Primary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Total Microgrid Generation</span>
            <div className="kpi-icon-badge">
              <Zap size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">144.7</span>
            <span className="kpi-unit">kW</span>
          </div>
          <div className="kpi-meta-row">
            <span>Diesel: 110.0 kW</span>
            <span>Wind: 28.5 kW</span>
            <span>Solar: 6.2 kW</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Station Consumption</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">128.3</span>
            <span className="kpi-unit">kW</span>
          </div>
          <div className="kpi-meta-row">
            <span>Net Surplus: +16.4 kW</span>
            <span>Power Factor: 0.97</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Microgrid Efficiency</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#ECFEFF', color: '#0891B2' }}>
              <BatteryCharging size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">88.7</span>
            <span className="kpi-unit">%</span>
          </div>
          <div className="kpi-meta-row">
            <span>Frequency: 50.0 Hz</span>
            <span>Voltage: 415 V (3-Phase)</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Fuel Autonomy</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Fuel size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">78.4</span>
            <span className="kpi-unit">Days</span>
          </div>
          <div className="kpi-meta-row">
            <span>Reserves: 84,200 L</span>
            <span>Avg Burn: 1,074 L/day</span>
          </div>
        </div>
      </div>

      {/* Interactive Energy Flow Diagram (Digital Twin) */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Cpu size={16} style={{ color: 'var(--polar-ice)' }} />
            <span>{selectedStation} Station Energy Distribution Architecture</span>
          </div>
          <span className="badge badge-normal">Microgrid Synchronized</span>
        </div>

        <div className="card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr auto 1fr',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Generation Assets
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--polar-border)', borderRadius: '8px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Fuel size={15} style={{ color: 'var(--polar-ice)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Diesel Gensets (2 Active)</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--polar-navy)' }}>110.0 kW</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Cummins 62.5 kVA x2 • 1,500 RPM
                </div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--polar-border)', borderRadius: '8px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <WindIcon size={15} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Wind Turbines (2 Units)</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>28.5 kW</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Rugged Antarctic Turbines • 182 RPM
                </div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--polar-border)', borderRadius: '8px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sun size={15} style={{ color: '#F59E0B' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Solar PV Array</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>6.2 kW</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Antarctic Summer Insolation
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ArrowRight size={24} style={{ color: 'var(--polar-ice)' }} />
            </div>

            <div
              style={{
                padding: '24px 20px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Cpu size={32} style={{ color: '#38BDF8', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '15px', fontWeight: 700 }}>Central PMS Bus</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Automated Load Balancing</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#38BDF8', margin: '12px 0 4px' }}>
                144.7 kW
              </div>
              <div style={{ fontSize: '11px', color: '#E2E8F0' }}>415V / 50Hz Synchronous</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ArrowRight size={24} style={{ color: 'var(--polar-ice)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Station Consumers (128.3 kW)
              </div>
              {[
                { name: 'Life Support & Heating Glycol', val: '44.5 kW' },
                { name: 'Research Laboratories & AWS', val: '38.2 kW' },
                { name: 'Habitation & Kitchen Galley', val: '26.1 kW' },
                { name: 'Satellite Comms & Radio Mast', val: '11.5 kW' },
                { name: 'Snow Melter & Lake Water Intake', val: '8.0 kW' },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: '1px solid var(--polar-border)',
                    borderRadius: '6px',
                    background: '#F8FAFC',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: 'var(--polar-navy)', fontWeight: 500 }}>{c.name}</span>
                  <strong style={{ color: 'var(--polar-ice)' }}>{c.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2-1">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>24-Hour Microgrid Power Profile (kW)</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Continuous Telemetry</span>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENERGY_CURVE} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCons" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} unit=" kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <Area
                  type="monotone"
                  dataKey="Generation"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGen)"
                />
                <Area
                  type="monotone"
                  dataKey="Consumption"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCons)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Zap size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>Generation Mix</span>
            </div>
            <span className="badge badge-normal">Active</span>
          </div>
          <div className="card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={SOURCE_MIX}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SOURCE_MIX.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
              {SOURCE_MIX.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span>{item.name}: <strong>{item.value}%</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generator Health & Asset Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Fuel size={16} style={{ color: 'var(--polar-ice)' }} />
            <span>Power Asset Telemetry & Maintenance Schedule</span>
          </div>
          <span className="badge badge-normal">All Assets Nominal</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Designation</th>
                <th>Type / Model</th>
                <th>Operational Status</th>
                <th>Output Load</th>
                <th>Operating Temp</th>
                <th>Cumulative Hours</th>
                <th>Next Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Genset DG-01', model: 'Cummins 62.5 kVA', status: 'Running', load: '58.2 kW', temp: '82°C', hrs: '3,420 hrs', next: '180 hrs' },
                { name: 'Genset DG-02', model: 'Cummins 62.5 kVA', status: 'Running', load: '51.8 kW', temp: '80°C', hrs: '3,110 hrs', next: '490 hrs' },
                { name: 'Genset DG-03', model: 'Cummins 62.5 kVA', status: 'Standby', load: '0.0 kW', temp: '22°C (Pre-heated)', hrs: '1,980 hrs', next: '620 hrs' },
                { name: 'Wind Turbine WT-01', model: 'Proven 15 kW High-latitude', status: 'Optimal', load: '14.2 kW', temp: '-6°C', hrs: '8,240 hrs', next: 'Annual Insp.' },
                { name: 'Wind Turbine WT-02', model: 'Proven 15 kW High-latitude', status: 'Optimal', load: '14.3 kW', temp: '-6°C', hrs: '7,910 hrs', next: 'Annual Insp.' },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>{row.model}</td>
                  <td>
                    <span className={`badge ${row.status === 'Running' || row.status === 'Optimal' ? 'badge-normal' : 'badge-info'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.load}</td>
                  <td>{row.temp}</td>
                  <td>{row.hrs}</td>
                  <td>{row.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnergyMonitoring;
