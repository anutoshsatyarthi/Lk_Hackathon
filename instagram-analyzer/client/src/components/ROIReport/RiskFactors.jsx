import React from 'react';

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#dc2626', bg: '#dc262618', label: 'CRITICAL' },
  HIGH:     { color: '#d97706', bg: '#d9770618', label: 'HIGH' },
  MEDIUM:   { color: '#ca8a04', bg: '#ca8a0418', label: 'MEDIUM' },
  LOW:      { color: 'var(--text-muted)', bg: 'var(--bg-elevated)', label: 'LOW' },
};

export default function RiskFactors({ risks = [] }) {
  if (!risks.length) return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Risk Assessment</h3>
      <p className="text-sm text-center py-4" style={{ color: 'var(--accent-green)' }}>✓ No significant risk factors identified</p>
    </div>
  );

  const hasCritical = risks.some(r => r.severity === 'CRITICAL');

  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div>
        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Risk Assessment</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{risks.length} risk factor{risks.length > 1 ? 's' : ''} identified</p>
      </div>

      {hasCritical && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: '#dc262618', border: '1px solid #dc262644' }}>
          <span>🚫</span>
          <p className="text-xs font-medium" style={{ color: '#dc2626' }}>Critical risks detected — address before proceeding with this campaign</p>
        </div>
      )}

      <div className="space-y-2">
        {risks.map((risk, i) => {
          const cfg = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.LOW;
          return (
            <div key={i} className="rounded-xl p-3 space-y-1.5" style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${cfg.color}22`, color: cfg.color }}>{cfg.label}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{risk.factor}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{risk.detail}</p>
              <div className="flex items-start gap-1.5 pt-1" style={{ borderTop: `1px solid ${cfg.color}22` }}>
                <span className="text-xs" style={{ color: cfg.color, flexShrink: 0 }}>→</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-secondary)' }}>Mitigation:</strong> {risk.mitigation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
