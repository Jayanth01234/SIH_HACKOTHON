import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useStation } from '../../context/StationContext';

const PAGE_TITLES = {
  dashboard: { title: 'Mission Control Dashboard', desc: 'Central telemetry & digital twin overview' },
  environmental: { title: 'Environmental & Meteorological Monitoring', desc: 'Real AWS historical telemetry from NCPOR / NPDC' },
  energy: { title: 'Energy & Microgrid Management', desc: 'Generation, consumption & power distribution telemetry' },
  infrastructure: { title: 'Infrastructure & Building Digital Twin', desc: 'Structural health, climate control & module status' },
  logistics: { title: 'Logistics, Supply & Expedition Ops', desc: 'Vessel movements, fuel reserves & inventory tracking' },
  alerts: { title: 'Operations & Alert Response Center', desc: 'Subsystem alerts, severity feeds & operational protocols' },
};

export const Header = () => {
  const {
    selectedStation,
    setSelectedStation,
    currentPage,
    backendHealthy,
    refreshStationData,
    loading,
  } = useStation();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageMeta = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;

  const formatUtcTime = (d) => {
    return d.toUTCString().slice(17, 25) + ' UTC';
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-title-block">
          <h2>{pageMeta.title}</h2>
          <p>{pageMeta.desc}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Station Switcher */}
        <div className="station-switcher" title="Select Indian Antarctic Research Station">
          <button
            type="button"
            className={`station-btn ${selectedStation === 'Maitri' ? 'active' : ''}`}
            onClick={() => setSelectedStation('Maitri')}
          >
            <MapPin size={14} />
            <span>Maitri</span>
          </button>
          <button
            type="button"
            className={`station-btn ${selectedStation === 'Bharati' ? 'active' : ''}`}
            onClick={() => setSelectedStation('Bharati')}
          >
            <MapPin size={14} />
            <span>Bharati</span>
          </button>
        </div>

        {/* Backend Status */}
        <div
          className="header-indicator"
          style={{
            backgroundColor: backendHealthy ? 'var(--status-normal-bg)' : 'var(--status-critical-bg)',
            borderColor: backendHealthy ? 'var(--status-normal-border)' : 'var(--status-critical-border)',
            color: backendHealthy ? '#065F46' : '#991B1B',
          }}
          title={backendHealthy ? 'FastAPI Backend Online (port 8000)' : 'Backend Connection Issue'}
        >
          <span
            className="pulse-dot"
            style={{ backgroundColor: backendHealthy ? '#10B981' : '#EF4444' }}
          />
          <span>{backendHealthy ? 'ENGINE CONNECTED' : 'BACKEND OFFLINE'}</span>
        </div>

        {/* Time display */}
        <div className="header-clock" title="Coordinated Universal Time (UTC)">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} style={{ color: 'var(--polar-ice)' }} />
            <span>{formatUtcTime(time)}</span>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={refreshStationData}
          disabled={loading}
          title="Refresh Telemetry Data"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
