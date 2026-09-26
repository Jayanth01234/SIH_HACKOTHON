import React from 'react';
import {
  LayoutDashboard,
  Wind,
  Zap,
  Building2,
  Anchor,
  AlertTriangle,
  Compass,
  Radio,
} from 'lucide-react';
import { useStation } from '../../context/StationContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'environmental', label: 'Environmental Monitoring', icon: Wind },
  { id: 'energy', label: 'Energy Monitoring', icon: Zap },
  { id: 'infrastructure', label: 'Infrastructure Monitoring', icon: Building2 },
  { id: 'logistics', label: 'Logistics & Supply', icon: Anchor },
  { id: 'alerts', label: 'Alerts & Operations', icon: AlertTriangle },
];

export const Sidebar = () => {
  const { currentPage, setCurrentPage, selectedStation, stationInfo } = useStation();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Compass size={22} strokeWidth={2.4} />
        </div>
        <div className="sidebar-brand">
          <h1>POLARIS</h1>
          <span>Antarctic Mission Control</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Operations & Digital Twin</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-item-icon">
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '16px' }}>Station Status</div>
        <div
          style={{
            background: 'var(--bg-ice-subtle)',
            border: '1px solid #BAE6FD',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            margin: '0 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--polar-ice)', textTransform: 'uppercase' }}>
              Active Station
            </span>
            <span className="badge badge-normal" style={{ fontSize: '10px', padding: '1px 6px' }}>
              Online
            </span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginTop: '4px' }}>
            {selectedStation} Station
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {selectedStation === 'Maitri' ? '70°45\'57" S, 11°44\'09" E' : '69°24\'28" S, 76°11\'14" E'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Radio size={12} color="#10B981" />
            <span>AWS Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* Data Source Info Card */}
      <div className="sidebar-footer">
        <div className="sidebar-source-badge">
          <div className="title">Telemetry Feed</div>
          <div className="source-name">NCPOR / NPDC</div>
          <span className="dataset-tag">Historical AWS Jan 2015</span>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Observations: {stationInfo?.total_observations || 744} points
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
