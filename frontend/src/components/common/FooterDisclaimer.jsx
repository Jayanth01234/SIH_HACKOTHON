import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export const FooterDisclaimer = () => {
  return (
    <footer className="footer-disclaimer">
      <div className="footer-disclaimer-left">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                width: '16px',
                height: '11px',
                borderRadius: '1px',
                overflow: 'hidden',
                border: '1px solid #CBD5E1',
                flexDirection: 'column',
              }}
            >
              <span style={{ flex: 1, backgroundColor: '#FF9933' }}></span>
              <span style={{ flex: 1, backgroundColor: '#FFFFFF' }}></span>
              <span style={{ flex: 1, backgroundColor: '#138808' }}></span>
            </span>
            <strong style={{ color: 'var(--polar-navy)', fontSize: '12px' }}>
              National Centre for Polar and Ocean Research (NCPOR)
            </strong>
            <span style={{ color: 'var(--text-muted)' }}>• Ministry of Earth Sciences, Govt. of India</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Observational Source: <strong>National Polar Data Center (NPDC)</strong> AWS Telemetry Archive (Historical January 2015 observations).
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
          <Database size={14} style={{ color: 'var(--polar-ice)' }} />
          <span>Historical Scientific Telemetry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
          <ShieldCheck size={14} />
          <span>Schema Validated</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          POLARIS Digital Twin v1.0
        </div>
      </div>
    </footer>
  );
};

export default FooterDisclaimer;
