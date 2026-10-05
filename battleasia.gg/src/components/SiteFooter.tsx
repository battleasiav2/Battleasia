import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { FALLBACK_SITE_SOCIALS, fetchSiteSocialLinks, type SiteSocialLink } from '../lib/siteSocials';
import { safeHref } from '../lib/safeHref';

const FW_LOGO = '/assets/fw/logo-battleasia.png';

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes('facebook')) {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M13 10V7.5c0-.8.7-1.5 1.5-1.5H16V3h-2.2C11.7 3 10 4.8 10 7v3H7v3h3v7h3v-7h2.7l.3-3H13z" />
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
      <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 9 2 12 2 12s0 3 .4 4.8a2.5 2.5 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const [socials, setSocials] = useState<SiteSocialLink[]>(FALLBACK_SITE_SOCIALS);

  useEffect(() => {
    fetchSiteSocialLinks().then(setSocials);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid reveal">
          <div>
            <div className="footer-social">
              {socials.slice(0, 4).map((item) => {
                const href = safeHref(item.href);
                if (!href) return null;
                return (
                  <a key={item.label + href} href={href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                    <SocialIcon label={item.label} />
                  </a>
                );
              })}
            </div>
            <img src={FW_LOGO} alt="BattleAsia" className="logo-img logo-img--lg mb-md" width={120} height={120} />
            <p className="text-muted mb-md">{t('footer.tag')}</p>
            <a href="mailto:support@battleasia.gg" className="text-link">
              support@battleasia.gg
            </a>
            <p className="text-muted text-muted--sm" style={{ marginTop: 16 }}>
              © {new Date().getFullYear()} BattleAsia
            </p>
          </div>
          <div>
            <h4>{t('footer.support')}</h4>
            <ul>
              <li>
                <a href="/dashboard#rules">{t('footer.rules')}</a>
              </li>
              <li>
                <a href="mailto:support@battleasia.gg">Email</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t('footer.legal')}</h4>
            <ul>
              <li>
                <Link className="link-btn" to="/terms-and-conditions">{t('footer.terms')}</Link>
              </li>
              <li>
                <Link className="link-btn" to="/privacy-policy">{t('footer.privacy')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t('footer.quick')}</h4>
            <ul>
              <li>
                <a href="#play">{t('nav.play')}</a>
              </li>
              <li>
                <a href="#about-us">{t('nav.about')}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="payment-strip reveal">
          <span className="pay-badge pay-badge--bkash">
            <svg className="pay-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#e2136e" />
              <path fill="#fff" d="M8 7h3.2c2 0 3.3 1 3.3 2.6 0 1.1-.6 2-1.7 2.4l2.2 3.5h-2.4l-2-3.2H10v3.2H8V7zm2 4.2h1.1c.9 0 1.4-.4 1.4-1.1s-.5-1.1-1.4-1.1H10v2.2z" />
            </svg>
            bKash
          </span>
          <span className="pay-badge pay-badge--nagad">
            <svg className="pay-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3" fill="#f69220" />
              <path fill="#fff" d="M7 9h10v2H7V9zm0 4h7v2H7v-2z" />
            </svg>
            Nagad
          </span>
          <span className="pay-badge pay-badge--crypto">
            <svg className="pay-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#f7931a" />
              <path fill="#fff" d="M13.2 11.2c.2-.6-.1-1-.7-1.2l.3-1.2-.8-.2-.3 1.1c-.2 0-.4-.1-.6-.1l.3-1.1-.8-.2-.3 1.2c-.2 0-.3 0-.5-.1l-1.1-.3-.2.9s.6.1.6.2c.3.1.4.2.3.4l-.4 1.6c0 .1 0 .1-.1.1l.2-.1-.3 1.1c0 .2.1.4.3.5.1.1.4.2.7.2l-.3 1.2.8.2.3-1.2c.2 0 .4.1.6.1l-.3 1.2.8.2.3-1.2c1.3.2 2.2 0 2.6-1 .3-.8 0-1.3-.6-1.6.4-.1.8-.4.9-1z" />
            </svg>
            Crypto
          </span>
        </div>
      </div>
    </footer>
  );
}
