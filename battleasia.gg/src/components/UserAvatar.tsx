import { useEffect, useId, useState } from 'react';

export function mediaUrl(src?: string | null) {
  if (!src) return '';
  const raw = String(src).trim();
  if (!raw) return '';
  if (/^(blob:|data:)/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (
        u.pathname.startsWith('/uploads/') ||
        u.pathname.startsWith('/api/uploads/') ||
        u.pathname.startsWith('/assets/')
      ) {
        return u.pathname.startsWith('/api/uploads/')
          ? u.pathname.replace(/^\/api/, '') + u.search
          : u.pathname + u.search;
      }
    } catch {
      /* keep absolute */
    }
    return raw;
  }
  if (raw.startsWith('/api/uploads/')) return raw.replace(/^\/api/, '');
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function UserAvatar({
  src,
  name,
  size = 36,
  className = '',
  priority = false,
}: {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const url = mediaUrl(src);
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(url) && !broken;

  useEffect(() => {
    setBroken(false);
  }, [url]);

  return (
    <span className={`user-avatar ${className}`.trim()} style={{ width: size, height: size }} title={name || 'Profile'}>
      {showPhoto ? (
        <img
          src={url}
          alt=""
          width={size}
          height={size}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setBroken(true)}
        />
      ) : (
        <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
          <defs>
            <linearGradient id={`ua-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ba-accent, #7C5CFF)" />
              <stop offset="100%" stopColor="var(--ba-accent-b, #21D4FD)" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="#12141C" />
          <circle cx="20" cy="15" r="7.4" fill={`url(#ua-${uid})`} />
          <path d="M7.5 36.5c1.8-8.4 7.2-12.6 12.5-12.6S30.7 28.1 32.5 36.5" fill={`url(#ua-${uid})`} />
        </svg>
      )}
    </span>
  );
}
