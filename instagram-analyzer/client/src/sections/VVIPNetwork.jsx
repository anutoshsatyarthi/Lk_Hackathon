import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { formatNumber, CATEGORY_COLORS } from '../utils/format.js';

function VVIPCard({ person }) {
  const catColor = CATEGORY_COLORS[person.category] || CATEGORY_COLORS.Other;

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3 transition-colors"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${catColor}22`, border: `1px solid ${catColor}44` }}>
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User size={16} style={{ color: catColor }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-sm leading-none truncate" style={{ color: 'var(--text-primary)' }}>
            {person.displayName}
          </span>
          {person.isVerified && <CheckCircle2 size={12} style={{ color: '#3897f0', flexShrink: 0 }} />}
        </div>
        <p className="text-xs mt-0.5 truncate font-mono" style={{ color: 'var(--text-muted)' }}>@{person.username}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${catColor}22`, color: catColor, fontSize: '0.65rem' }}>
            {person.category}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatNumber(person.followers)} followers</span>
        </div>
      </div>
    </div>
  );
}

export default function VVIPNetwork({ following = [], followers = [] }) {
  const hasData = following.length > 0 || followers.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No notable connections found for this account. This section shows verified or high-follower accounts that appear in recent post mentions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {following.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Notable Following
          </h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Celebrities & public figures this account follows</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {following.map((person) => <VVIPCard key={person.username} person={person} />)}
          </div>
        </div>
      )}

      {followers.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Notable Followers
          </h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Celebrities & public figures who follow this account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {followers.map((person) => <VVIPCard key={person.username} person={person} />)}
          </div>
        </div>
      )}
    </div>
  );
}
