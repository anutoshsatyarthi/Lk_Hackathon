import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber, formatPercent, engagementColor, INDUSTRY_COLORS } from '../utils/format.js';

function MetricTile({ label, value }) {
  return (
    <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
      <p className="font-mono text-base font-medium leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{label}</p>
    </div>
  );
}

function BrandCard({ brand }) {
  const [expanded, setExpanded] = useState(false);
  const engColor = engagementColor(brand.engagementRate);
  const indColor = INDUSTRY_COLORS[brand.industry] || INDUSTRY_COLORS.Other;
  const maxEng = 8;
  const scoreWidth = Math.min((brand.engagementRate / maxEng) * 100, 100);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${indColor}20` }}>
              {{ Beauty: '💄', Fashion: '👗', Tech: '📱', Food: '🍕', Entertainment: '🎬', Travel: '✈️', Fitness: '💪', Finance: '💰' }[brand.industry] || '🏢'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{brand.brand}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${indColor}22`, color: indColor, fontSize: '0.65rem' }}>
                  {brand.industry}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{brand.period}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono font-bold text-lg leading-none" style={{ color: engColor }}>{formatPercent(brand.engagementRate)}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>eng rate</p>
          </div>
        </div>

        {/* Engagement score bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Engagement Score</span>
            <span>{brand.postCount} posts</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${scoreWidth}%`, background: engColor }} />
          </div>
        </div>

        {/* 5 metric tiles */}
        <div className="grid grid-cols-5 gap-1.5">
          <MetricTile label="Avg Likes" value={formatNumber(brand.avgLikes)} />
          <MetricTile label="Avg Comments" value={formatNumber(brand.avgComments)} />
          <MetricTile label="Avg Views" value={formatNumber(brand.avgViews)} />
          <MetricTile label="Avg Shares" value={formatNumber(brand.avgShares)} />
          <MetricTile label="Total Reach" value={formatNumber(brand.totalReach)} />
        </div>
      </div>

      {/* Expandable top post */}
      {brand.topPost?.caption && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full px-5 py-2.5 flex items-center justify-between text-xs transition-colors"
            style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <span>Top performing post</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {expanded && (
            <div className="px-5 py-3" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{brand.topPost.caption}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs font-mono" style={{ color: 'var(--accent-orange)' }}>♥ {formatNumber(brand.topPost.likes)}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--accent-blue)' }}>💬 {formatNumber(brand.topPost.comments)}</span>
                {brand.topPost.permalink && brand.topPost.permalink !== '#' && (
                  <a href={brand.topPost.permalink} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--accent-orange)' }}>
                    View <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BrandCollabs({ brands = [] }) {
  if (!brands.length) return (
    <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p style={{ color: 'var(--text-muted)' }}>No brand collaborations detected</p>
    </div>
  );

  const totalBrands = brands.length;
  const totalPosts = brands.reduce((s, b) => s + b.postCount, 0);
  const highestEng = Math.max(...brands.map((b) => b.engagementRate));
  const avgEng = brands.reduce((s, b) => s + b.engagementRate, 0) / brands.length;

  return (
    <div className="space-y-5">
      {/* Aggregate stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Brands', value: totalBrands, color: 'var(--accent-orange)' },
          { label: 'Total Collab Posts', value: formatNumber(totalPosts), color: 'var(--accent-blue)' },
          { label: 'Highest Eng Rate', value: formatPercent(highestEng), color: 'var(--accent-green)' },
          { label: 'Avg Eng Rate', value: formatPercent(avgEng), color: engagementColor(avgEng) },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="font-mono text-xl font-medium" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Brand cards grid */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Brand Performance — sorted by engagement rate
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {brands.map((brand) => <BrandCard key={brand.brand} brand={brand} />)}
        </div>
      </div>
    </div>
  );
}
