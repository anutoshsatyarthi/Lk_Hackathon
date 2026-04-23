import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Search, BarChart2 } from 'lucide-react';

export default function Layout({ children, demoMode = false }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Demo banner */}
      {demoMode && (
        <div className="text-center py-2 px-4 text-sm" style={{ background: '#2A1F00', borderBottom: '1px solid #F2994A44', color: '#F2994A' }}>
          Demo Mode — Connect your Meta API keys in <code className="font-mono text-xs">.env</code> for live data
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
              <Instagram size={14} color="white" />
            </div>
            <span className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Influencer Analyzer
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Search size={13} />
              <span>New Search</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
