import React from 'react';
import {
  Anchor,
  Plane,
  Fuel,
  Package,
  Truck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useStation } from '../context/StationContext';

const INVENTORY_DATA = [
  { item: 'Arctic Grade Low-Sulfur Diesel (Jet A-1)', category: 'Fuel & Energy', current: '84,200 L', capacity: '120,000 L', burn: '1,074 L/day', autonomy: '78 Days', status: 'Nominal' },
  { item: 'Long-life Dry & Freeze-dried Provisions', category: 'Food & Rations', current: '14,200 kg', capacity: '18,000 kg', burn: '95 kg/day', autonomy: '142 Days', status: 'Nominal' },
  { item: 'Cold-climate Medical Trauma & Plasma Kits', category: 'Medical Supplies', current: '98% Stocked', capacity: '100%', burn: 'Variable', autonomy: '365 Days', status: 'Nominal' },
  { item: 'Cummins DG-01/02 Filters & Injector Spares', category: 'Critical Spares', current: '24 Sets', capacity: '26 Sets', burn: 'Scheduled', autonomy: '300 Days', status: 'Nominal' },
  { item: 'PistenBully Snowcat Hydraulic Fluid & Belts', category: 'Vehicle Spares', current: '18 Barrels', capacity: '20 Barrels', burn: '1 Bbl/month', autonomy: '240 Days', status: 'Nominal' },
  { item: 'Retrograde Waste Drums (Madrid Protocol)', category: 'Environmental Waste', current: '62 Drums', capacity: '80 Drums', burn: 'Ready for loading', autonomy: 'Return Ship', status: 'Ready' },
];

export const LogisticsSupply = () => {
  const { selectedStation } = useStation();

  return (
    <div className="page-container">
      {/* 5 Primary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Fuel Reserves</span>
            <div className="kpi-icon-badge">
              <Fuel size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">84,200</span>
            <span className="kpi-unit">Liters</span>
          </div>
          <div className="kpi-meta-row">
            <span>Burn: 1,074 L / day</span>
            <span>Capacity: 72%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Food Provisions</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">142</span>
            <span className="kpi-unit">Days</span>
          </div>
          <div className="kpi-meta-row">
            <span>Rations: Fully Stocked</span>
            <span>Freeze-dried: 14.2 t</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Medical Supply</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#ECFEFF', color: '#0891B2' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">98</span>
            <span className="kpi-unit">%</span>
          </div>
          <div className="kpi-meta-row">
            <span>Surgical Bay: Equipped</span>
            <span>Emergency O₂: 100%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Critical Spares</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Truck size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">94</span>
            <span className="kpi-unit">%</span>
          </div>
          <div className="kpi-meta-row">
            <span>DG Genset Spares: Full</span>
            <span>Snowcat Track: 4 kits</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Next Vessel Arrival</span>
            <div className="kpi-icon-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Anchor size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">14</span>
            <span className="kpi-unit">Days</span>
          </div>
          <div className="kpi-meta-row">
            <span>MV Vasiliy Golovnin</span>
            <span>Prydz Bay / Astrid</span>
          </div>
        </div>
      </div>

      {/* Maritime & Intercontinental Air Routes Overview */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Anchor size={16} style={{ color: 'var(--polar-ice)' }} />
            <span>NCPOR Antarctic Logistics Corridors & Expedition Supply Chain</span>
          </div>
          <span className="badge badge-normal">Corridors Active</span>
        </div>

        <div className="card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '20px',
                border: '1px solid var(--polar-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--polar-navy)', fontWeight: 700 }}>
                <Anchor size={18} style={{ color: 'var(--polar-ice)' }} />
                <span>Maritime Icebreaker Corridor</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Primary heavy resupply, fuel tankers & container shipments
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>Port of Mormugao (Goa, India)</span>
                  <ArrowRight size={14} style={{ color: 'var(--polar-ice)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>NCPOR HQ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>Cape Town Stopover (South Africa)</span>
                  <ArrowRight size={14} style={{ color: 'var(--polar-ice)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Bunkering</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>{selectedStation} Station Offloading</span>
                  <span className="badge badge-info">Ice Shelf Fast-ice</span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid var(--polar-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--polar-navy)', fontWeight: 700 }}>
                <Plane size={18} style={{ color: '#0891B2' }} />
                <span>DROMLAN Intercontinental Air Bridge</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Personnel rotation & high-priority scientific samples
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>Cape Town International</span>
                  <ArrowRight size={14} style={{ color: '#0891B2' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Il-76 Heavy Transport</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>Troll / Novolazarevskaya Blue Ice</span>
                  <ArrowRight size={14} style={{ color: '#0891B2' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Basler BT-67 Ski</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>{selectedStation} Station Skiway</span>
                  <span className="badge badge-normal">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Package size={16} style={{ color: 'var(--polar-ice)' }} />
              <span>Consolidated Station Inventory & Environmental Retrograde</span>
            </div>
            <div className="card-subtitle">
              Strict compliance with the Antarctic Treaty Madrid Protocol on Environmental Protection
            </div>
          </div>
          <span className="badge badge-normal">100% Waste Zero-Release</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Commodity / Asset</th>
                <th>Category</th>
                <th>On-Station Quantity</th>
                <th>Station Capacity</th>
                <th>Daily Consumption</th>
                <th>Autonomy Margin</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY_DATA.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.item}</td>
                  <td>
                    <span className="badge badge-info">{row.category}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.current}</td>
                  <td>{row.capacity}</td>
                  <td>{row.burn}</td>
                  <td style={{ fontWeight: 600, color: 'var(--polar-ice)' }}>{row.autonomy}</td>
                  <td>
                    <span className="badge badge-normal">{row.status}</span>
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

export default LogisticsSupply;
