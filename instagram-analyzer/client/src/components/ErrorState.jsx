import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm py-3 px-4 rounded-lg" style={{ background: '#2D0E0E', border: '1px solid #EB575733', color: 'var(--accent-red)' }}>
        <AlertCircle size={14} />
        <span>{error || 'Failed to load data'}</span>
        {onRetry && (
          <button onClick={onRetry} className="ml-auto underline text-xs">Retry</button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#2D0E0E' }}>
        <AlertCircle size={20} style={{ color: 'var(--accent-red)' }} />
      </div>
      <div>
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Something went wrong</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error || 'Failed to load data. Please try again.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
