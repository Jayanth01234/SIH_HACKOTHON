import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  MapPin,
  RefreshCw,
  Wind,
  Zap,
  Building2,
  Anchor,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import polarisApi from '../services/api';

export const StationComparison = () => {
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const data = await polarisApi.compareStations();
      setCompData(data);
    } catch (err) {
      console.error('Failed to load station comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const maitri = compData?.stations?.Maitri;
  const bharati = compData?.stations?.Bharati;
  const summary = compData?.comparison_summary || [];

  return (
    <div className="page-container">
      {/* Banner */}
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
            <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--polar-ice)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Strategic Multi-Station Analysis
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', color: '#F8FAFC' }}>
            Station Comparison: Maitri vs Bharati
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', maxWidth: '750px' }}>
            Direct operational contrast between India's 2nd research station (Maitri, 1989, Queen Maud Land) and 3rd station (Bharati, 2012, Larsemann Hills).
          </p>
        </div>

        <button
          className="btn btn-sm btn-outline"
          onClick={fetchComparison}
          style={{ color: '#38BDF8', borderColor: '#38BDF8' }}
        >
          <RefreshCw size={12} className={loading ? 'spin' : ''} />
          <span>Sync Twin States</span>
        </button>
      </div>

      {/* Side-by-Side Station Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Maitri Card */}
        <div className="card" style={{ borderTop: '4px solid #0284C7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--polar-ice)', textTransform: 'uppercase' }}>
                Indian Antarctic Station #2
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--polar-navy)' }}>
                Maitri Research Station
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                70°45'57" S, 11°44'09" E &bull; Schirmacher Oasis (Inland)
              </div>
            </div>
            <span className={`badge badge-${maitri?.overall_status?.toLowerCase() || 'normal'}`}>
              {maitri?.overall_status || 'NORMAL'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ambient Temperature</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {maitri?.environment?.temperature}&deg;C
              </div>
            </div>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wind Velocity</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {maitri?.environment?.wind_speed} m/s
              </div>
            </div>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Microgrid Demand</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {maitri?.energy?.consumption_kw} kW
              </div>
            </div>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fuel Autonomy</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {maitri?.energy?.autonomy_days} Days
              </div>
            </div>
          </div>
        </div>

        {/* Bharati Card */}
        <div className="card" style={{ borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
                Indian Antarctic Station #3
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--polar-navy)' }}>
                Bharati Research Station
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                69°24'28" S, 76°11'14" E &bull; Larsemann Hills (Coastal)
              </div>
            </div>
            <span className={`badge badge-${bharati?.overall_status?.toLowerCase() || 'normal'}`}>
              {bharati?.overall_status || 'NORMAL'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ambient Temperature</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {bharati?.environment?.temperature}&deg;C
              </div>
            </div>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wind Velocity</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {bharati?.environment?.wind_speed} m/s
              </div>
            </div>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Microgrid Demand</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {bharati?.energy?.consumption_kw} kW
              </div>
            </div>
            <div style={{ background: 'var(--bg-ice-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fuel Autonomy</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--polar-navy)' }}>
                {bharati?.energy?.autonomy_days} Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Comparison Table */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Side-by-Side Subsystem Telemetry Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Operational Metric</th>
                <th>Maitri Station</th>
                <th>Bharati Station</th>
                <th>Difference / Delta</th>
                <th>Meteorological & Operational Rationale</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{item.metric}</strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--polar-navy)' }}>
                      {item.maitri} {item.unit !== 'Level' && item.unit}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--polar-navy)' }}>
                      {item.bharati} {item.unit !== 'Level' && item.unit}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: item.delta !== 0 ? '#0284C7' : 'var(--text-muted)' }}>
                      {item.delta > 0 ? `+${item.delta}` : item.delta} {item.unit !== 'Level' && item.unit}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {item.interpretation}
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

export default StationComparison;
