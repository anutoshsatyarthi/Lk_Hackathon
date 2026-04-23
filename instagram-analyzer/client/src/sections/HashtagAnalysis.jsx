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
        <div className="flex flex-wrap gap-2.5">
          {hashtags.map((h, i) => {
            const size = 0.7 + (h.count / max) * 0.8;
            const color = PALETTE[i % PALETTE.length];
            return (
              <span
                key={h.tag}
                className="px-3 py-1.5 rounded-full font-medium cursor-default transition-opacity hover:opacity-80"
                style={{
                  fontSize: `${size}rem`,
                  background: `${color}18`,
                  color,
                  border: `1px solid ${color}33`,
                }}
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
