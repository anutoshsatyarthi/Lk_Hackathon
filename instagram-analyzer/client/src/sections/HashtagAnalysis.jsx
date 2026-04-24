import React from 'react';
import { Hash } from 'lucide-react';

const PALETTE = [
  'var(--accent-orange)',
  'var(--accent-blue)',
  'var(--accent-purple)',
  'var(--accent-green)',
  '#F2C94C',
  'var(--accent-red)',
];

export default function HashtagAnalysis({ hashtags = [] }) {
  if (!hashtags.length) return null;

  const max = hashtags[0]?.count || 1;

  return (
    <div className="space-y-4">
      {/* Tag Cloud */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Hashtag Cloud
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-3 items-center justify-center leading-relaxed">
          {hashtags.map((h, i) => {
            const ratio = h.count / max;
            // Exponential scale so top tags are dramatically larger
            const size = 0.68 + Math.pow(ratio, 0.55) * 2.1;
            const opacity = 0.55 + ratio * 0.45;
            const color = PALETTE[i % PALETTE.length];
            // Alternate vertical alignment for cloud feel
            const nudge = [0, -4, 4, -2, 2, -6, 6][i % 7];
            return (
              <span
                key={h.tag}
                className="font-bold cursor-default transition-opacity hover:opacity-100 select-none"
                style={{
                  fontSize: `${size}rem`,
                  color,
                  opacity,
                  display: 'inline-block',
                  transform: `translateY(${nudge}px)`,
                  lineHeight: 1.1,
                  letterSpacing: ratio > 0.6 ? '-0.02em' : '0',
                }}
                title={`${h.tag}: ${h.count} posts`}
              >
                {h.tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Top Hashtags by Frequency
        </h3>
        <div className="space-y-3">
          {hashtags.slice(0, 15).map((h, i) => {
            const pct = (h.count / max) * 100;
            const color = PALETTE[i % PALETTE.length];
            return (
              <div key={h.tag} className="flex items-center gap-3">
                <div className="w-32 text-right">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{h.tag}</span>
                </div>
                <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div
                    className="h-full rounded-md flex items-center pl-2 transition-all"
                    style={{ width: `${pct}%`, background: `${color}44` }}
                  >
                    {pct > 20 && (
                      <span className="text-xs font-mono font-medium" style={{ color }}>{h.count}</span>
                    )}
                  </div>
                </div>
                {pct <= 20 && (
                  <span className="text-xs font-mono w-8" style={{ color: 'var(--text-muted)' }}>{h.count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
