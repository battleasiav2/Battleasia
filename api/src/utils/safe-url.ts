/** HTTPS-only (optional http for localhost). Blocks javascript:/data:/etc. */
export function sanitizePublicUrl(raw: unknown, maxLen = 500): string {
  const value = String(raw || '').trim().slice(0, maxLen);
  if (!value) return '';
  try {
    const u = new URL(value);
    const proto = u.protocol.toLowerCase();
    if (proto === 'https:') return u.toString();
    if (proto === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      return u.toString();
    }
    return '';
  } catch {
    return '';
  }
}

/** Only same-origin upload paths (or https CDN that includes /uploads/). */
export function sanitizeUploadAttachment(raw: unknown, maxLen = 500): string {
  const value = String(raw || '').trim().slice(0, maxLen);
  if (!value) return '';
  if (value.startsWith('/uploads/') && !value.includes('..')) return value;
  if (value.startsWith('/api/uploads/') && !value.includes('..')) {
    return value.replace(/^\/api/, '');
  }
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    if (u.pathname.startsWith('/uploads/') || u.pathname.startsWith('/api/uploads/')) {
      return u.pathname.startsWith('/api/uploads/')
        ? u.pathname.replace(/^\/api/, '') + u.search
        : u.pathname + u.search;
    }
  } catch {
    return '';
  }
  return '';
}

export function sanitizeAttachmentList(raw: unknown, max = 6): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => sanitizeUploadAttachment(item))
    .filter(Boolean)
    .slice(0, max);
}
