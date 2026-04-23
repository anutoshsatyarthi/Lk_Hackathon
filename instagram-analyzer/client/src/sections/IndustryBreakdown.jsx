import React from 'react';
import { formatNumber, formatPercent, INDUSTRY_COLORS } from '../utils/format.js';

export default function IndustryBreakdown({ brands = [] }) {
  if (!brands.length) return null;

  // Group by industry
  const byIndustry = {};
  for (const b of brands) {
    const ind = b.industry || 'Other';
    if (!byIndustry[ind]) byIndustry[ind] = { brands: [], totalPosts: 0, totalEngRate: 0 };
    byIndustry[ind].brands.push(b.brand);
    byIndustry[ind].totalPosts += b.postCount;
    byIndustry[ind].totalEngRate += b.engagementRate;
  }

  const industries = Object.entries(byIndustry).map(([ind, d]) => ({
    industry: ind,
    brandCount: d.brands.length,
    brands: d.brands,
    totalPosts: d.totalPosts,
    avgEngRate: parseFloat((d.totalEngRate / d.brands.length).toFixed(2)),
  })).sort((a, b) => b.avgEngRate - a.avgEngRate);

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
        Industry Breakdown
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {industries.map(({ industry, brandCount, brands, totalPosts, avgEngRate }) => {
          const color = INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Other;
          return (
            <div
              key={industry}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-elevated)', border: `1px solid ${color}33` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{industry}</span>
              </div>
              <p className="font-mono text-xl font-medium mb-1" style={{ color }}>{formatPercent(avgEngRate)}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>avg engagement rate</p>
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>Brands</span>
                  <span className="font-mono">{brandCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total posts</span>
                  <span className="font-mono">{totalPosts}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {brands.map((b) => (
                  <span key={b} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color, fontSize: '0.6rem' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
