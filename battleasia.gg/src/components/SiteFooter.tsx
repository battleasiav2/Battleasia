import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../lib/assets';
import { useI18n } from '../lib/i18n';
import { FALLBACK_SITE_SOCIALS, fetchSiteSocialLinks, type SiteSocialLink } from '../lib/siteSocials';
import { safeHref } from '../lib/safeHref';
import { PayChip, SocialGlyph } from './Icons';

const PARTNERS = [
  { label: 'battleasia.com', href: 'https://battleasia.com' },
  { label: 'baccoin.shop', href: 'https://baccoin.shop' },
  { label: 'battleasia.net', href: 'https://battleasia.net' },
  { label: 'pubg.com', href: 'https://www.pubg.com' },
  { label: 'bkash.com', href: 'https://www.bkash.com' },
  { label: 'nagadwallet.net', href: 'https://nagadwallet.net' },
];

function ExternalMark() {
  return (
    <svg className="footer-ext" width="12" height="12" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"
      />
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
      <div className="footer-grid">
        <section className="footer-col footer-col-follow" aria-labelledby="footer-follow">
          <h3 id="footer-follow">{t('footer.follow')}</h3>
          <div className="socials socials--footer">
            {socials.map((item) => {
              const href = safeHref(item.href);
              if (!href) return null;
              return (
                <a
                  key={item.label + href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.label}
                  aria-label={item.label}
                >
                  <SocialGlyph name={item.label} />
                </a>
              );
            })}
          </div>
          <div className="footer-brand-block">
            <img src={ASSETS.logoLg} width={40} height={40} alt="" />
            <div>
              <div className="brand-name">BATTLE ASIA</div>
              <p>{t('footer.tag')}</p>
              <small>© {new Date().getFullYear()} BattleAsia</small>
            </div>
          </div>
        </section>

        <section className="footer-col" aria-labelledby="footer-support">
          <h3 id="footer-support">{t('footer.support')}</h3>
          <ul className="footer-links">
            <li>
              <a className="mail" href="mailto:support@battleasia.gg">
                support@battleasia.gg
              </a>
            </li>
            <li>
              <a className="footer-support-cta" href="mailto:support@battleasia.gg">
                {t('footer.contactSupport')}
              </a>
            </li>
          </ul>
          <div className="footer-pays-block">
            <h4 className="footer-subhead">{t('footer.payments')}</h4>
            <div className="pays pays--footer">
              <PayChip kind="bkash" />
              <PayChip kind="nagad" />
              <PayChip kind="crypto" />
            </div>
          </div>
        </section>

        <section className="footer-col" aria-labelledby="footer-partners">
          <h3 id="footer-partners">{t('footer.partners')}</h3>
          <ul className="footer-links">
            {PARTNERS.map((p) => {
              const href = safeHref(p.href);
              if (!href) return null;
              return (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {p.label}
                    <ExternalMark />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <nav className="footer-col" aria-labelledby="footer-legal">
          <h3 id="footer-legal">{t('footer.legal')}</h3>
          <ul className="footer-links">
            <li>
              <Link to="/privacy-policy">{t('footer.privacy')}</Link>
            </li>
            <li>
              <Link to="/terms-and-conditions">{t('footer.terms')}</Link>
            </li>
            <li>
              <a href="/dashboard#rules">{t('footer.rules')}</a>
            </li>
            <li>
              <a href="/dashboard#how-to-play">{t('footer.how')}</a>
            </li>
            <li>
              <a href="/dashboard#about-us">{t('footer.about')}</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
