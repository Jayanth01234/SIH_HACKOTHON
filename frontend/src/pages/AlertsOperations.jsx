import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Wind,
  Zap,
  Building2,
  Radio,
  FileText,
} from 'lucide-react';
import { useStation } from '../context/StationContext';

const INITIAL_ALERTS = [
  {
    id: 'ALT-101',
    severity: 'warning',
    category: 'Meteorological',
    title: 'High Katabatic Wind Speed Watch',
    subsystem: 'AWS Station Telemetry',
    time: '12 min ago',
    detail: 'AWS records indicate wind speeds exceeding 15 m/s. Secure outdoor equipment and verify antenna guy wire tension.',
    status: 'Active',
    icon: Wind,
  },
  {
    id: 'ALT-102',
    severity: 'warning',
    category: 'Microgrid',
    title: 'Genset DG-02 Scheduled Lube Oil Service',
    subsystem: 'Diesel Generation House',
    time: '45 min ago',
    detail: 'DG-02 has reached 3,110 cumulative operating hours. Secondary filter replacement due within 48 operational hours.',
    status: 'Scheduled',
    icon: Zap,
  },
  {
    id: 'ALT-103',
    severity: 'info',
    category: 'Communications',
    title: 'GSAT / Inmarsat Satellite Azimuth Alignment',
    subsystem: 'SatCom Ground Station',
    time: '2 hours ago',
    detail: 'Routine tracking angle calibration completed. Signal-to-noise ratio: 18.4 dB. Uplink performance nominal.',
    status: 'Resolved',
    icon: Radio,
  },
  {
    id: 'ALT-104',
    severity: 'info',
    category: 'Life Support',
    title: 'Water Line Trace Heating Cycle',
    subsystem: 'Freshwater Intake',
    time: '4 hours ago',
    detail: 'Priyadarshini lake pump trace heat cycling active to prevent permafrost freezing. Line temperature: +4.2 °C.',
    status: 'Monitoring',
    icon: Building2,
  },
];

const SOPS = [
  { id: 'SOP-01', title: 'Severe Blizzard Class 3 Lockdown Protocol', category: 'Safety & Survival', compliance: '100% Ready' },
  { id: 'SOP-02', title: 'Automatic Weather Station (AWS) Daily Data Validation', category: 'Scientific Data', compliance: 'Active' },
  { id: 'SOP-03', title: 'Power Microgrid Black-Start & DG Failover Protocol', category: 'Energy & Power', compliance: 'Tested Monthly' },
  { id: 'SOP-04', title: 'Antarctic Treaty Madrid Protocol Waste Manifest', category: 'Environmental', compliance: '100% Compliant' },
];

export const AlertsOperations = () => {
  const { selectedStation: _selectedStation } = useStation();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a))
    );
  };

  return (
    <div className="page-container">
      {/* 4 Primary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Critical Incidents</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">0</span>
            <span className="kpi-unit">Active</span>
          </div>
          <div className="kpi-meta-row">
            <span>No critical alarms</span>
            <span>Station Secure</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Active Warnings</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">2</span>
            <span className="kpi-unit">Advisories</span>
          </div>
          <div className="kpi-meta-row">
            <span>1 Weather Watch</span>
            <span>1 Scheduled Maint.</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">System Advisories</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Radio size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">2</span>
            <span className="kpi-unit">Notices</span>
          </div>
          <div className="kpi-meta-row">
            <span>SatCom nominal</span>
            <span>Trace heat cycle</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Subsystems Operational</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">14</span>
            <span className="kpi-unit">/ 14 Systems</span>
          </div>
          <div className="kpi-meta-row">
            <span>Readiness: 100%</span>
            <span>NCPOR Monitored</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <AlertTriangle size={16} style={{ color: 'var(--polar-ice)' }} />
            <span>Active Incident, Weather & Maintenance Feed</span>
          </div>
          <span className="badge badge-normal">Automated Monitoring Live</span>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alert) => {
            const Icon = alert.icon;
            const isWarn = alert.severity === 'warning';
            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isWarn ? '#FFFBEB' : '#F8FAFC',
                  border: isWarn ? '1px solid #FDE68A' : '1px solid var(--polar-border)',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isWarn ? '#FEF3C7' : 'var(--bg-ice-tint)',
                      color: isWarn ? '#D97706' : 'var(--polar-ice)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={`badge ${isWarn ? 'badge-warning' : 'badge-info'}`}
                        style={{ fontSize: '10px' }}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <strong style={{ fontSize: '14px', color: 'var(--polar-navy)' }}>
                        {alert.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {alert.detail}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <span>Subsystem: <strong>{alert.subsystem}</strong></span>
                      <span>Logged: <strong>{alert.time}</strong></span>
                      <span>Status: <strong style={{ color: alert.status === 'Active' ? '#D97706' : '#16A34A' }}>{alert.status}</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {alert.status === 'Active' ? (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>
                      <CheckCircle2 size={14} />
                      <span>{alert.status}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={16} style={{ color: 'var(--polar-ice)' }} />
            <span>Station Standard Operating Procedures (SOPs) & Protocols</span>
          </div>
          <span className="badge badge-normal">Audit Compliant</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Protocol ID</th>
                <th>Standard Operating Procedure</th>
                <th>Category</th>
                <th>Operational Compliance</th>
                <th>Validation Protocol</th>
              </tr>
            </thead>
            <tbody>
              {SOPS.map((sop) => (
                <tr key={sop.id}>
                  <td style={{ fontWeight: 600 }}>{sop.id}</td>
                  <td style={{ fontWeight: 600 }}>{sop.title}</td>
                  <td>
                    <span className="badge badge-info">{sop.category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '12px' }}>
                      <CheckCircle2 size={14} />
                      <span>{sop.compliance}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-normal">Active Protocol</span>
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

export default AlertsOperations;
