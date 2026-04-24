import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function DemographicBar({ label, value, score, color }) {
  const pct = Math.round((score || 0) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 flex-shrink-0 text-xs font-medium text-right" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="flex-1">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <div className="w-20 text-xs font-mono flex-shrink-0" style={{ color }}>{value}</div>
    </div>
  );
}

function SentimentDonut({ positive = 72, neutral = 20, negative = 8 }) {
  const size = 96;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const posLen = (positive / 100) * circ;
  const neuLen = (neutral / 100) * circ;
  const negLen = (negative / 100) * circ;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10" stroke="var(--bg-elevated)" />
        {/* Positive (green) */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10" stroke="#16a34a"
          strokeDasharray={`${posLen} ${circ}`} strokeLinecap="butt" />
        {/* Neutral (orange) */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10" stroke="#d97706"
          strokeDasharray={`${neuLen} ${circ - posLen}`}
          strokeDashoffset={-posLen}
          strokeLinecap="butt" />
        {/* Negative (red) */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10" stroke="#dc2626"
          strokeDasharray={`${negLen} ${circ}`}
          strokeDashoffset={-(posLen + neuLen)}
          strokeLinecap="butt" />
      </svg>
      <div className="absolute text-center">
        <p className="font-mono font-bold text-sm" style={{ color: '#16a34a' }}>{positive}%</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>positive</p>
      </div>
    </div>
  );
}

function CommentList({ comments = [], color }) {
  return (
    <div className="space-y-1.5">
      {comments.map((c, i) => (
        <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)', border: `1px solid ${color}22` }}>
          <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
          {c.likes > 0 && (
            <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>♥ {c.likes}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AudienceBreakdown({ audienceEstimates, sentiment }) {
  const [expandedSentiment, setExpandedSentiment] = useState(null);

  if (!audienceEstimates && !sentiment) return null;

  const breakdown = audienceEstimates?.breakdown || {};
  const sent = sentiment?.sentimentBreakdown || {};
  const topComments = sentiment?.topComments || {};

  const sentCategories = [
    { key: 'positive', label: 'Positive', color: '#16a34a', icon: '😍' },
    { key: 'neutral',  label: 'Neutral',  color: '#d97706', icon: '💬' },
    { key: 'negative', label: 'Negative', color: '#dc2626', icon: '😒' },
  ];

  return (
    <div className="space-y-4">
      {/* Audience Demographics */}
      {audienceEstimates && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Audience Demographics</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Estimated from post content signals · not from Instagram Insights API</p>
          </div>

          <div className="space-y-3">
            {breakdown.geoMatch && (
              <DemographicBar label="Geography" value={breakdown.geoMatch.value} score={breakdown.geoMatch.score} color="var(--accent-blue)" />
            )}
            {breakdown.ageMatch && (
              <DemographicBar label="Age 18–45" value={breakdown.ageMatch.value} score={breakdown.ageMatch.score} color="var(--accent-green)" />
            )}
            {breakdown.genderSplit && (
              <div className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0 text-xs font-medium text-right" style={{ color: 'var(--text-secondary)' }}>Gender</div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    {(() => {
                      const parts = breakdown.genderSplit.value.match(/(\d+)M\s*\/\s*(\d+)F/);
                      const malePct = parts ? parseInt(parts[1]) : 50;
                      return (
                        <div className="h-full flex">
                          <div style={{ width: `${malePct}%`, background: '#3b82f6' }} />
                          <div style={{ flex: 1, background: '#ec4899' }} />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono" style={{ color: '#3b82f6' }}>♂ {breakdown.genderSplit.value.match(/(\d+)M/)?.[1]}%</span>
                    <span className="text-xs font-mono" style={{ color: '#ec4899' }}>♀ {breakdown.genderSplit.value.match(/(\d+)F/)?.[1]}%</span>
                  </div>
                </div>
              </div>
            )}
            {breakdown.interestAlign && (
              <DemographicBar label="Interest Match" value={breakdown.interestAlign.value} score={breakdown.interestAlign.score} color="var(--accent-orange)" />
            )}
            {breakdown.authenticity && (
              <DemographicBar label="Authenticity" value={breakdown.authenticity.value} score={breakdown.authenticity.score} color="var(--accent-green)" />
            )}
          </div>
        </div>
      )}

      {/* Comment Sentiment */}
      {sentiment && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Comment Sentiment</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {sentiment.summary || 'Inferred from content tone and engagement patterns'}
            </p>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <SentimentDonut
              positive={sent.positive || 0}
              neutral={sent.neutral || 0}
              negative={sent.negative || 0}
            />
            <div className="flex-1 space-y-2 min-w-0">
              {sentCategories.map(({ key, label, color, icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${sent[key] || 0}%`, background: color }} />
                  </div>
                  <span className="font-mono text-xs w-10 text-right flex-shrink-0" style={{ color }}>{sent[key] || 0}%</span>
                  <span className="text-xs w-16 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable top comments per category */}
          <div className="space-y-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Sample Comments by Sentiment</p>
            {sentCategories.map(({ key, label, color, icon }) => {
              const comments = topComments[key] || [];
              if (!comments.length) return null;
              const isOpen = expandedSentiment === key;
              return (
                <div key={key} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${color}33` }}>
                  <button
                    onClick={() => setExpandedSentiment(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium"
                    style={{ background: `${color}0f`, color }}
                  >
                    <span>{icon} {label} ({sent[key] || 0}%)</span>
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {isOpen && (
                    <div className="p-3" style={{ background: 'var(--bg-elevated)' }}>
                      <CommentList comments={comments} color={color} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
