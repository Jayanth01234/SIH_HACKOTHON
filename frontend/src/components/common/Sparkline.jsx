import React from 'react';

export const Sparkline = ({ data = [], color = '#0284C7', height = 36, width = 110 }) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height, background: '#F1F5F9', borderRadius: 4 }} />;
  }

  const validData = data.filter((d) => typeof d === 'number' && !isNaN(d));
  if (validData.length < 2) {
    return <div style={{ width, height, background: '#F1F5F9', borderRadius: 4 }} />;
  }

  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const range = max - min || 1;
  const padding = 3;

  const points = validData.map((val, idx) => {
    const x = padding + (idx / (validData.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathStr = `M ${points.join(' L ')}`;
  const areaStr = `${pathStr} L ${(width - padding).toFixed(1)},${(height - padding).toFixed(1)} L ${padding},${(height - padding).toFixed(1)} Z`;
  const gradId = `grad-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaStr} fill={`url(#${gradId})`} />
      <path d={pathStr} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Sparkline;
