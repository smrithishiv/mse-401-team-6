export function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-CA').format(value);
}

export function formatCompactNumber(value) {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/\.00$/, '')} M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')} K`;
  return `${value}`;
}

export function formatPct(value, { signed = false } = {}) {
  if (value === null || value === undefined) return '—';
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

export function formatDate(isoString, options = { month: 'long', day: 'numeric', year: 'numeric' }) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-CA', options).format(date);
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatRange(range) {
  if (!range) return '—';
  return `${formatNumber(range.low)}–${formatNumber(range.high)}`;
}
