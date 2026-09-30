import React from 'react';
import {
  LayoutDashboard,
  Wind,
  Zap,
  Building2,
  Anchor,
  GitFork,
  AlertTriangle,
  Sliders,
  History,
  GitCompare,
  MapPin,
  ShieldCheck,
  Compass,
  Radio,
} from 'lucide-react';
import { useStation } from '../../context/StationContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'environmental', label: 'Environmental Intelligence', icon: Wind },
  { id: 'energy', label: 'Energy Microgrid', icon: Zap },
  { id: 'infrastructure', label: 'Infrastructure Twin', icon: Building2 },
  { id: 'logistics', label: 'Logistics & Supply', icon: Anchor },
  { id: 'cross_domain', label: 'Cross-Domain Impact', icon: GitFork, badge: 'KEY' },
  { id: 'alerts', label: 'Alerts & Operations', icon: AlertTriangle },
  { id: 'what_if', label: 'What-If Simulator', icon: Sliders, badge: 'AI' },
  { id: 'replay', label: 'Historical Replay', icon: History },
  { id: 'compare', label: 'Station Comparison', icon: GitCompare },
  { id: 'map', label: 'Antarctic Map Twin', icon: MapPin },
  { id: 'data_quality', label: 'ML & Data Quality', icon: ShieldCheck },
];

export const Sidebar = () => {
  const { currentPage, setCurrentPage, selectedStation, digitalTwinState, dataMode } = useStation();

  const isMaitri = selectedStation === 'Maitri';
  const coords = isMaitri ? '70°45\'57" S, 11°44\'09" E' : '69°24\'28" S, 76°11\'14" E';
  const oasis = isMaitri ? 'Schirmacher Oasis' : 'Larsemann Hills';

  const healthScore = digitalTwinState?.overall_health_score || 94.2;
  const overallStatus = digitalTwinState?.overall_status || 'NORMAL';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Compass size={22} strokeWidth={2.4} />
        </div>
        <div className="sidebar-brand">
          <h1>POLARIS</h1>
          <span>Antarctic Mission Twin</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Operations & Intelligence</div>
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
                <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} />
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: item.badge === 'KEY' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                    color: item.badge === 'KEY' ? 'var(--polar-ice)' : '#A855F7',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '16px' }}>Station Telemetry</div>
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
              {selectedStation} Station
            </span>
            <span
              className={`badge badge-${overallStatus === 'NORMAL' ? 'normal' : 'critical'}`}
              style={{ fontSize: '10px', padding: '1px 6px' }}
            >
              {overallStatus}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {oasis}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {coords}
          </div>

          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>System Health:</span>
            <strong style={{ color: healthScore > 80 ? '#10B981' : '#F59E0B' }}>{healthScore}%</strong>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Radio size={12} color="#10B981" />
            <span>Mode: {dataMode}</span>
          </div>
        </div>
      </div>

      {/* Footer Info Badge */}
      <div className="sidebar-footer">
        <div className="sidebar-source-badge">
          <div className="title">MoES / NCPOR Telemetry</div>
          <div className="source-name">SIH 2026 Problem #26060</div>
          <span className="dataset-tag">Team InnoByte</span>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Unified Antarctic Digital Twin
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
