import React from 'react';
import { formatNumber } from '../../utils/format.js';

const STAGES = [
  { key: 'impressions', label: 'Impressions', color: 'var(--accent-blue)' },
  { key: 'clicks',      label: 'Clicks',      color: '#8b5cf6' },
  { key: 'visits',      label: 'Site Visits', color: 'var(--accent-orange)' },
  { key: 'carts',       label: 'Add to Cart', color: '#f59e0b' },
  { key: 'purchases',   label: 'Purchases',   color: 'var(--accent-green)' },
];

export default function ConversionFunnel({ funnel, conversionRates }) {
  if (!funnel) return null;
  const maxVal = funnel.impressions?.expected || 1;

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Conversion Funnel</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>From impressions to purchases — 3 scenario comparison</p>

      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const exp = funnel[stage.key]?.expected || 0;
          const low = funnel[stage.key]?.pessimistic || 0;
          const high = funnel[stage.key]?.optimistic || 0;
          const pct = Math.round((exp / maxVal) * 100);
          const prevExp = i > 0 ? (funnel[STAGES[i-1].key]?.expected || 1) : exp;
          const dropOff = i > 0 && prevExp > 0 ? Math.round((1 - exp / prevExp) * 100) : 0;

          return (
            <div key={stage.key}>
              {i > 0 && dropOff > 0 && (
                <div className="text-xs text-center py-0.5" style={{ color: 'var(--text-muted)' }}>
                  ↓ {dropOff}% drop-off
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-24 text-right">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{stage.label}</p>
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div
                      className="h-full rounded-lg flex items-center px-2"
                      style={{ width: `${Math.max(pct, 2)}%`, background: `${stage.color}33`, transition: 'width 0.8s ease', minWidth: 8 }}
                    />
                  </div>
                </div>
                <div className="text-right" style={{ minWidth: 80 }}>
                  <p className="font-mono text-xs font-bold" style={{ color: stage.color }}>{formatNumber(exp)}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                    {formatNumber(low)} — {formatNumber(high)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {conversionRates && (
        <div className="mt-4 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'CTR', value: `${conversionRates.ctr}%` },
            { label: 'Landing', value: `${conversionRates.landingRate}%` },
            { label: 'Cart Rate', value: `${conversionRates.cartRate}%` },
            { label: 'End-to-End', value: `${conversionRates.endToEnd}%` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <p className="font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
