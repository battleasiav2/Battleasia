import { useEffect, useState } from 'react';
import { SocialGlyph } from './Icons';
import { FALLBACK_SITE_SOCIALS, fetchSiteSocialLinks, type SiteSocialLink } from '../lib/siteSocials';
import { safeHref } from '../lib/safeHref';

const FAB_FALLBACK = FALLBACK_SITE_SOCIALS.filter((l) =>
  ['facebook', 'youtube', 'whatsapp', 'tiktok'].includes(l.label.toLowerCase())
);

export function SocialFab() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<SiteSocialLink[]>(FAB_FALLBACK);

  useEffect(() => {
    fetchSiteSocialLinks().then((rows) => {
      if (rows.length) setLinks(rows.slice(0, 8));
    });
  }, []);

  return (
    <div className={`social-fab${open ? ' is-open' : ''}`}>
      {open
        ? links.map((item, i) => {
            const href = safeHref(item.href);
            if (!href) return null;
            return (
            <a
              key={item.label + href}
              className="social-fab-item"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.label}
              style={{ color: item.color || '#fff', transform: `translateY(${-56 * (i + 1)}px)` }}
            >
              <SocialGlyph name={item.label} />
            </a>
            );
          })
        : null}
      <button type="button" className="social-fab-btn" aria-expanded={open} aria-label="Social links" onClick={() => setOpen((v) => !v)}>
        {open ? '×' : '+'}
      </button>
    </div>
  );
}
