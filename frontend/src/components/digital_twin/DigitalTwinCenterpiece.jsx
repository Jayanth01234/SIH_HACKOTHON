import React from 'react';
import {
  Wind,
  Zap,
  Building2,
  Anchor,
  Radio,
  ShieldAlert,
  ArrowRight,
  Activity,
} from 'lucide-react';

export const DigitalTwinCenterpiece = ({ twin, onSelectSubsystem }) => {
  if (!twin) return null;

  const env = twin.environment || {};
  const energy = twin.energy || {};
  const infra = twin.infrastructure || {};
  const logistics = twin.logistics || {};
  const hazards = twin.hazards || {};

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CRITICAL':
        return { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', glow: 'rgba(239, 68, 68, 0.4)' };
      case 'WARNING':
      case 'MODERATE':
        return { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', glow: 'rgba(245, 158, 11, 0.3)' };
      case 'NORMAL':
      default:
        return { bg: '#ECFDF5', border: '#10B981', text: '#065F46', glow: 'rgba(16, 185, 129, 0.25)' };
    }
  };

  const envColor = getStatusColor(hazards.hazard_level === 'CRITICAL' ? 'CRITICAL' : (hazards.hazard_level === 'MODERATE' ? 'WARNING' : 'NORMAL'));
  const infraColor = getStatusColor(infra.status);
  const energyColor = getStatusColor(energy.status);
  const logColor = getStatusColor(logistics.status);

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        color: '#F8FAFC',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        border: '1px solid #334155',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#38BDF8" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F1F5F9' }}>
            OPERATIONAL DIGITAL TWIN DEPENDENCY MODEL
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Overall Status:</span>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              background: twin.overall_status === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${twin.overall_status === 'CRITICAL' ? '#EF4444' : '#10B981'}`,
              color: twin.overall_status === 'CRITICAL' ? '#F87171' : '#34D399',
            }}
          >
            {twin.overall_status} (Health {twin.overall_health_score}%)
          </span>
        </div>
      </div>

      {/* Cross-Domain Interactive Node Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', position: 'relative', zIndex: 2 }}>
        {/* Node 1: Environment */}
        <div
          onClick={() => onSelectSubsystem && onSelectSubsystem('environmental')}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: `2px solid ${envColor.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: `0 0 16px ${envColor.glow}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={14} /> Environment
            </span>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: envColor.bg, color: envColor.text, fontWeight: 700 }}>
              {hazards.hazard_level || 'NORMAL'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
            {env.wind_speed} <span style={{ fontSize: '12px', fontWeight: 400, color: '#94A3B8' }}>m/s</span>
          </div>
          <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
            {env.temperature}°C &bull; {env.atmospheric_pressure} hPa ({env.trend_arrow})
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '6px' }}>
            Driving Event: {hazards.primary_driver ? hazards.primary_driver.slice(0, 36) + '...' : 'Nominal katabatic flow'}
          </div>
        </div>

        {/* Node 2: Infrastructure */}
        <div
          onClick={() => onSelectSubsystem && onSelectSubsystem('infrastructure')}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: `2px solid ${infraColor.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: `0 0 16px ${infraColor.glow}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#A855F7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} /> Infrastructure
            </span>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: infraColor.bg, color: infraColor.text, fontWeight: 700 }}>
              {infra.status || 'NORMAL'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
            {infra.overall_health}% <span style={{ fontSize: '12px', fontWeight: 400, color: '#94A3B8' }}>health</span>
          </div>
          <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
            6 Subsystems &bull; SatCom locked
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '6px' }}>
            Lake Intake Trace: {env.temperature < -15 ? 'Active Heavy' : 'Nominal Cycle'}
          </div>
        </div>

        {/* Node 3: Energy Microgrid */}
        <div
          onClick={() => onSelectSubsystem && onSelectSubsystem('energy')}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: `2px solid ${energyColor.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: `0 0 16px ${energyColor.glow}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Microgrid
            </span>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: energyColor.bg, color: energyColor.text, fontWeight: 700 }}>
              {energy.status || 'NORMAL'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
            {energy.consumption_kw} <span style={{ fontSize: '12px', fontWeight: 400, color: '#94A3B8' }}>kW</span>
          </div>
          <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
            Gen: {energy.generation_kw} kW &bull; BESS: {energy.battery_soc_pct}%
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '6px' }}>
            Burn: {energy.hourly_burn_liters} L/h &bull; Autonomy: {energy.autonomy_days} d
          </div>
        </div>

        {/* Node 4: Logistics & Fuel */}
        <div
          onClick={() => onSelectSubsystem && onSelectSubsystem('logistics')}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: `2px solid ${logColor.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: `0 0 16px ${logColor.glow}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Anchor size={14} /> Logistics
            </span>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: logColor.bg, color: logColor.text, fontWeight: 700 }}>
              {logistics.status || 'NORMAL'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
            {logistics.fuel_days} <span style={{ fontSize: '12px', fontWeight: 400, color: '#94A3B8' }}>days fuel</span>
          </div>
          <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
            Rations: {logistics.rations_days} d &bull; Spares: {logistics.spares_health}%
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '6px' }}>
            Resupply Window: {logistics.resupply_window_days} days (MV Golovnin)
          </div>
        </div>
      </div>

      {/* Causal Impact Chain Bar */}
      <div
        style={{
          marginTop: '16px',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid #475569',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>Causal Flow:</span>
          <span style={{ color: '#E2E8F0' }}>Wind / Frontal Drop</span>
          <ArrowRight size={13} color="#94A3B8" />
          <span style={{ color: '#E2E8F0' }}>Heating Load ({energy.consumption_kw} kW)</span>
          <ArrowRight size={13} color="#94A3B8" />
          <span style={{ color: '#E2E8F0' }}>Fuel Burn ({energy.hourly_burn_liters} L/h)</span>
          <ArrowRight size={13} color="#94A3B8" />
          <span style={{ color: '#E2E8F0' }}>Autonomy ({energy.autonomy_days} Days)</span>
        </div>
        <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600 }}>
          Interactive Twin Active &bull; Click card to drill down
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinCenterpiece;
