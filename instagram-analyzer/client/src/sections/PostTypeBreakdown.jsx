import React from 'react';
import { formatNumber } from '../utils/format.js';

const TYPE_COLORS = {
  REEL: 'var(--accent-orange)',
  IMAGE: 'var(--accent-blue)',
  CAROUSEL_ALBUM: 'var(--accent-purple)',
  COLLAB: 'var(--accent-green)',
};

function DonutChart({ data, centerTotal, size = 160 }) {
  const sampleTotal = data.reduce((s, d) => s + d.count, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const innerR = size * 0.24;
  const strokeWidth = r - innerR;

  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = sampleTotal > 0 ? d.count / sampleTotal : 0;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, pct };
  });

  const displayTotal = centerTotal || sampleTotal;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => (
        <path
          key={i}
          d={seg.path}
          fill="none"
          stroke={TYPE_COLORS[seg.type] || 'var(--text-muted)'}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize={size * 0.14} fontFamily="JetBrains Mono, monospace" fontWeight="500">
        {formatNumber(displayTotal)}
      </text>
      <text x={cx} y={cy + size * 0.1} textAnchor="middle" fill="var(--text-muted)" fontSize={size * 0.075}>
        total posts
      </text>
    </svg>
  );
}

export default function PostTypeBreakdown({ postTypes = [], totalMediaCount }) {
  const sampleTotal = postTypes.reduce((s, d) => s + d.count, 0);
  const total = totalMediaCount || sampleTotal;

  // Scale each type's count from sample percentages to the real total
  const scaled = postTypes.map((t) => ({
    ...t,
    scaledCount: Math.round((t.percentage / 100) * total),
  }));

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Post Type Breakdown
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <DonutChart data={postTypes} centerTotal={total} size={160} />
        <div className="flex flex-col gap-3 flex-1 w-full">
          {scaled.map((t) => (
            <div key={t.type}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[t.type] || 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{formatNumber(t.scaledCount)}</span>
                  <span className="font-mono text-xs w-12 text-right" style={{ color: 'var(--text-muted)' }}>{t.percentage}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${t.percentage}%`, background: TYPE_COLORS[t.type] || 'var(--text-muted)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
