import React from 'react';
import { formatNumber } from '../../utils/format.js';

const STAGES = [
  { key: 'impressions',      label: 'Impressions',       color: 'var(--accent-blue)',    rateKey: null },
  { key: 'clicks',           label: 'Clicks',            color: '#8b5cf6',               rateKey: 'ctr' },
  { key: 'visits',           label: 'Site Visits',       color: 'var(--accent-orange)',  rateKey: 'landingRate' },
  { key: 'carts',            label: 'Add to Cart',       color: '#f59e0b',               rateKey: 'cartRate' },
  { key: 'paymentInitiates', label: 'Payment Initiated', color: '#ec4899',               rateKey: 'paymentInitiateRate' },
  { key: 'purchases',        label: 'Confirmed Orders',  color: 'var(--accent-green)',   rateKey: 'confirmRate' },
];

export default function ConversionFunnel({ funnel, conversionRates }) {
  if (!funnel) return null;
  const maxVal = funnel.impressions?.expected || 1;

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Conversion Funnel</h3>
        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.25)' }}>
          Based on Lenskart actual funnel
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Stage rates anchored to Lenskart's real online funnel — Cart 13.1% · Payment Initiate 31.2% · Order Confirm 46.9%
      </p>

      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const exp  = funnel[stage.key]?.expected  || 0;
          const low  = funnel[stage.key]?.pessimistic || 0;
          const high = funnel[stage.key]?.optimistic  || 0;
          const pct  = Math.round((exp / maxVal) * 100);
          const prevExp  = i > 0 ? (funnel[STAGES[i - 1].key]?.expected || 1) : exp;
          const dropOff  = i > 0 && prevExp > 0 ? Math.round((1 - exp / prevExp) * 100) : 0;
          const stageRate = stage.rateKey && conversionRates ? conversionRates[stage.rateKey] : null;

          return (
            <div key={stage.key}>
              {i > 0 && (
                <div className="flex items-center justify-center gap-2 py-0.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>↓</span>
                  {stageRate != null && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: `${stage.color}18`, color: stage.color }}>
                      {stageRate}%
                    </span>
                  )}
                  {dropOff > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dropOff}% drop-off</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-28 text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{stage.label}</p>
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div
                      className="h-full rounded-lg"
                      style={{ width: `${Math.max(pct, 1)}%`, background: `${stage.color}33`, transition: 'width 0.8s ease', minWidth: 6 }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0" style={{ minWidth: 88 }}>
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
        <div className="mt-4 pt-4 grid grid-cols-3 sm:grid-cols-6 gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'CTR',           value: `${conversionRates.ctr}%` },
            { label: 'Landing',       value: `${conversionRates.landingRate}%` },
            { label: 'Cart Rate',     value: `${conversionRates.cartRate}%` },
            { label: 'Pay Initiate',  value: `${conversionRates.paymentInitiateRate}%` },
            { label: 'Confirmation',  value: `${conversionRates.confirmRate}%` },
            { label: 'End-to-End',    value: `${conversionRates.endToEnd}%` },
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
