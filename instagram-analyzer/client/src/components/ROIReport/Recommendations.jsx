import React from 'react';

export default function Recommendations({ recommendations = [] }) {
  if (!recommendations.length) return null;
  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div>
        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Actionable Recommendations</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Steps to maximize campaign ROI</p>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <div key={i} className="rounded-xl p-3.5 space-y-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-2.5">
              <span className="text-xs font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--accent-orange)', color: '#fff' }}>{i+1}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{rec.action}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{rec.reason}</p>
                {rec.impact && (
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent-green)' }}>Impact: {rec.impact}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
