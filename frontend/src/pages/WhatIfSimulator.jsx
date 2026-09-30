import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Wind,
  Thermometer,
  Gauge,
  Fuel,
} from 'lucide-react';
import { useStation } from '../context/StationContext';
import polarisApi from '../services/api';

export const WhatIfSimulator = () => {
  const { selectedStation } = useStation();

  // Slider inputs
  const [windDelta, setWindDelta] = useState(25);
  const [tempDelta, setTempDelta] = useState(-6);
  const [pressureDelta, setPressureDelta] = useState(-12);
  const [fuelDelta, setFuelDelta] = useState(-15);
  const [demandDelta, setDemandDelta] = useState(20);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        station_id: selectedStation,
        wind_delta_pct: parseFloat(windDelta),
        temp_delta_c: parseFloat(tempDelta),
        pressure_delta_hpa: parseFloat(pressureDelta),
        fuel_delta_pct: parseFloat(fuelDelta),
        energy_demand_delta_pct: parseFloat(demandDelta),
      };
      const res = await polarisApi.runWhatIf(payload);
      setSimResult(res);
    } catch (err) {
      console.error('Failed to run what-if simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWindDelta(0);
    setTempDelta(0);
    setPressureDelta(0);
    setFuelDelta(0);
    setDemandDelta(0);
    setSimResult(null);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          color: '#FFFFFF',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#C084FC', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Digital Twin Predictive Playground
            </span>
            <span style={{ fontSize: '13px', color: '#CBD5E1' }}>Station: {selectedStation}</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', color: '#F8FAFC' }}>
            Interactive "What-If" Stress Test Simulator
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#E0E7FF', maxWidth: '750px' }}>
            Perturb environmental boundaries and station energy loads. The mathematical twin recalculates microgrid loads, structural deflections, fuel reserve days, and ML risk probabilities in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={handleReset}
            style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            <RotateCcw size={14} />
            <span>Reset Baseline</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRunSimulation}
            disabled={loading}
            style={{ background: '#6366F1', borderColor: '#4F46E5', fontWeight: 700 }}
          >
            <Play size={14} fill="#FFFFFF" />
            <span>{loading ? 'Calculating Twin...' : 'Simulate State Change'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Sliders Panel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sliders size={18} color="var(--polar-ice)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', textTransform: 'uppercase' }}>
              Hypothetical Stress Variables
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Slider 1: Wind */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--polar-navy)' }}>
                  <Wind size={14} color="#0284C7" /> Wind Velocity Change:
                </span>
                <strong style={{ color: windDelta > 0 ? '#EF4444' : '#10B981' }}>
                  {windDelta > 0 ? `+${windDelta}%` : `${windDelta}%`}
                </strong>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                value={windDelta}
                onChange={(e) => setWindDelta(e.target.value)}
                style={{ width: '100%', accentColor: '#0284C7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>-50% (Calm)</span>
                <span>0% (Current)</span>
                <span>+100% (Blizzard Gale)</span>
              </div>
            </div>

            {/* Slider 2: Temperature */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--polar-navy)' }}>
                  <Thermometer size={14} color="#0284C7" /> Ambient Temperature Shift:
                </span>
                <strong style={{ color: tempDelta < 0 ? '#EF4444' : '#10B981' }}>
                  {tempDelta > 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}
                </strong>
              </div>
              <input
                type="range"
                min="-20"
                max="10"
                value={tempDelta}
                onChange={(e) => setTempDelta(e.target.value)}
                style={{ width: '100%', accentColor: '#0284C7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>-20°C (Deep Freeze)</span>
                <span>0°C (Current)</span>
                <span>+10°C (Melt Thaw)</span>
              </div>
            </div>

            {/* Slider 3: Barometric Pressure */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--polar-navy)' }}>
                  <Gauge size={14} color="#0284C7" /> Barometric Pressure Drop:
                </span>
                <strong style={{ color: pressureDelta < 0 ? '#EF4444' : '#10B981' }}>
                  {pressureDelta > 0 ? `+${pressureDelta} hPa` : `${pressureDelta} hPa`}
                </strong>
              </div>
              <input
                type="range"
                min="-30"
                max="10"
                value={pressureDelta}
                onChange={(e) => setPressureDelta(e.target.value)}
                style={{ width: '100%', accentColor: '#0284C7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>-30 hPa (Deep Cyclonic Depression)</span>
                <span>0 hPa</span>
                <span>+10 hPa</span>
              </div>
            </div>

            {/* Slider 4: Fuel Level */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--polar-navy)' }}>
                  <Fuel size={14} color="#F59E0B" /> Fuel Stock Perturbation:
                </span>
                <strong style={{ color: fuelDelta < 0 ? '#EF4444' : '#10B981' }}>
                  {fuelDelta > 0 ? `+${fuelDelta}%` : `${fuelDelta}%`}
                </strong>
              </div>
              <input
                type="range"
                min="-50"
                max="20"
                value={fuelDelta}
                onChange={(e) => setFuelDelta(e.target.value)}
                style={{ width: '100%', accentColor: '#F59E0B' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>-50% (Tanker Outage)</span>
                <span>0%</span>
                <span>+20% (Resupply Top-up)</span>
              </div>
            </div>

            {/* Slider 5: Energy Demand */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--polar-navy)' }}>
                  <Zap size={14} color="#F59E0B" /> Base Electrical Load Delta:
                </span>
                <strong style={{ color: demandDelta > 0 ? '#EF4444' : '#10B981' }}>
                  {demandDelta > 0 ? `+${demandDelta}%` : `${demandDelta}%`}
                </strong>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                value={demandDelta}
                onChange={(e) => setDemandDelta(e.target.value)}
                style={{ width: '100%', accentColor: '#F59E0B' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>-20% (Power Save)</span>
                <span>0%</span>
                <span>+50% (Emergency Trace Heat)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Advisory & Risk Shift Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--polar-ice)', textTransform: 'uppercase' }}>
              Twin Recalculation Summary
            </span>
            <h3 style={{ margin: '4px 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--polar-navy)' }}>
              Projected Risk Assessment
            </h3>

            {simResult ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '16px', background: 'var(--bg-ice-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CURRENT RISK</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                      {simResult.risk_level_current}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {int(simResult.risk_probability_current * 100)}% prob
                    </div>
                  </div>

                  <ArrowRight size={24} color="#94A3B8" />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SIMULATED RISK</div>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        color: simResult.risk_level_simulated === 'CRITICAL' ? '#EF4444' : (simResult.risk_level_simulated === 'MODERATE' ? '#F59E0B' : '#10B981'),
                        marginTop: '2px',
                      }}
                    >
                      {simResult.risk_level_simulated}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {int(simResult.risk_probability_simulated * 100)}% prob
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  {simResult.operator_advisory}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Sliders size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Adjust the sliders above and click <strong>Simulate State Change</strong> to project cross-domain impacts.
                </p>
              </div>
            )}
          </div>

          {simResult && simResult.emergent_alerts?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '8px' }}>
                Emergent Risk Alerts:
              </div>
              {simResult.emergent_alerts.map((al, idx) => (
                <div key={idx} style={{ fontSize: '11px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '6px 10px', borderRadius: '4px', marginBottom: '6px' }}>
                  <strong>{al.title}:</strong> {al.description}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      {simResult && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Current State vs Simulated State Delta
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Telemetry Metric</th>
                  <th>Current State</th>
                  <th>Simulated State</th>
                  <th>Calculated Delta</th>
                  <th>Subsystem Impact</th>
                </tr>
              </thead>
              <tbody>
                {simResult.metrics_comparison.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{m.metric_name}</strong>
                    </td>
                    <td>
                      <span className={`badge badge-${m.current_status.toLowerCase()}`}>
                        {m.current_value} {m.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${m.simulated_status.toLowerCase()}`}>
                        {m.simulated_value} {m.unit}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: m.delta_value !== 0 ? (m.metric_name.includes('Autonomy') && m.delta_value < 0 ? '#EF4444' : '#0284C7') : 'var(--text-muted)' }}>
                        {m.delta_value > 0 ? `+${m.delta_value}` : m.delta_value} {m.unit}
                      </strong>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {m.impact_description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function int(val) {
  return Math.round(val);
}

export default WhatIfSimulator;
