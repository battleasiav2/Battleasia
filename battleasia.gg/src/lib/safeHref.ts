/** Block javascript:/data:/etc. Allow https (+ http localhost) and relative /uploads paths. */
export function safeHref(raw: unknown, maxLen = 500): string {
  const value = String(raw || '').trim().slice(0, maxLen);
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('..')) {
    return value;
  }
  try {
    const u = new URL(value);
    const proto = u.protocol.toLowerCase();
    if (proto === 'https:') return u.toString();
    if (proto === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      return u.toString();
    }
    if (proto === 'mailto:' || proto === 'tel:') return u.toString();
  } catch {
    return '';
  }
  return '';
}

/** Prefer safe media URLs for chat/DM attachments. */
export function safeMediaHref(raw: unknown): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (value.startsWith('/uploads/') && !value.includes('..')) return value;
  if (value.startsWith('/api/uploads/') && !value.includes('..')) {
    return value.replace(/^\/api/, '');
  }
  return safeHref(value);
}
