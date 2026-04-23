import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const gradeColor = (g) => {
  if (!g) return 'var(--text-muted)';
  if (g.startsWith('A')) return 'var(--accent-green)';
  if (g.startsWith('B')) return 'var(--accent-orange)';
  return 'var(--accent-red)';
};

function MiniRing({ score, size = 48 }) {
  const pct = Math.round((score || 0) * 100);
  const r = size/2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (pct/100) * circ;
  const color = pct > 70 ? 'var(--accent-green)' : pct > 45 ? 'var(--accent-orange)' : 'var(--accent-red)';
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="4" stroke="rgba(255,255,255,0.08)" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="4" stroke={color}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute font-mono font-bold" style={{ fontSize: size * 0.22, color }}>{pct}</span>
    </div>
  );
}

function ScoreBar({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct > 70 ? 'var(--accent-green)' : pct > 45 ? 'var(--accent-orange)' : 'var(--accent-red)';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
      <span className="font-mono text-xs w-7 text-right" style={{ color }}>{pct}</span>
    </div>
  );
}

export default function ScoreCard({ name, score, grade, label, breakdown = {}, insights = [], weight }) {
  const [expanded, setExpanded] = useState(false);
  const color = gradeColor(grade);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <MiniRing score={score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</span>
              <span className="font-bold text-sm px-1.5 py-0.5 rounded" style={{ color, background: `${color}22` }}>{grade}</span>
              {weight && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(weight * 100)}% weight</span>}
            </div>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        </div>

        {insights.length > 0 && (
          <ul className="space-y-1 mb-2">
            {insights.map((ins, i) => (
              <li key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-orange)', flexShrink: 0 }}>›</span>
                {ins}
              </li>
            ))}
          </ul>
        )}
      </div>

      {Object.keys(breakdown).length > 0 && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs"
            style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <span>View sub-score breakdown</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="px-4 py-3 space-y-3" style={{ background: 'var(--bg-elevated)' }}>
              {Object.entries(breakdown).map(([key, sub]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{sub.value}</span>
                  </div>
                  <ScoreBar score={sub.score} />
                  {sub.benchmark && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{sub.benchmark || sub.detail}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
