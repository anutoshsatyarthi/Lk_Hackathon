import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const gradeColor = (g) => {
  if (!g) return 'var(--text-muted)';
  if (g.startsWith('A')) return 'var(--accent-green)';
  if (g.startsWith('B')) return 'var(--accent-orange)';
  return 'var(--accent-red)';
};

const SUB_SCORE_TIPS = {
  rawRate:             'Engagement rate = (likes + comments) ÷ followers. >6% = exceptional, >3% = good, <1% = low.',
  consistency:         'How evenly spread engagement is across posts. High = predictable performance, low = viral spikes with dead posts in between.',
  commentQuality:      'Ratio of substantive comments vs total interactions. Higher = real, engaged audience rather than passive scrollers.',
  trend:               'Month-over-month engagement growth. Positive trend = growing audience momentum — good for campaign timing.',
  reelPerformance:     'Reel views relative to follower count. >50% reach = Instagram algorithm is amplifying this creator\'s content.',
  savesShares:         'Save + share rate. >5% = audience finds content useful/shareable — strong intent signal for product discovery.',
  geoMatch:            'Estimated % of audience in India — Lenskart\'s primary market. Higher = more of the reach translates to potential buyers.',
  ageMatch:            'Estimated % of audience aged 18–45, the core eyewear buyer segment for Lenskart.',
  genderSplit:         'Female-skewed audiences historically show higher conversion rates for Lenskart eyewear categories.',
  interestAlign:       'Number of interest signals (fashion, beauty, tech, lifestyle) detected in post content — aligns with Lenskart\'s target customer.',
  authenticity:        'Genuine engagement ratio. Low score = potential inflated followers or bot activity — reduces confidence in reach estimates.',
  audienceTier:        'Estimated spending capacity based on brand mentions, locations, and lifestyle signals in content.',
  metroIndex:          'Estimated % of audience in Tier-1 cities where Lenskart has highest store density and fastest delivery.',
  purchaseBehavior:    'Signals of premium brand purchases or high-spend lifestyle in content. More signals = audience more likely to buy ₹3,500+ eyewear.',
  priceAccessibility:  'Whether the audience\'s apparent spending patterns fit Lenskart\'s ₹1,500–7,000 price range.',
  contentFit:          'Primary content niche and how naturally Lenskart frames/sunglasses can be integrated without feeling forced.',
  audienceInterest:    'Cross-over between the audience\'s interest signals and eyewear/fashion purchase intent.',
  competitorConflict:  'Any detected paid collaborations with competing eyewear brands. Conflicts require exclusivity clauses.',
  brandMentions:       'History and quality of brand collaboration content — indicates creator\'s experience with sponsored posts.',
  captionCTA:          'Quality of call-to-action text in captions. Strong CTAs ("Link in bio", "Use code X") directly drive click-through.',
  hashtagStrategy:     'Relevance and reach potential of hashtag usage for product discoverability.',
  postingConsistency:  'How regularly the creator posts — affects campaign scheduling predictability and audience conditioning.',
  formatEffectiveness: 'Match between the creator\'s best-performing format (Reel/Carousel/Image) and what the campaign will use.',
};

function InfoTip({ text }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1" style={{ verticalAlign: 'middle' }}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center flex-shrink-0 text-xs font-bold leading-none"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '0.55rem' }}
        aria-label="More info"
      >
        i
      </button>
      {visible && (
        <div
          className="absolute z-50 rounded-xl p-2.5 text-xs shadow-xl"
          style={{
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            width: '220px',
            lineHeight: '1.4',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

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

export default function ScoreCard({ name, score, grade, label, breakdown = {}, insights = [], weight, tooltip }) {
  const [expanded, setExpanded] = useState(false);
  const color = gradeColor(grade);

  return (
    <div className="rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <MiniRing score={score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</span>
              <span className="font-bold text-sm px-1.5 py-0.5 rounded" style={{ color, background: `${color}22` }}>
                {grade}
              </span>
              {tooltip && <InfoTip text={tooltip} />}
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
              {Object.entries(breakdown).map(([key, sub]) => {
                const tip = SUB_SCORE_TIPS[key];
                const label = key.replace(/([A-Z])/g, ' $1').trim();
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs capitalize flex items-center" style={{ color: 'var(--text-secondary)' }}>
                        {label}
                        {tip && <InfoTip text={tip} />}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{sub.value}</span>
                    </div>
                    <ScoreBar score={sub.score} />
                    {sub.benchmark && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{sub.benchmark}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
