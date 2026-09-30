import React from 'react';
import {
  MapPin,
  Radio,
  Wind,
  Thermometer,
  ShieldAlert,
  Zap,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useStation } from '../context/StationContext';

export const AntarcticMapTwin = () => {
  const { selectedStation, setSelectedStation, setCurrentPage, digitalTwinState } = useStation();

  const stations = [
    {
      id: 'Maitri',
      name: 'Maitri Research Station',
      lat: '70°45\'57" S',
      lon: '11°44\'09" E',
      region: 'Schirmacher Oasis, Queen Maud Land',
      elevation: '117m',
      commissioned: 1989,
      // Map SVG Coordinates on polar projection
      cx: 340,
      cy: 210,
      color: '#0284C7',
    },
    {
      id: 'Bharati',
      name: 'Bharati Research Station',
      lat: '69°24\'28" S',
      lon: '76°11\'14" E',
      region: 'Larsemann Hills, Princess Elizabeth Land',
      elevation: '35m',
      commissioned: 2012,
      // Map SVG Coordinates on polar projection
      cx: 560,
      cy: 280,
      color: '#10B981',
    },
  ];

  const handleSelectStation = (id) => {
    setSelectedStation(id);
    setCurrentPage('dashboard');
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
            <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--polar-ice)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Geospatial Operations Twin
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', color: '#F8FAFC' }}>
            Indian Antarctic Research Stations Map
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', maxWidth: '750px' }}>
            Polar Azimuthal projection of the Antarctic continent displaying India's operational scientific outposts Maitri and Bharati. Click any station node to open its live Digital Twin.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={22} color="#38BDF8" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>South Polar Grid</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Antarctic Continent Map SVG */}
        <div
          className="card"
          style={{
            background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
            border: '1px solid #334155',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '440px',
          }}
        >
          <svg viewBox="0 0 800 600" style={{ width: '100%', height: '100%' }}>
            {/* Latitude Range Rings */}
            <circle cx="400" cy="350" r="280" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="400" cy="350" r="200" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="400" cy="350" r="110" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="400" cy="350" r="15" fill="#475569" opacity="0.6" />
            <text x="400" y="345" fill="#94A3B8" fontSize="10" textAnchor="middle" fontWeight="600">SOUTH POLE 90°S</text>

            {/* Approximate Stylized Antarctic Continent Coastline */}
            <path
              d="M 280,180
                 C 320,160 420,165 470,190
                 C 530,220 620,240 650,300
                 C 670,350 630,420 590,460
                 C 540,510 470,540 400,530
                 C 330,520 280,480 240,430
                 C 190,370 170,300 200,240
                 C 220,200 250,190 280,180 Z"
              fill="rgba(56, 189, 248, 0.08)"
              stroke="#38BDF8"
              strokeWidth="2"
              opacity="0.85"
            />

            {/* Ice Shelf outlines */}
            <path
              d="M 240,430 C 270,410 320,420 360,450 C 370,480 340,510 300,500 Z"
              fill="rgba(148, 163, 184, 0.05)"
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Indian Ocean & Southern Ocean Labels */}
            <text x="560" y="140" fill="#64748B" fontSize="11" fontWeight="700" letterSpacing="0.08em">INDIAN OCEAN SECTOR</text>
            <text x="180" y="140" fill="#64748B" fontSize="11" fontWeight="700" letterSpacing="0.08em">ATLANTIC SECTOR</text>

            {/* Station 1: Maitri */}
            <g
              onClick={() => handleSelectStation('Maitri')}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse circle */}
              <circle cx="340" cy="210" r="18" fill="none" stroke="#0284C7" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="12;28;12" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="340" cy="210" r="8" fill="#0284C7" />
              <circle cx="340" cy="210" r="4" fill="#FFFFFF" />

              {/* Station Label */}
              <rect x="270" y="224" width="140" height="34" rx="4" fill="#0F172A" stroke="#0284C7" strokeWidth="1" />
              <text x="340" y="238" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">MAITRI STATION</text>
              <text x="340" y="250" fill="#94A3B8" fontSize="9" textAnchor="middle">70°45' S, 11°44' E</text>
            </g>

            {/* Station 2: Bharati */}
            <g
              onClick={() => handleSelectStation('Bharati')}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse circle */}
              <circle cx="560" cy="280" r="18" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="12;28;12" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="560" cy="280" r="8" fill="#10B981" />
              <circle cx="560" cy="280" r="4" fill="#FFFFFF" />

              {/* Station Label */}
              <rect x="490" y="294" width="140" height="34" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
              <text x="560" y="308" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">BHARATI STATION</text>
              <text x="560" y="320" fill="#94A3B8" fontSize="9" textAnchor="middle">69°24' S, 76°11' E</text>
            </g>
          </svg>
        </div>

        {/* Station Cards Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stations.map((st) => {
            const isSelected = selectedStation === st.id;
            return (
              <div
                key={st.id}
                className="card"
                onClick={() => setSelectedStation(st.id)}
                style={{
                  borderLeft: `4px solid ${st.color}`,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-ice-subtle)' : '#FFFFFF',
                  borderColor: isSelected ? st.color : 'var(--border-color)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: st.color, textTransform: 'uppercase' }}>
                      {st.id} Research Outpost
                    </span>
                    <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 800, color: 'var(--polar-navy)' }}>
                      {st.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {st.region}
                    </div>
                  </div>
                  <span className="badge badge-normal" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px', fontSize: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Latitude</div>
                    <div style={{ fontWeight: 700, color: 'var(--polar-navy)' }}>{st.lat}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Longitude</div>
                    <div style={{ fontWeight: 700, color: 'var(--polar-navy)' }}>{st.lon}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Commissioned</div>
                    <div style={{ fontWeight: 700, color: 'var(--polar-navy)' }}>{st.commissioned}</div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Elevation: {st.elevation} &bull; AWS Active
                  </span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStation(st.id);
                    }}
                    style={{ background: st.color, borderColor: st.color }}
                  >
                    <span>Open Digital Twin</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AntarcticMapTwin;
