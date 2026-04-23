import React from 'react';
import { ExternalLink, CheckCircle2, User } from 'lucide-react';
import { formatNumber } from '../utils/format.js';

export default function ProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full ig-gradient-border overflow-hidden flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
            {profile.profilePicUrl ? (
              <img src={profile.profilePicUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              <User size={36} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h2 className="font-display text-xl font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {profile.fullName || profile.username}
            </h2>
            {profile.isVerified && (
              <CheckCircle2 size={18} style={{ color: '#3897f0', flexShrink: 0 }} />
            )}
          </div>

          <p className="text-sm mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
            @{profile.username}
          </p>

          {profile.biography && (
            <p className="text-sm mt-3 leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {profile.biography}
            </p>
          )}

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <a
              href={`https://www.instagram.com/${profile.username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs underline"
              style={{ color: 'var(--accent-orange)' }}
            >
              <ExternalLink size={11} />
              @{profile.username}
            </a>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex sm:flex-col gap-6 sm:gap-4 flex-shrink-0 sm:text-right">
          {[
            { label: 'Followers', value: formatNumber(profile.followers) },
            { label: 'Following', value: formatNumber(profile.following) },
            { label: 'Posts', value: formatNumber(profile.mediaCount) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-mono text-xl font-medium" style={{ color: 'var(--text-primary)' }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
