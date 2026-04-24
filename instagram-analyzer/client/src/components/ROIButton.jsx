import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function ROIButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all"
      style={{
        background: disabled ? 'var(--bg-elevated)' : '#1A1A5E',
        color: disabled ? 'var(--text-muted)' : '#fff',
        border: '1px solid transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 0 0 0 rgba(26,26,94,0.4)',
        animation: disabled ? 'none' : 'roiPulse 2s infinite',
        flexShrink: 0,
      }}
    >
      <TrendingUp size={15} />
      <span>Predict ROAS</span>
      <style>{`
        @keyframes roiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,26,94,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(26,26,94,0); }
        }
      `}</style>
    </button>
  );
}
