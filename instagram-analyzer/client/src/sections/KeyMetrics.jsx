import React, { useState } from 'react';
import { Users, FileText, UserCheck, TrendingUp, Info } from 'lucide-react';
import { formatNumber, formatPercent, engagementColor } from '../utils/format.js';

const METRICS = (profile) => [
  {
    icon: FileText,
    label: 'Total Posts',
    value: formatNumber(profile.mediaCount),
    sub: 'published',
    color: 'var(--accent-orange)',
  },
  {
    icon: Users,
    label: 'Followers',
    value: formatNumber(profile.followers),
    sub: 'total audience',
    color: 'var(--accent-blue)',
  },
  {
    icon: UserCheck,
    label: 'Following',
    value: formatNumber(profile.following),
    sub: 'accounts',
    color: 'var(--accent-purple)',
  },
  {
    icon: TrendingUp,
    label: 'Engagement Rate',
    value: formatPercent(profile.metrics?.engagementRate),
    sub: profile.metrics?.engagementRate >= 3 ? 'Excellent' : profile.metrics?.engagementRate >= 1 ? 'Average' : 'Below avg',
    color: engagementColor(profile.metrics?.engagementRate || 0),
  },
];

export default function KeyMetrics({ profile }) {
  if (!profile) return null;
  const metrics = METRICS(profile);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map(({ icon: Icon, label, value, sub, color }) => (
        <div
          key={label}
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
              {label === 'Engagement Rate' && (
                <div className="relative group">
                  <Info size={11} style={{ color: 'var(--text-muted)', cursor: 'default' }} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 hidden group-hover:block">
                    <div className="rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      (Total Likes + Comments) / Followers
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--border)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
              <Icon size={14} style={{ color }} />
            </div>
          </div>
          <div className="font-mono text-2xl font-medium mb-1 leading-none" style={{ color }}>
            {value}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}
