/** Uploaded media served from API static (/api/uploads/*). */
export function mediaUrl(src?: string | null) {
  const raw = String(src ?? '').trim();
  if (!raw) return '';
  if (/^(blob:|data:)/i.test(raw)) return raw;
  if (raw.startsWith('/assets/')) return raw;
  if (raw.startsWith('/api/uploads/')) return raw;
  if (raw.startsWith('/uploads/') && !raw.includes('..')) return `/api${raw}`;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (u.pathname.startsWith('/api/uploads/')) return u.pathname + u.search;
      if (u.pathname.startsWith('/uploads/')) return `/api${u.pathname}${u.search}`;
    } catch {
      return raw;
    }
    return raw;
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}
