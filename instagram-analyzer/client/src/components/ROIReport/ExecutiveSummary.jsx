import React from 'react';
import { formatINR } from '../../utils/format.js';

const VERDICT_CONFIG = {
  'STRONG GO': { bg: '#16a34a', label: 'STRONG GO', icon: '🚀' },
  'GO':         { bg: '#0d9488', label: 'GO',         icon: '✅' },
  'CONDITIONAL':{ bg: '#d97706', label: 'CONDITIONAL', icon: '⚠️' },
  'NO-GO':      { bg: '#dc2626', label: 'NO-GO',       icon: '🚫' },
};

function CircleGauge({ score, size = 120, grade }) {
  const pct = Math.round(score * 100);
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct > 75 ? '#16a34a' : pct > 55 ? '#d97706' : '#dc2626';
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="8" stroke="rgba(255,255,255,0.1)" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="8" stroke={color}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="font-mono font-bold leading-none" style={{ fontSize: size * 0.22, color }}>{pct}</p>
        <p className="font-bold leading-none mt-0.5" style={{ fontSize: size * 0.14, color: 'var(--text-muted)' }}>{grade}</p>
      </div>
    </div>
  );
}

export default function ExecutiveSummary({ summary }) {
  const cfg = VERDICT_CONFIG[summary.recommendation] || VERDICT_CONFIG['CONDITIONAL'];
  const hasCriticalRisk = summary.recommendation === 'NO-GO';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${cfg.bg}33`, background: 'var(--bg-card)' }}>
      {/* Verdict banner */}
      <div className="px-6 py-4 flex items-center gap-3" style={{ background: `${cfg.bg}18` }}>
        <span style={{ fontSize: '1.5rem' }}>{cfg.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg" style={{ color: cfg.bg }}>{cfg.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${cfg.bg}22`, color: cfg.bg }}>
              {summary.confidenceLevel} confidence
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{summary.recommendationReason}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <CircleGauge score={summary.compositeScore} grade={summary.compositeGrade} />

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-0">
            {[
              { label: 'Expected ROI', value: `${summary.expectedROI > 0 ? '+' : ''}${summary.expectedROI}%`, color: summary.expectedROI > 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
              { label: 'Expected ROAS', value: `${summary.expectedROAS}x`, color: 'var(--accent-blue)' },
              { label: 'Est. Purchases', value: (summary.expectedPurchases || 0).toLocaleString('en-IN'), color: 'var(--accent-orange)' },
              { label: 'Est. Revenue', value: formatINR(summary.expectedRevenue || 0), color: 'var(--accent-green)' },
              { label: 'Composite Score', value: `${Math.round(summary.compositeScore * 100)}/100`, color: 'var(--text-primary)' },
              { label: 'Grade', value: summary.compositeGrade, color: summary.compositeGrade?.startsWith('A') ? 'var(--accent-green)' : 'var(--accent-orange)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-mono font-bold text-base" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
