import React, { useState, useEffect } from 'react';
import heroImage from '../assets/polaris-hero.png';
import '../styles/home.css';

import {
  Compass,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Wind,
  Zap,
  Building2,
  Anchor,
  AlertTriangle,
  Radio,
  Layers,
  Sparkles,
  Database,
  Cpu,
  Activity,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import { useStation } from '../context/StationContext';
import polarisApi from '../services/api';

export const Home = () => {
  const { setCurrentPage } = useStation();

  // State for real historical observations from both stations for Section 5
  const [maitriLatest, setMaitriLatest] = useState(null);
  const [bharatiLatest, setBharatiLatest] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        const [mRes, bRes] = await Promise.allSettled([
          polarisApi.getLatestObservation('Maitri'),
          polarisApi.getLatestObservation('Bharati'),
        ]);
        if (isMounted) {
          if (mRes.status === 'fulfilled') setMaitriLatest(mRes.value);
          if (bRes.status === 'fulfilled') setBharatiLatest(bRes.value);
        }
      } catch (err) {
        console.warn('Unable to pre-fetch station observations on home page:', err);
      }
    }
    loadTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToCapabilities = () => {
    const el = document.getElementById('capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
  };

  const formatUtcTime = (isoStr) => {
    if (!isoStr) return '--';
    const d = new Date(isoStr);
    return `${d.getUTCDate()} Jan ${String(d.getUTCHours()).padStart(2, '0')}:00 UTC`;
  };

  return (
    <div className="home-page">
      {/* Top Navbar */}
      <header className="home-navbar">
        <div className="home-nav-brand" onClick={() => navigateTo('home')}>
          <div className="home-nav-logo">
            <Compass size={22} strokeWidth={2.4} />
          </div>
          <div className="home-nav-title">
            <h1>POLARIS</h1>
            <span>Indian Antarctic Research Programme</span>
          </div>
        </div>

        <nav className="home-nav-links">
          <a href="#the-problem" className="home-nav-link">The Mission</a>
          <a href="#capabilities" className="home-nav-link">Domains</a>
          <a href="#digital-twin" className="home-nav-link">Digital Twin</a>
          <a href="#verified-data" className="home-nav-link">NCPOR Data</a>
          <a href="#future-intelligence" className="home-nav-link">Intelligence</a>
          <a href="#modules" className="home-nav-link">Modules</a>
          <a href="#transparency" className="home-nav-link">Transparency</a>
        </nav>

        <button
          type="button"
          className="home-nav-cta"
          onClick={() => navigateTo('dashboard')}
        >
          <span>Enter Mission Control</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* SECTION 1 — HERO */}
      <section
        className="home-hero"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="home-hero-overlay" />
        <div className="home-hero-radial" />

        <div className="home-hero-content">
          <div className="hero-programme-badge">
            <span className="hero-flag-accent">
              <span />
              <span />
              <span />
            </span>
            <span>INDIAN ANTARCTIC RESEARCH PROGRAMME</span>
          </div>

          <h1 className="home-hero-title">POLARIS</h1>

          <div className="home-hero-subtitle-block">
            <div className="home-hero-subtitle">
              Digital Twin &amp; Remote Management Platform
            </div>
            <div className="home-hero-stationline">
              for India's Antarctic Research Stations
            </div>
          </div>

          <p className="home-hero-desc">
            Connecting environmental intelligence, infrastructure, energy and logistics into one unified mission-control platform for Maitri and Bharati.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              className="hero-btn-primary"
              onClick={() => navigateTo('dashboard')}
            >
              <span>Explore POLARIS</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="hero-btn-secondary"
              onClick={scrollToCapabilities}
            >
              <span>Explore Capabilities</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="hero-status-pill">
            <ShieldCheck size={14} />
            <span>Historical NCPOR / NPDC Environmental Data Available</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section id="the-problem" className="home-section" style={{ borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="section-pretitle">Operational Context</span>
          <h2 className="section-heading">Managing Research Stations at the Edge of the World</h2>
          <p className="section-desc">
            Antarctic research stations operate in extreme environments where harsh weather, isolated infrastructure, fragmented operational data and remote decision-making create significant operational challenges.
          </p>
        </div>

        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon-wrapper">
              <Wind size={22} />
            </div>
            <h3>Extreme Environment</h3>
            <p>Severe weather and isolated infrastructure increase operational complexity.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-wrapper">
              <Layers size={22} />
            </div>
            <h3>Fragmented Operations</h3>
            <p>Environmental, energy, infrastructure and logistics information may exist across separate operational domains.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-wrapper">
              <Radio size={22} />
            </div>
            <h3>Limited Connectivity</h3>
            <p>Remote stations require efficient monitoring and decision support under constrained communication conditions.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-wrapper">
              <Compass size={22} />
            </div>
            <h3>Remote Decision Making</h3>
            <p>Operators need a unified view of station conditions to support faster and better-informed decisions.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT IS POLARIS? */}
      <section id="capabilities" className="home-section" style={{ backgroundColor: '#FAFCFE', borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="section-pretitle">Architecture</span>
          <h2 className="section-heading">One Platform. Multiple Mission Domains.</h2>
          <p className="section-desc">
            POLARIS integrates scientific observations and facility telemetry across four fundamental operational domains into a coordinated management interface.
          </p>
        </div>

        <div className="capabilities-grid">
          {/* Environmental Intelligence */}
          <div className="capability-card">
            <div>
              <div className="capability-card-header">
                <div className="capability-icon-box">
                  <Wind size={20} />
                </div>
                <span className="badge badge-verified">Verified Historical Data</span>
              </div>
              <h3>ENVIRONMENTAL INTELLIGENCE</h3>
              <ul className="param-list">
                {['Temperature', 'Relative Humidity', 'Wind Speed', 'Wind Direction', 'Atmospheric Pressure'].map((param, i) => (
                  <li key={i} className="param-item">
                    <span className="param-dot" />
                    <span>{param}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigateTo('environmental')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>View Observations</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Energy Management */}
          <div className="capability-card">
            <div>
              <div className="capability-card-header">
                <div className="capability-icon-box" style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#D97706' }}>
                  <Zap size={20} />
                </div>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>ENERGY MANAGEMENT</h3>
              <ul className="param-list">
                {['Energy generation', 'Station load', 'Renewable energy', 'Future optimization'].map((param, i) => (
                  <li key={i} className="param-item">
                    <span className="param-dot" style={{ backgroundColor: '#D97706' }} />
                    <span>{param}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigateTo('energy')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>View Microgrid</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Infrastructure */}
          <div className="capability-card">
            <div>
              <div className="capability-card-header">
                <div className="capability-icon-box" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' }}>
                  <Building2 size={20} />
                </div>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>INFRASTRUCTURE</h3>
              <ul className="param-list">
                {['Buildings', 'Facilities', 'Equipment', 'Digital Twin'].map((param, i) => (
                  <li key={i} className="param-item">
                    <span className="param-dot" style={{ backgroundColor: '#16A34A' }} />
                    <span>{param}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigateTo('infrastructure')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>View Facilities</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Logistics & Supply */}
          <div className="capability-card">
            <div>
              <div className="capability-card-header">
                <div className="capability-icon-box" style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' }}>
                  <Anchor size={20} />
                </div>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>LOGISTICS &amp; SUPPLY</h3>
              <ul className="param-list">
                {['Inventory', 'Resupply planning', 'Vessel / flight tracking', 'Supply management'].map((param, i) => (
                  <li key={i} className="param-item">
                    <span className="param-dot" style={{ backgroundColor: '#2563EB' }} />
                    <span>{param}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigateTo('logistics')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>View Supply Lines</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4 — DIGITAL TWIN */}
      <section id="digital-twin" className="home-section" style={{ borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="section-pretitle">Digital Twin Framework</span>
          <h2 className="section-heading">From Data to a Digital Twin</h2>
          <p className="section-desc">
            POLARIS provides a unified digital representation of Antarctic research station operations, creating a foundation for monitoring, analysis, simulation and future predictive intelligence.
          </p>
        </div>

        <div className="digital-twin-showcase">
          <div className="digital-twin-top">
            <div>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38BDF8', color: '#38BDF8', marginBottom: '8px' }}>
                Digital Twin Preview
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginTop: '4px' }}>
                Integrated Antarctic Station Model
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '580px', marginTop: '4px' }}>
                Simulating physical facility state, power balance, and external climate conditions within a single spatial data fabric.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigateTo('dashboard')}
            >
              <span>Launch Twin View</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="digital-twin-diagram">
            <div className="dt-node-card">
              <div className="dt-node-icon">
                <Wind size={20} />
              </div>
              <div className="dt-node-title">Environmental</div>
              <div className="dt-node-sub">Microclimate &amp; AWS observation telemetry</div>
            </div>

            <div className="dt-node-card">
              <div className="dt-node-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
                <Zap size={20} />
              </div>
              <div className="dt-node-title">Energy Systems</div>
              <div className="dt-node-sub">Microgrid, diesel generators &amp; renewables</div>
            </div>

            <div className="dt-node-card">
              <div className="dt-node-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
                <Building2 size={20} />
              </div>
              <div className="dt-node-title">Infrastructure</div>
              <div className="dt-node-sub">Living modules, HVAC &amp; lake pumping</div>
            </div>

            <div className="dt-node-card">
              <div className="dt-node-icon" style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60A5FA' }}>
                <Anchor size={20} />
              </div>
              <div className="dt-node-title">Logistics</div>
              <div className="dt-node-sub">Fuel autonomy, shipping &amp; provisions</div>
            </div>

            <div className="dt-node-card">
              <div className="dt-node-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }}>
                <AlertTriangle size={20} />
              </div>
              <div className="dt-node-title">Operations</div>
              <div className="dt-node-sub">Standard procedures &amp; alert triggers</div>
            </div>
          </div>

          <div className="dt-sync-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} style={{ color: '#38BDF8' }} />
              <span>Digital Twin Architecture: Multi-node state synchronizer</span>
            </div>
            <span style={{ color: '#94A3B8', fontSize: '11px' }}>
              *Prototype demonstration model. Does not currently receive live station telemetry.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 5 — VERIFIED ENVIRONMENTAL DATA */}
      <section id="verified-data" className="home-section" style={{ backgroundColor: '#FAFCFE', borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="section-pretitle">Observational Archive</span>
          <h2 className="section-heading">Built on Verified Environmental Observations</h2>
          <p className="section-desc">
            Directly ingested from real National Polar Data Center (NPDC / NCPOR) Automatic Weather Station (AWS) records from India's active Antarctic scientific outposts.
          </p>
        </div>

        <div className="stations-comparison-grid">
          {/* Maitri Card */}
          <div className="station-verified-card">
            <div className="station-card-top">
              <div>
                <span className="badge badge-verified">Verified Historical Data</span>
                <h3 className="station-name-title" style={{ marginTop: '8px' }}>MAITRI STATION</h3>
                <div className="station-card-meta">
                  70°45'57" S, 11°44'09" E • Schirmacher Oasis (117m ASL)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Data Period</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--polar-navy)' }}>January 2015</div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Source: <strong>Historical NCPOR / NPDC AWS Observations</strong>
            </div>

            <div className="station-params-grid">
              <div className="param-box">
                <span className="param-box-label">Temperature</span>
                <span className="param-box-val" style={{ color: '#0284C7' }}>
                  {maitriLatest?.temperature !== undefined && maitriLatest?.temperature !== null
                    ? `${Number(maitriLatest.temperature).toFixed(1)} °C`
                    : '-5.7 °C'}
                </span>
                <span className="param-box-unit">Air Temperature</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Humidity</span>
                <span className="param-box-val" style={{ color: '#0891B2' }}>
                  {maitriLatest?.relative_humidity !== undefined && maitriLatest?.relative_humidity !== null
                    ? `${Number(maitriLatest.relative_humidity).toFixed(1)} %`
                    : '73.2 %'}
                </span>
                <span className="param-box-unit">Relative Humidity</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Wind Speed</span>
                <span className="param-box-val" style={{ color: '#16A34A' }}>
                  {maitriLatest?.wind_speed !== undefined && maitriLatest?.wind_speed !== null
                    ? `${Number(maitriLatest.wind_speed).toFixed(1)} m/s`
                    : '1.2 m/s'}
                </span>
                <span className="param-box-unit">Surface Wind</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Wind Direction</span>
                <span className="param-box-val" style={{ color: '#2563EB' }}>
                  {maitriLatest?.wind_direction !== undefined && maitriLatest?.wind_direction !== null
                    ? `${Number(maitriLatest.wind_direction).toFixed(0)}°`
                    : '299°'}
                </span>
                <span className="param-box-unit">Degrees</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Pressure</span>
                <span className="param-box-val" style={{ color: '#7C3AED' }}>
                  {maitriLatest?.atmospheric_pressure !== undefined && maitriLatest?.atmospheric_pressure !== null
                    ? `${Number(maitriLatest.atmospheric_pressure).toFixed(1)} hPa`
                    : '974.0 hPa'}
                </span>
                <span className="param-box-unit">Barometric</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Observation Time</span>
                <span className="param-box-val" style={{ fontSize: '13px', paddingTop: '4px' }}>
                  {maitriLatest?.timestamp ? formatUtcTime(maitriLatest.timestamp) : '30 Jan 00:00 UTC'}
                </span>
                <span className="param-box-unit">Recorded Stamp</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigateTo('environmental')}
              style={{ alignSelf: 'flex-start' }}
            >
              <span>Explore Maitri AWS Dataset</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Bharati Card */}
          <div className="station-verified-card">
            <div className="station-card-top">
              <div>
                <span className="badge badge-verified">Verified Historical Data</span>
                <h3 className="station-name-title" style={{ marginTop: '8px' }}>BHARATI STATION</h3>
                <div className="station-card-meta">
                  69°24'28" S, 76°11'14" E • Larsemann Hills (35m ASL)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Data Period</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--polar-navy)' }}>January 2015</div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Source: <strong>Historical NCPOR / NPDC AWS Observations</strong>
            </div>

            <div className="station-params-grid">
              <div className="param-box">
                <span className="param-box-label">Temperature</span>
                <span className="param-box-val" style={{ color: '#0284C7' }}>
                  {bharatiLatest?.temperature !== undefined && bharatiLatest?.temperature !== null
                    ? `${Number(bharatiLatest.temperature).toFixed(1)} °C`
                    : '-0.5 °C'}
                </span>
                <span className="param-box-unit">Air Temperature</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Humidity</span>
                <span className="param-box-val" style={{ color: '#0891B2' }}>
                  {bharatiLatest?.relative_humidity !== undefined && bharatiLatest?.relative_humidity !== null
                    ? `${Number(bharatiLatest.relative_humidity).toFixed(1)} %`
                    : '52.3 %'}
                </span>
                <span className="param-box-unit">Relative Humidity</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Wind Speed</span>
                <span className="param-box-val" style={{ color: '#16A34A' }}>
                  {bharatiLatest?.wind_speed !== undefined && bharatiLatest?.wind_speed !== null
                    ? `${Number(bharatiLatest.wind_speed).toFixed(1)} m/s`
                    : '5.6 m/s'}
                </span>
                <span className="param-box-unit">Surface Wind</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Wind Direction</span>
                <span className="param-box-val" style={{ color: '#2563EB' }}>
                  {bharatiLatest?.wind_direction !== undefined && bharatiLatest?.wind_direction !== null
                    ? `${Number(bharatiLatest.wind_direction).toFixed(0)}°`
                    : '181°'}
                </span>
                <span className="param-box-unit">Degrees</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Pressure</span>
                <span className="param-box-val" style={{ color: '#7C3AED' }}>
                  {bharatiLatest?.atmospheric_pressure !== undefined && bharatiLatest?.atmospheric_pressure !== null
                    ? `${Number(bharatiLatest.atmospheric_pressure).toFixed(1)} hPa`
                    : '988.0 hPa'}
                </span>
                <span className="param-box-unit">Barometric</span>
              </div>

              <div className="param-box">
                <span className="param-box-label">Observation Time</span>
                <span className="param-box-val" style={{ fontSize: '13px', paddingTop: '4px' }}>
                  {bharatiLatest?.timestamp ? formatUtcTime(bharatiLatest.timestamp) : '31 Jan 00:00 UTC'}
                </span>
                <span className="param-box-unit">Recorded Stamp</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigateTo('environmental')}
              style={{ alignSelf: 'flex-start' }}
            >
              <span>Explore Bharati AWS Dataset</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Exact Required Disclaimer */}
        <div className="exact-disclaimer-box">
          <Database size={20} style={{ flexShrink: 0 }} />
          <div>
            Latest available observation in loaded dataset. This dataset represents historical observations and does not represent live station telemetry.
          </div>
        </div>
      </section>

      {/* SECTION 6 — FUTURE INTELLIGENCE */}
      <section id="future-intelligence" className="home-section" style={{ borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="badge badge-future" style={{ marginBottom: '8px' }}>
            Future Data Integration / AI Capabilities
          </span>
          <h2 className="section-heading">Designed for the Next Layer of Intelligence</h2>
          <p className="section-desc">
            Conceptual frameworks for machine learning, anomaly forecasting, and autonomous microgrid control envisioned for future Indian Antarctic scientific expeditions.
          </p>
        </div>

        <div className="future-grid">
          <div className="future-card">
            <div className="future-icon-box">
              <Activity size={20} />
            </div>
            <h3>PREDICTIVE MAINTENANCE</h3>
            <p>Identify potential equipment issues before failure.</p>
          </div>

          <div className="future-card">
            <div className="future-icon-box">
              <Zap size={20} />
            </div>
            <h3>ENERGY OPTIMIZATION</h3>
            <p>Forecast demand and coordinate generation, storage and renewable resources.</p>
          </div>

          <div className="future-card">
            <div className="future-icon-box">
              <AlertTriangle size={20} />
            </div>
            <h3>ANOMALY DETECTION</h3>
            <p>Identify unusual environmental or operational patterns.</p>
          </div>

          <div className="future-card">
            <div className="future-icon-box">
              <Workflow size={20} />
            </div>
            <h3>SCENARIO SIMULATION</h3>
            <p>Explore how operational changes could affect station systems.</p>
          </div>

          <div className="future-card">
            <div className="future-icon-box">
              <Sparkles size={20} />
            </div>
            <h3>DECISION SUPPORT</h3>
            <p>Convert complex station information into actionable insights for operators.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7 — PLATFORM MODULES */}
      <section id="modules" className="home-section" style={{ backgroundColor: '#FAFCFE', borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="section-pretitle">System Directory</span>
          <h2 className="section-heading">Explore the POLARIS Mission Control Platform</h2>
          <p className="section-desc">
            Access dedicated monitoring and simulation modules built to address specialized station subsystems.
          </p>
        </div>

        <div className="modules-grid">
          {/* 01 Environmental Monitoring */}
          <div className="module-card" onClick={() => navigateTo('environmental')}>
            <div>
              <div className="module-card-top">
                <span className="module-num">01</span>
                <span className="badge badge-verified">Verified Historical Data</span>
              </div>
              <h3>Environmental Monitoring</h3>
              <p>Verified historical NCPOR / NPDC observations.</p>
            </div>
            <div className="module-action-link">
              <span>Open Environmental Module</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 02 Energy Monitoring */}
          <div className="module-card" onClick={() => navigateTo('energy')}>
            <div>
              <div className="module-card-top">
                <span className="module-num">02</span>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>Energy Monitoring</h3>
              <p>Energy management and microgrid visualization.</p>
            </div>
            <div className="module-action-link">
              <span>Open Energy Module</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 03 Infrastructure Monitoring */}
          <div className="module-card" onClick={() => navigateTo('infrastructure')}>
            <div>
              <div className="module-card-top">
                <span className="module-num">03</span>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>Infrastructure Monitoring</h3>
              <p>Station facilities and digital twin visualization.</p>
            </div>
            <div className="module-action-link">
              <span>Open Infrastructure Module</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 04 Logistics & Supply */}
          <div className="module-card" onClick={() => navigateTo('logistics')}>
            <div>
              <div className="module-card-top">
                <span className="module-num">04</span>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>Logistics &amp; Supply</h3>
              <p>Supply, inventory and resupply planning.</p>
            </div>
            <div className="module-action-link">
              <span>Open Logistics Module</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 05 Alerts & Operations */}
          <div className="module-card" onClick={() => navigateTo('alerts')}>
            <div>
              <div className="module-card-top">
                <span className="module-num">05</span>
                <span className="badge badge-prototype">Prototype / Demonstration Data</span>
              </div>
              <h3>Alerts &amp; Operations</h3>
              <p>Operational alerts, system status and decision support.</p>
            </div>
            <div className="module-action-link">
              <span>Open Alerts Module</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 06 Digital Twin */}
          <div className="module-card" onClick={() => navigateTo('dashboard')}>
            <div>
              <div className="module-card-top">
                <span className="module-num">06</span>
                <span className="badge badge-future">Future / Demonstration Capability</span>
              </div>
              <h3>Digital Twin</h3>
              <p>Unified visualization of station systems.</p>
            </div>
            <div className="module-action-link">
              <span>Open Digital Twin</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — DATA TRANSPARENCY */}
      <section id="transparency" className="home-section" style={{ borderBottom: '1px solid var(--polar-border)' }}>
        <div className="home-section-header">
          <span className="section-pretitle">Integrity &amp; Provenance</span>
          <h2 className="section-heading">Transparent by Design</h2>
          <p className="section-desc">
            To ensure scientific rigor, POLARIS maintains clear boundaries between real NCPOR historical measurements and prototype demonstration systems.
          </p>
        </div>

        <div className="transparency-grid">
          <div className="transparency-card">
            <span className="badge badge-verified transparency-tag">
              <CheckCircle2 size={13} />
              <span>Verified Historical Data</span>
            </span>
            <h3>Historical NCPOR / NPDC AWS Observations</h3>
            <p>
              Historical NCPOR / NPDC AWS observations from Maitri and Bharati, January 2015.
            </p>
          </div>

          <div className="transparency-card">
            <span className="badge badge-prototype transparency-tag">
              <Activity size={13} />
              <span>Prototype / Demonstration Data</span>
            </span>
            <h3>Operational Subsystems Simulation</h3>
            <p>
              Interface modules demonstrating future energy, infrastructure, logistics and operations capabilities.
            </p>
          </div>

          <div className="transparency-card">
            <span className="badge badge-future transparency-tag">
              <Sparkles size={13} />
              <span>Future Data Integration</span>
            </span>
            <h3>Autonomous Intelligence Roadmap</h3>
            <p>
              Future integration of additional station telemetry, operational systems and intelligent decision-support data.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9 — CALL TO ACTION */}
      <section className="home-section">
        <div className="cta-banner">
          <h2>Enter Antarctic Mission Control</h2>
          <p>
            Explore how environmental observations, digital twins and future operational intelligence can come together in one unified platform.
          </p>
          <button
            type="button"
            className="cta-btn-large"
            onClick={() => navigateTo('dashboard')}
          >
            <span>Enter Mission Control</span>
            <ArrowRight size={18} />
          </button>
          <div className="cta-subtext">
            Current verified environmental data: Historical NCPOR / NPDC January 2015 observations.
          </div>
        </div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-top">
            <div className="footer-brand-block">
              <h3>POLARIS</h3>
              <p>Digital Twin &amp; Remote Management Platform</p>
              <div className="footer-brand-stations">Maitri • Bharati • Antarctica</div>
            </div>

            <div className="footer-disclaimer-block">
              <p style={{ fontWeight: 600, color: '#E2E8F0', marginBottom: '4px' }}>Data Provenance Notice</p>
              <p>Historical NCPOR / NPDC environmental observations.</p>
              <p style={{ marginTop: '4px' }}>
                Prototype modules represent future platform capabilities and demonstration data.
              </p>
            </div>
          </div>

          <div className="home-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} POLARIS • Indian Antarctic Research Programme • Ministry of Earth Sciences, Govt. of India
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}
              >
                Back to Top ↑
              </button>
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Launch Dashboard →
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
