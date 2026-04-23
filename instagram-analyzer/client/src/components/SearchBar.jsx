import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Instagram, Loader2 } from 'lucide-react';

function extractUsername(raw) {
  const trimmed = raw.trim().replace('@', '');
  try {
    const withProto = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    if (url.hostname.includes('instagram.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[0];
    }
  } catch {
    // Not a URL — treat as plain username
  }
  return trimmed;
}

function saveRecent(username) {
  const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const updated = [username, ...recent.filter((u) => u !== username)].slice(0, 6);
  localStorage.setItem('recentSearches', JSON.stringify(updated));
}

export default function SearchBar({ loading = false, compact = false }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = extractUsername(value);
    if (!username) return;
    saveRecent(username);
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
            placeholder="@username or profile URL"
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
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto flex flex-col gap-3">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <Instagram size={20} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste Instagram Profile Link"
          className="flex-1 bg-transparent outline-none text-base"
          style={{ color: 'var(--text-primary)' }}
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-base transition-all disabled:opacity-50"
        style={{ background: 'var(--accent-orange)', color: '#0D0907' }}
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Searching</> : <><Search size={16} /> Analyze</>}
      </button>
    </form>
  );
}
