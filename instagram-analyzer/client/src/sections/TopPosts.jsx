import React from 'react';
import { ExternalLink, Heart, MessageCircle, Eye, Bookmark, Image } from 'lucide-react';
import { formatNumber, formatDate } from '../utils/format.js';

const TYPE_COLORS = {
  Reel: 'var(--accent-orange)',
  Image: 'var(--accent-blue)',
  Carousel: 'var(--accent-purple)',
};

function PostCard({ post, rank }) {
  const typeColor = TYPE_COLORS[post.type] || 'var(--text-muted)';

  return (
    <div
      className="rounded-2xl overflow-hidden flex-shrink-0 w-64"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Thumbnail */}
      <div className="relative h-48 flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
        {post.thumbnail ? (
          <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <Image size={32} style={{ color: 'var(--text-muted)' }} />
        )}
        {/* Rank badge */}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold" style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--accent-orange)' }}>
          #{rank}
        </div>
        {/* Type badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${typeColor}33`, color: typeColor, border: `1px solid ${typeColor}55` }}>
          {post.type}
        </div>
      </div>

      <div className="p-4">
        {/* Caption */}
        {post.caption && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
            {post.caption}
          </p>
        )}

        {/* Engagement */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {[
            { icon: Heart, value: post.likes, color: 'var(--accent-orange)' },
            { icon: MessageCircle, value: post.comments, color: 'var(--accent-blue)' },
            { icon: Eye, value: post.views, color: 'var(--accent-purple)' },
            { icon: Bookmark, value: post.saves, color: 'var(--accent-green)' },
          ].map(({ icon: Icon, value, color }) => (
            <div key={color} className="flex items-center gap-1">
              <Icon size={11} style={{ color }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{formatNumber(value)}</span>
            </div>
          ))}
        </div>

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(post.date)}</span>
          {post.permalink && post.permalink !== '#' && (
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent-orange)' }}>
              View <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopPosts({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
        Top Posts by Engagement
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {posts.map((post, i) => <PostCard key={post.id || i} post={post} rank={i + 1} />)}
      </div>
    </div>
  );
}
