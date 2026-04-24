import React from 'react';
import { formatNumber } from '../utils/format.js';

function niceMax(raw) {
  if (raw <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * exp;
}

function BarChart({ data, valueKey, color, label }) {
  if (!data?.length) return null;
  const rawMax = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const max = niceMax(rawMax);
  const chartHeight = 130;
  const yTicks = 4;

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-right flex-shrink-0 pb-5" style={{ height: chartHeight, width: 36 }}>
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = Math.round((max / yTicks) * (yTicks - i));
            return (
              <span key={i} className="font-mono leading-none" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                {formatNumber(val)}
              </span>
            );
          })}
        </div>

        {/* Chart area */}
        <div className="flex-1 min-w-0">
          {/* Gridlines + bars */}
          <div className="relative" style={{ height: chartHeight - 20 }}>
            {/* Horizontal gridlines */}
            {Array.from({ length: yTicks + 1 }, (_, i) => (
              <div key={i} className="absolute w-full" style={{
                top: `${(i / yTicks) * 100}%`,
                borderTop: '1px dashed',
                borderColor: i === yTicks ? 'var(--border)' : 'rgba(255,255,255,0.05)',
              }} />
            ))}
            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-0.5">
              {data.map((d, i) => {
                const height = Math.max(((d[valueKey] || 0) / max) * 100, 0.5);
                return (
                  <div key={i} className="flex-1 group relative flex items-end" style={{ height: '100%' }}>
                    <div
                      className="w-full rounded-t-sm transition-opacity group-hover:opacity-75"
                      style={{ height: `${height}%`, background: color, minWidth: 3 }}
                    />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {d.label}: {formatNumber(d[valueKey])}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1.5">
            {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
              <span key={i} className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EngagementAnalytics({ trends = [], postTypes = [], fullView = false, totalMediaCount }) {
  const reels = postTypes.find((t) => t.type === 'REEL');
  const images = postTypes.find((t) => t.type === 'IMAGE');

  const avgLikes = trends.length ? Math.round(trends.reduce((s, d) => s + d.avgLikes, 0) / trends.length) : 0;
  const avgComments = trends.length ? Math.round(trends.reduce((s, d) => s + d.avgComments, 0) / trends.length) : 0;
  const avgViews = trends.length ? Math.round(trends.reduce((s, d) => s + d.avgViews, 0) / trends.length) : 0;

  return (
    <div className="space-y-4">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Likes / Post', value: formatNumber(avgLikes), color: 'var(--accent-orange)' },
          { label: 'Avg Comments / Post', value: formatNumber(avgComments), color: 'var(--accent-blue)' },
          { label: 'Avg Reel Views', value: formatNumber(avgViews), color: 'var(--accent-purple)' },
          { label: 'Avg. Monthly Posts', value: trends.length ? Math.round(trends.reduce((s, d) => s + d.postCount, 0) / trends.length) : '—', color: 'var(--accent-green)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="font-mono text-xl font-medium" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Monthly Engagement Trends
        </h3>
        <BarChart data={trends} valueKey="avgViews" color="var(--accent-purple)" label="Avg Reel Views" />
        <div className="mt-6 grid grid-cols-2 gap-6">
          <BarChart data={trends} valueKey="avgLikes" color="var(--accent-orange)" label="Avg Likes" />
          <BarChart data={trends} valueKey="avgComments" color="var(--accent-blue)" label="Avg Comments" />
        </div>
      </div>

      {/* Reels vs Images comparison */}
      {reels && images && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Reels vs Images
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Reels', data: reels, color: 'var(--accent-orange)' },
              { label: 'Images', data: images, color: 'var(--accent-blue)' },
            ].map(({ label, data, color }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
                </div>
                <p className="font-mono text-2xl font-medium mb-1" style={{ color }}>
                  {formatNumber(totalMediaCount ? Math.round((data.percentage / 100) * totalMediaCount) : data.count)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.percentage}% of all posts</p>
                <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${data.percentage}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
