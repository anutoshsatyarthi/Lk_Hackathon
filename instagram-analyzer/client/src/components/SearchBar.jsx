import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Instagram, Loader2 } from 'lucide-react';

export default function SearchBar({ loading = false, compact = false }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = value.trim().replace('@', '');
    if (!username) return;

    // Save to localStorage recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [username, ...recent.filter((u) => u !== username)].slice(0, 6);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    navigate(`/dashboard/${username}`);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="@username"
            className="pl-8 pr-3 py-1.5 text-sm rounded-lg outline-none w-44"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-3 py-1.5 text-sm rounded-lg font-medium disabled:opacity-50 transition-opacity"
          style={{ background: 'var(--accent-orange)', color: '#0D0907' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Analyze'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <Instagram size={20} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter Instagram username (e.g., kushakapila)"
          className="flex-1 bg-transparent outline-none text-base placeholder:text-muted"
          style={{ color: 'var(--text-primary)' }}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          style={{ background: 'var(--accent-orange)', color: '#0D0907', flexShrink: 0 }}
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Searching</>
          ) : (
            <><Search size={15} /> Analyze</>
          )}
        </button>
      </div>
    </form>
  );
}
