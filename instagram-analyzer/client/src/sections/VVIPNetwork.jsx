import React, { useState } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { formatNumber, CATEGORY_COLORS } from '../utils/format.js';

const MIN_FOLLOWERS = 1_000_000;

function proxyUrl(url) {
  if (!url) return null;
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

function Avatar({ person, catColor }) {
  const [failed, setFailed] = useState(false);
  const src = person.avatarUrl ? proxyUrl(person.avatarUrl) : null;
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={person.displayName}
        className="w-full h-full rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return <User size={16} style={{ color: catColor }} />;
}

function VVIPCard({ person }) {
  const catColor = CATEGORY_COLORS[person.category] || CATEGORY_COLORS.Other;

  return (
    <a
      href={`https://www.instagram.com/${person.username}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl p-4 flex items-center gap-3 transition-colors no-underline"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', textDecoration: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: `${catColor}22`, border: `2px solid ${catColor}44` }}>
        <Avatar person={person} catColor={catColor} />
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
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{formatNumber(person.followers)} followers</span>
        </div>
      </div>
    </a>
  );
}

export default function VVIPNetwork({ following = [], followers = [] }) {
  const filteredFollowing = following.filter((p) => (p.followers || 0) >= MIN_FOLLOWERS);
  const filteredFollowers = followers.filter((p) => (p.followers || 0) >= MIN_FOLLOWERS);
  const hasData = filteredFollowing.length > 0 || filteredFollowers.length > 0;

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
      {filteredFollowing.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Notable Following
          </h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Celebrities & public figures (1M+ followers) this account follows</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFollowing.map((person) => <VVIPCard key={person.username} person={person} />)}
          </div>
        </div>
      )}

      {filteredFollowers.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Notable Followers
          </h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Celebrities & public figures (1M+ followers) who follow this account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFollowers.map((person) => <VVIPCard key={person.username} person={person} />)}
          </div>
        </div>
      )}
    </div>
  );
}
