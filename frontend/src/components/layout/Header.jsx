import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  RefreshCw,
  Play,
  Square,
  ChevronRight,
  Wifi,
  WifiOff,
  Database,
  Radio,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useStation } from '../../context/StationContext';

const PAGE_TITLES = {
  dashboard: { title: 'Mission Control Dashboard', desc: 'Central digital twin & real-time telemetry control center' },
  environmental: { title: 'Environmental & Meteorological Intelligence', desc: 'Real AWS telemetry, AI 24h forecast & ML hazard detection' },
  energy: { title: 'Energy & Polar Microgrid Twin', desc: 'Diesel generation, wind yields, BESS battery storage & fuel reserves' },
  infrastructure: { title: 'Infrastructure & Subsystems Twin', desc: 'Heating HVAC loops, SatCom ground station, water trace heat & life support' },
  logistics: { title: 'Logistics, Consumables & Expedition Supply', desc: 'Arctic diesel reserves, rations endurance & vessel resupply ETA' },
  cross_domain: { title: 'Cross-Domain Impact Engine', desc: 'Causal dependency graph connecting Environment, Infrastructure, Energy & Logistics' },
  alerts: { title: 'Operations & Alert Response Center', desc: 'Prioritized hazard notifications, SOP execution & operator audit timeline' },
  what_if: { title: 'What-If Interactive Simulator', desc: 'Stress-test hypothetical Antarctic storm scenarios and assess system responses' },
  replay: { title: 'Historical Storm Event Replay', desc: 'Chronological playback of historical Antarctic blizzards and digital twin reactions' },
  compare: { title: 'Station Comparison — Maitri vs Bharati', desc: 'Operational comparative analysis between Queen Maud Land and Larsemann Hills' },
  map: { title: 'Antarctic Continent Twin Map', desc: 'Geospatial visualization of Indian Antarctic research stations & real-time status' },
  data_quality: { title: 'Data Quality & ML Transparency', desc: 'Strict provenance, sensor anomaly validation & RandomForestClassifier metrics' },
};

export const Header = () => {
  const {
    selectedStation,
    setSelectedStation,
    currentPage,
    backendHealthy,
    wsConnected,
    refreshStationData,
    loading,
    dataMode,
    changeDataMode,
    connectivityStatus,
    toggleOfflineMode,
    queuedPackets,
    syncNow,
    demoRunning,
    demoStep,
    startDemoScenario,
    stopDemoScenario,
    advanceDemoStep,
  } = useStation();

  const [time, setTime] = useState(new Date());
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageMeta = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;

  const formatUtcTime = (d) => {
    return d.toUTCString().slice(17, 25) + ' UTC';
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'LIVE':
        return { bg: '#D1FAE5', border: '#10B981', text: '#065F46' };
      case 'PUBLIC_LIVE':
        return { bg: '#E0F2FE', border: '#38BDF8', text: '#0369A1' };
      case 'SIMULATION':
        return { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' };
      case 'HISTORICAL':
        return { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' };
      case 'OFFLINE':
      default:
        return { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' };
    }
  };

  const modeStyle = getModeColor(dataMode);

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-title-block">
          <h2>{pageMeta.title}</h2>
          <p>{pageMeta.desc}</p>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Demo Scenario Control Button */}
        {!demoRunning ? (
          <button
            className="btn btn-sm"
            onClick={() => startDemoScenario('SEVERE_WEATHER')}
            style={{
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
            title="Start automated 12-step Severe Weather demo scenario"
          >
            <Play size={13} fill="#FFFFFF" />
            <span>RUN DEMO SCENARIO</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: 'var(--radius-sm)', padding: '2px 6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>
              SCENARIO STEP {demoStep}/12
            </span>
            <button
              className="btn btn-sm btn-outline"
              style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}
              onClick={() => advanceDemoStep(Math.min(12, demoStep + 1))}
              disabled={demoStep >= 12}
              title="Next Scenario Step"
            >
              <ChevronRight size={12} />
            </button>
            <button
              className="btn btn-sm btn-outline"
              style={{ padding: '2px 6px', fontSize: '11px', height: '24px', color: '#DC2626' }}
              onClick={stopDemoScenario}
              title="Stop Scenario"
            >
              <Square size={10} fill="#DC2626" />
            </button>
          </div>
        )}

        {/* Station Switcher */}
        <div className="station-switcher" title="Select Indian Antarctic Station">
          <button
            type="button"
            className={`station-btn ${selectedStation === 'Maitri' ? 'active' : ''}`}
            onClick={() => setSelectedStation('Maitri')}
          >
            <MapPin size={13} />
            <span>Maitri</span>
          </button>
          <button
            type="button"
            className={`station-btn ${selectedStation === 'Bharati' ? 'active' : ''}`}
            onClick={() => setSelectedStation('Bharati')}
          >
            <MapPin size={13} />
            <span>Bharati</span>
          </button>
        </div>

        {/* Data Mode Pill with Popover */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            style={{
              background: modeStyle.bg,
              border: `1px solid ${modeStyle.border}`,
              color: modeStyle.text,
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
            title="Click to change Telemetry Data Mode"
          >
            <Database size={12} />
            <span>MODE: {dataMode}</span>
          </button>

          {showModeDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '6px',
                zIndex: 100,
                minWidth: '170px',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
                Select Telemetry Mode
              </div>
              {[
                { id: 'PUBLIC_LIVE', label: 'Public Live (Open-Meteo)', color: '#0284C7' },
                { id: 'LIVE', label: 'Verified Live (NCPOR Portal)', color: '#059669' },
                { id: 'SIMULATION', label: 'Stateful Simulation', color: '#7C3AED' },
                { id: 'HISTORICAL', label: 'Historical AWS Archive', color: '#D97706' },
                { id: 'OFFLINE', label: 'Offline / Last-Known-Good', color: '#DC2626' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    changeDataMode(m.id);
                    setShowModeDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: dataMode === m.id ? 'var(--bg-ice-subtle)' : 'transparent',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: dataMode === m.id ? 700 : 500,
                    color: m.color,
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Connectivity Status & Simulation Toggle */}
        <button
          type="button"
          onClick={toggleOfflineMode}
          style={{
            background: connectivityStatus === 'ONLINE' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${connectivityStatus === 'ONLINE' ? '#10B981' : '#EF4444'}`,
            color: connectivityStatus === 'ONLINE' ? '#065F46' : '#991B1B',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
          title={connectivityStatus === 'ONLINE' ? 'Click to simulate Antarctic satellite connectivity blackout' : 'Click to restore satellite link and sync queued telemetry'}
        >
          {connectivityStatus === 'ONLINE' ? <Wifi size={13} color="#10B981" /> : <WifiOff size={13} color="#EF4444" />}
          <span>{connectivityStatus}</span>
        </button>

        {/* Queued Packets & Sync Button if Offline */}
        {queuedPackets > 0 && (
          <button
            className="btn btn-sm btn-outline"
            onClick={syncNow}
            style={{ fontSize: '11px', color: '#0284C7', borderColor: '#38BDF8', padding: '3px 8px' }}
            title="Synchronize buffered telemetry packets"
          >
            Sync ({queuedPackets})
          </button>
        )}

        {/* Time display */}
        <div className="header-clock" title="Coordinated Universal Time (UTC)">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} style={{ color: 'var(--polar-ice)' }} />
            <span>{formatUtcTime(time)}</span>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={refreshStationData}
          disabled={loading}
          title="Manual Telemetry Ingestion Sync"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
