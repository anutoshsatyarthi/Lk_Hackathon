import React from 'react';
import { formatINR, formatINRExact } from '../../utils/format.js';

const SCENARIOS = [
  { key: 'pessimistic', label: 'Pessimistic', color: '#dc2626', icon: '📉', desc: '25th percentile' },
  { key: 'expected',    label: 'Expected',    color: 'var(--accent-orange)', icon: '📊', desc: '50th percentile', featured: true },
  { key: 'optimistic',  label: 'Optimistic',  color: 'var(--accent-green)',  icon: '📈', desc: '75th percentile' },
];

export default function ScenarioCards({ conversion }) {
  if (!conversion) return null;
  const { funnel, revenue, profit, roi, roas, cac, breakEvenPurchases, cpm, totalCost } = conversion;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Scenario Analysis</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Financial outcomes under three market conditions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SCENARIOS.map(({ key, label, color, icon, desc, featured }) => (
          <div
            key={key}
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: featured ? `${color}0f` : 'var(--bg-card)',
              border: `${featured ? 2 : 1}px solid ${featured ? color : 'var(--border)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <p className="font-semibold text-sm mt-0.5" style={{ color }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg" style={{ color: roas[key] >= 1 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {roas[key]}x
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ROAS</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { label: 'Purchases', value: (funnel?.purchases?.[key] || 0).toLocaleString('en-IN') },
                { label: 'Revenue', value: formatINR(revenue[key] || 0) },
                { label: 'Net Profit', value: formatINR(profit[key] || 0), color: profit[key] >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
                { label: 'CAC', value: formatINR(Math.min(cac[key] || 0, 99999)) },
              ].map(({ label, value, color: vc }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="text-xs font-mono font-medium" style={{ color: vc || 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Financial summary table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Financial Summary</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {[
            { label: 'Total Campaign Cost', value: formatINRExact(totalCost || 0) },
            { label: 'CPM (Cost per 1,000 Impressions)', value: formatINR(cpm || 0) },
            { label: 'Break-even Orders Needed', value: (breakEvenPurchases || 0).toLocaleString('en-IN') },
            { label: 'Est. Days to Break Even', value: `${conversion.daysToBreakEven || '?'} days` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-2.5">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
