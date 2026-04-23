import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Clock, TrendingUp, BarChart2, Zap, X } from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';

const FEATURES = [
  { icon: TrendingUp, label: 'Engagement Analytics', desc: 'Deep trends & monthly breakdowns' },
  { icon: BarChart2, label: 'Brand Collabs', desc: 'AI-detected sponsorship data' },
  { icon: Zap, label: 'VVIP Network', desc: 'Notable followers & following' },
];

export default function Home() {
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem('recentSearches') || '[]'));
  }, []);

  const removeRecent = (username) => {
    const updated = recentSearches.filter((u) => u !== username);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
          <Instagram size={22} color="white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
            Influencer Analyzer
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Powered by Meta Graph API + Claude AI</p>
        </div>
      </div>

      {/* Headline */}
      <h2 className="font-display text-4xl md:text-5xl text-center mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
        Decode any
        <span style={{ color: 'var(--accent-orange)' }}> influencer's</span>
        <br />performance in seconds
      </h2>
      <p className="text-center text-base mb-10 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
        Real Instagram data. AI-powered brand detection. VVIP network analysis.
        Paste an Instagram profile link to get started.
      </p>

      {/* Search */}
      <div className="w-full max-w-xl mb-8">
        <SearchBar />
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="w-full max-w-xl mb-8">
          <p className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Clock size={11} /> Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((u) => (
              <div key={u} className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <button onClick={() => navigate(`/dashboard/${u}`)} className="hover:underline">@{u}</button>
                <button onClick={() => removeRecent(u)} className="p-0.5 rounded-full opacity-50 hover:opacity-100">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Icon size={15} style={{ color: 'var(--accent-orange)' }} />
            <div>
              <p className="text-xs font-medium leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
