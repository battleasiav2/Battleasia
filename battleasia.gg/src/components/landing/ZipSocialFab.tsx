import { useEffect, useState } from 'react';
import { FALLBACK_SITE_SOCIALS, fetchSiteSocialLinks, type SiteSocialLink } from '../../lib/siteSocials';
import { safeHref } from '../../lib/safeHref';

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes('facebook')) {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13 10V7.5c0-.8.7-1.5 1.5-1.5H16V3h-2.2C11.7 3 10 4.8 10 7v3H7v3h3v7h3v-7h2.7l.3-3H13z"
        />
      </svg>
    );
  }
  if (key.includes('discord')) {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.9 5a16 16 0 0 0-4-1.4l-.2.4a14 14 0 0 0-3.4 0l-.2-.4A16 16 0 0 0 7 5 12 12 0 0 0 5 17.1c1.2.9 2.4 1.5 3.6 1.5.3-.4.6-.9.8-1.4-.9-.3-1.7-.7-2.5-1.2.2-.1.4-.3.6-.4 4.8 2.2 10 2.2 14.7 0 .2.1.4.3.6.4-.8.5-1.6.9-2.5 1.2.2.5.5 1 .8 1.4 1.2 0 2.4-.6 3.6-1.5A12 12 0 0 0 18.9 5zM9.7 14.6c-.9 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.8.8 1.7 1.8-.8 1.8-1.7 1.8zm4.6 0c-.9 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.8.8 1.7 1.8-.8 1.8-1.7 1.8z"
        />
      </svg>
    );
  }
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 9 2 12 2 12s0 3 .4 4.8a2.5 2.5 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"
      />
    </svg>
  );
}

export function ZipSocialFab() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<SiteSocialLink[]>(FALLBACK_SITE_SOCIALS.slice(0, 3));

  useEffect(() => {
    fetchSiteSocialLinks().then((rows) => {
      if (rows.length) setLinks(rows.slice(0, 3));
    });
  }, []);

  return (
    <div className={`fab-social${open ? ' is-open' : ''}`}>
      <div className="fab-items">
        {links.map((item) => {
          const href = safeHref(item.href);
          if (!href) return null;
          return (
            <a key={item.label + href} href={href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
              <SocialIcon label={item.label} />
            </a>
          );
        })}
      </div>
      <button type="button" className="fab-main" aria-label="Social links" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        +
      </button>
    </div>
  );
}
