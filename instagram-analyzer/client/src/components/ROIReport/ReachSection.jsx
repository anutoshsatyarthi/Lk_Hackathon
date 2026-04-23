import React from 'react';
import { formatNumber, formatINR } from '../../utils/format.js';

export default function ReachSection({ reach }) {
  if (!reach) return null;
  const { uniqueReach, confidenceInterval, reachBreakdown, benchmarkComparison } = reach;
  const posts = Object.entries(reachBreakdown || {});
  const maxReach = Math.max(...posts.map(([,v]) => v), 1);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Reach Prediction</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Estimated unique people who will see the sponsored content</p>

      {/* Big number */}
      <div className="text-center mb-4">
        <p className="font-mono font-bold" style={{ fontSize: '2.5rem', color: 'var(--accent-blue)', lineHeight: 1 }}>{formatNumber(uniqueReach)}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>unique impressions</p>
      </div>

      {/* Confidence interval */}
      {confidenceInterval && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Confidence Range</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{formatNumber(confidenceInterval.low)}</span>
            <div className="flex-1 relative h-4">
              <div className="absolute inset-y-0 rounded-full" style={{ background: 'var(--bg-primary)', left: 0, right: 0 }} />
              {/* Range bar */}
              <div className="absolute inset-y-1 rounded-full" style={{
                background: 'linear-gradient(90deg, var(--accent-blue)44, var(--accent-blue))',
                left: '10%', right: '10%',
              }} />
              {/* Expected marker */}
              <div className="absolute top-0 bottom-0 w-0.5 rounded" style={{ background: 'var(--accent-orange)', left: '50%' }} />
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{formatNumber(confidenceInterval.high)}</span>
          </div>
          <p className="text-xs text-center mt-1.5" style={{ color: 'var(--accent-orange)' }}>Expected: {formatNumber(confidenceInterval.expected)}</p>
        </div>
      )}

      {/* Per-post breakdown */}
      {posts.length > 0 && (
        <div>
          <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Per-post reach (diminishing returns)</p>
          <div className="space-y-2">
            {posts.map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-12" style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace('post', 'Post ')}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(val/maxReach)*100}%`, background: 'var(--accent-blue)', transition: 'width 0.8s ease' }} />
                </div>
                <span className="text-xs font-mono w-16 text-right" style={{ color: 'var(--accent-blue)' }}>{formatNumber(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {benchmarkComparison && (
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>{benchmarkComparison.decayApplied}</p>
      )}
    </div>
  );
}
