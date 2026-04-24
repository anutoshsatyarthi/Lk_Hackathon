export function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + 'K';
  return n.toLocaleString();
}

export function formatPercent(n, decimals = 2) {
  if (!n && n !== 0) return '—';
  return n.toFixed(decimals) + '%';
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function engagementColor(rate) {
  if (rate >= 3) return 'var(--accent-green)';
  if (rate >= 1) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

export const CATEGORY_COLORS = {
  Bollywood: 'var(--accent-purple)',
  Politician: 'var(--accent-blue)',
  Athlete: 'var(--accent-green)',
  'Fashion Designer': 'var(--accent-orange)',
  Comedian: '#F2C94C',
  Journalist: 'var(--accent-blue)',
  'Business Leader': 'var(--accent-green)',
  Creator: 'var(--accent-orange)',
  Other: 'var(--text-muted)',
};

export const INDUSTRY_COLORS = {
  Beauty: 'var(--accent-purple)',
  Fashion: 'var(--accent-orange)',
  Tech: 'var(--accent-blue)',
  Food: '#F2C94C',
  Entertainment: 'var(--accent-green)',
  Travel: 'var(--accent-blue)',
  Fitness: 'var(--accent-green)',
  Finance: '#F2C94C',
  Other: 'var(--text-muted)',
};

export function formatINR(n) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(1)} Cr`;
  if (abs >= 100_000)    return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
  if (abs >= 1_000)      return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}

export function formatINRExact(n) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}
