import React, { useState } from 'react';
import {
  Building2,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Users,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useStation } from '../context/StationContext';

const MODULES_DATA = [
  { id: 'MOD-01', name: 'Main Habitation & Command', temp: 20.8, pressure: '1013 hPa', vibration: '0.02 mm/s', status: 'Nominal', capacity: '12 / 16' },
  { id: 'MOD-02', name: 'Atmospheric Physics & AWS Lab', temp: 19.5, pressure: '1012 hPa', vibration: '0.01 mm/s', status: 'Nominal', capacity: '4 / 6' },
  { id: 'MOD-03', name: 'Geomagnetism & Seismology Vault', temp: 18.2, pressure: '1014 hPa', vibration: '0.005 mm/s', status: 'Nominal', capacity: '2 / 4' },
  { id: 'MOD-04', name: 'Medical Facility & Surgical Bay', temp: 21.2, pressure: '1015 hPa', vibration: '0.01 mm/s', status: 'Warning', capacity: '1 / 2' },
  { id: 'MOD-05', name: 'Central Power Generation Hall', temp: 24.0, pressure: '1011 hPa', vibration: '0.18 mm/s', status: 'Nominal', capacity: '2 / 4' },
  { id: 'MOD-06', name: 'Snow Melt & Priyadarshini Water Line', temp: 16.5, pressure: '1013 hPa', vibration: '0.04 mm/s', status: 'Maintenance', capacity: '1 / 2' },
];

const MODULE_TEMPS = [
  { module: 'Habitation', Temp: 20.8, Target: 21.0 },
  { module: 'AWS Lab', Temp: 19.5, Target: 20.0 },
  { module: 'Geomag', Temp: 18.2, Target: 18.0 },
  { module: 'Medical', Temp: 21.2, Target: 21.0 },
  { module: 'Power Hall', Temp: 24.0, Target: 22.0 },
  { module: 'Water Melter', Temp: 16.5, Target: 16.0 },
];

export const InfrastructureMonitoring = () => {
  const { selectedStation } = useStation();
  const [selectedModule, setSelectedModule] = useState(MODULES_DATA[0]);

  return (
    <div className="page-container">
      {/* 5 Primary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Station Modules</span>
            <div className="kpi-icon-badge">
              <Building2 size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">12</span>
            <span className="kpi-unit">Units</span>
          </div>
          <div className="kpi-meta-row">
            <span>Enclosed Corridors: 3</span>
            <span>Total Area: 2,400 m²</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Operational Status</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">10</span>
            <span className="kpi-unit">Nominal</span>
          </div>
          <div className="kpi-meta-row">
            <span>Integrity: 98.4%</span>
            <span>HVAC: Fully Functional</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Maintenance Scheduled</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">1</span>
            <span className="kpi-unit">Module</span>
          </div>
          <div className="kpi-meta-row">
            <span>Water Intake Trace Heat</span>
            <span>Next: 48h</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Active Warnings</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">1</span>
            <span className="kpi-unit">Advisory</span>
          </div>
          <div className="kpi-meta-row">
            <span>Medical Bay HVAC Diff</span>
            <span>Non-critical</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Expedition Capacity</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">25</span>
            <span className="kpi-unit">/ 40 Max</span>
          </div>
          <div className="kpi-meta-row">
            <span>Scientists: 14</span>
            <span>Logistics & Medical: 11</span>
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>{selectedStation} Station Architectural Layout & Digital Twin</span>
            </div>
            <span className="badge badge-normal">3D Model Synchronized</span>
          </div>

          <div className="card-body">
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--polar-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                minHeight: '320px',
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              {MODULES_DATA.map((mod) => {
                const isSelected = selectedModule.id === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    style={{
                      padding: '14px',
                      backgroundColor: isSelected ? 'white' : '#FFFFFF',
                      border: isSelected ? '2px solid var(--polar-ice)' : '1px solid var(--polar-border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'var(--shadow-sm)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {mod.id}
                      </span>
                      <span
                        className={`badge ${
                          mod.status === 'Nominal'
                            ? 'badge-normal'
                            : mod.status === 'Warning'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                        style={{ fontSize: '10px' }}
                      >
                        {mod.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--polar-navy)', marginTop: '6px' }}>
                      {mod.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>Temp: <strong>{mod.temp}°C</strong></span>
                      <span>Vib: <strong>{mod.vibration}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: '16px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-ice-subtle)',
                border: '1px solid #BAE6FD',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--polar-ice)', textTransform: 'uppercase' }}>
                  Module Inspection: {selectedModule.id}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                  {selectedModule.name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
                <div>Indoor Temp: <strong>{selectedModule.temp} °C</strong></div>
                <div>Pressure: <strong>{selectedModule.pressure}</strong></div>
                <div>Seismic Vibration: <strong>{selectedModule.vibration}</strong></div>
                <div>Occupants: <strong>{selectedModule.capacity}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Thermometer size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>Climate Control (°C)</span>
            </div>
            <span className="badge badge-normal">Nominal</span>
          </div>
          <div className="card-body" style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODULE_TEMPS} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="module" stroke="#94A3B8" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} unit="°C" domain={[10, 28]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="Temp" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={16} style={{ color: 'var(--polar-ice)' }} />
            <span>Infrastructure Health & Safety Systems Matrix</span>
          </div>
          <span className="badge badge-normal">Fire & Gas Systems Ready</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module ID</th>
                <th>Facility Name</th>
                <th>Indoor Temperature</th>
                <th>HVAC Delta</th>
                <th>Structural Vibration</th>
                <th>Fire Suppression</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {MODULES_DATA.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.id}</td>
                  <td>{row.name}</td>
                  <td style={{ fontWeight: 600 }}>{row.temp} °C</td>
                  <td>+0.4 kPa (Positive Pres.)</td>
                  <td>{row.vibration}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '12px' }}>
                      <CheckCircle2 size={14} />
                      <span>Armed (Clean Agent)</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        row.status === 'Nominal'
                          ? 'badge-normal'
                          : row.status === 'Warning'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureMonitoring;
