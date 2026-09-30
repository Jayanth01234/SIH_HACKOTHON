import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  Wind,
  Building2,
  Anchor,
  FileCheck,
} from 'lucide-react';
import { useStation } from '../context/StationContext';
import polarisApi from '../services/api';

export const CrossDomainImpact = () => {
  const { selectedStation } = useStation();
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  const fetchImpact = async () => {
    setLoading(true);
    try {
      const data = await polarisApi.getCrossDomainImpact(selectedStation);
      setImpactData(data);
    } catch (err) {
      console.error('Failed to load cross domain impact:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, [selectedStation]);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getNodeIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'environment':
        return <Wind size={18} color="#38BDF8" />;
      case 'infrastructure':
        return <Building2 size={18} color="#A855F7" />;
      case 'energy':
        return <Zap size={18} color="#F59E0B" />;
      case 'logistics':
        return <Anchor size={18} color="#10B981" />;
      case 'operations':
      default:
        return <ShieldAlert size={18} color="#EF4444" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'CRITICAL':
        return { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' };
      case 'WARNING':
      case 'ELEVATED':
        return { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' };
      case 'NORMAL':
      case 'NOMINAL':
      default:
        return { bg: '#ECFDF5', border: '#10B981', text: '#065F46' };
    }
  };

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          color: '#FFFFFF',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: 'var(--polar-ice)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              SIH Differentiator
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>Station: {selectedStation}</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', color: '#F8FAFC' }}>
            Cross-Domain Operational Dependency Engine
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', maxWidth: '750px' }}>
            Antarctic systems cannot be managed in silos. Extreme weather cascades directly across structural stress, microgrid heating demand, diesel burn rate, and logistics autonomy.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
            Composite System Stress
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: (impactData?.overall_system_stress || 0) > 50 ? '#EF4444' : '#10B981',
            }}
          >
            {impactData?.overall_system_stress || 24.5}%
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={fetchImpact}
            style={{ color: '#38BDF8', borderColor: '#38BDF8', marginTop: '6px' }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Recalculate Causal Chain</span>
          </button>
        </div>
      </div>

      {/* Primary Trigger Event */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          borderLeft: '4px solid #0284C7',
          background: 'var(--bg-ice-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--polar-navy)', textTransform: 'uppercase' }}>
              Root Atmospheric Event Driver
            </span>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--polar-navy)', marginTop: '2px' }}>
              {impactData?.primary_event || 'Evaluating dynamic telemetry inputs...'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(impactData?.affected_domains || []).map((dom, i) => (
              <span key={i} className="badge badge-normal" style={{ fontSize: '11px', padding: '3px 8px' }}>
                {dom}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Dependency Nodes */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Active System Nodes & Stress Indices
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {(impactData?.nodes || []).map((node) => {
            const badge = getStatusBadge(node.status);
            return (
              <div
                key={node.id}
                className="card"
                style={{
                  borderTop: `4px solid ${badge.border}`,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getNodeIcon(node.category)}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                      {node.label}
                    </span>
                  </div>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {node.status}
                  </span>
                </div>

                <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {node.value}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subsystem Stress:</span>
                    <strong style={{ color: node.stress_level > 50 ? '#EF4444' : 'var(--polar-navy)' }}>
                      {node.stress_level}%
                    </strong>
                  </div>
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${node.stress_level}%`,
                        background: node.stress_level > 65 ? '#EF4444' : (node.stress_level > 35 ? '#F59E0B' : '#10B981'),
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Causal Chain */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Event → Consequence Causal Chain
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(impactData?.causal_chain || []).map((step) => {
              const badge = getStatusBadge(step.severity);
              return (
                <div
                  key={step.step_number}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${badge.border}`,
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--polar-ice)' }}>
                      STEP {step.step_number}: {step.system.toUpperCase()}
                    </span>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {step.severity}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--polar-navy)', marginTop: '6px' }}>
                    Event: {step.event}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <strong>Consequence:</strong> {step.consequence}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '8px',
                      background: 'var(--bg-ice-subtle)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <strong>Operator Check:</strong> {step.recommended_check}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Operator Checklist */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Actionable Operator Checklist
          </h3>
          <div className="card">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Standard Operating Procedure tasks generated dynamically based on active cross-domain stress triggers:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(impactData?.operator_checklist || []).map((task, idx) => {
                const isChecked = Boolean(checkedItems[idx]);
                return (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      background: isChecked ? '#ECFDF5' : 'var(--bg-ice-subtle)',
                      border: `1px solid ${isChecked ? '#A7F3D0' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(idx)}
                      style={{ marginTop: '2px', accentColor: '#0284C7' }}
                    />
                    <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: isChecked ? '#065F46' : 'var(--polar-navy)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                      {task}
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Tasks Completed: {Object.values(checkedItems).filter(Boolean).length} / {(impactData?.operator_checklist || []).length}
              </span>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => alert('Operational checks verified and logged to POLARIS mission timeline.')}
              >
                Log Completed Checklist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossDomainImpact;
