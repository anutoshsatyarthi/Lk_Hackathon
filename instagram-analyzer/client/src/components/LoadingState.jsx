import React from 'react';

function SkeletonBlock({ className = '', style = {} }) {
  return <div className={`skeleton rounded-lg ${className}`} style={style} />;
}

export function ProfileSkeleton() {
  return (
    <div className="rounded-2xl p-6 flex gap-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <SkeletonBlock className="w-24 h-24 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-8 w-32" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-48' }) {
  return (
    <div className={`rounded-2xl p-6 ${height}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <SkeletonBlock className="h-5 w-40 mb-6" />
      <div className="flex items-end gap-2 h-28">
        {[...Array(10)].map((_, i) => (
          <SkeletonBlock key={i} className="flex-1" style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex gap-3">
            <SkeletonBlock className="w-10 h-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-orange)', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
