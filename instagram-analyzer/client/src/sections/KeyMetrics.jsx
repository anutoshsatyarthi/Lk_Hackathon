import React from 'react';
import { Users, FileText, UserCheck, TrendingUp } from 'lucide-react';
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
    highlight: true,
  },
];

export default function KeyMetrics({ profile }) {
  if (!profile) return null;
  const metrics = METRICS(profile);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map(({ icon: Icon, label, value, sub, color, highlight }) => (
        <div
          key={label}
          className="rounded-2xl p-5"
          style={{
            background: highlight ? `${color}10` : 'var(--bg-card)',
            border: `1px solid ${highlight ? `${color}33` : 'var(--border)'}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
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
