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

export function SiteFooter() {
  const { t } = useI18n();
  const [socials, setSocials] = useState<SiteSocialLink[]>(FALLBACK_SITE_SOCIALS);

  useEffect(() => {
    fetchSiteSocialLinks().then(setSocials);
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-cols">
        <div>
          <h3>{t('footer.follow')}</h3>
          <div className="socials">
            {socials.map((item) => {
              const href = safeHref(item.href);
              if (!href) return null;
              return (
              <a key={item.label + href} href={href} target="_blank" rel="noopener noreferrer" title={item.label}>
                <SocialGlyph name={item.label} />
              </a>
              );
            })}
          </div>
        </div>
        <div className="footer-brand">
          <img src={ASSETS.logo} width={72} height={72} alt="BattleAsia" />
          <div className="brand-name">
            BATTLE ASIA <span>2.0</span>
          </div>
          <p>{t('footer.tag')}</p>
          <nav>
            <Link to="/privacy-policy">{t('footer.privacy')}</Link>
            <Link to="/terms-and-conditions">{t('footer.terms')}</Link>
            <a href="/dashboard#rules">{t('footer.rules')}</a>
            <a href="/dashboard#how-to-play">{t('footer.how')}</a>
            <a href="/dashboard#about-us">{t('footer.about')}</a>
          </nav>
          <small>© {new Date().getFullYear()} BattleAsia</small>
        </div>
        <div>
          <h3>{t('footer.support')}</h3>
          <a className="mail" href="mailto:support@battleasia.gg">
            support@battleasia.gg
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="pays">
          <PayChip kind="bkash" />
          <PayChip kind="nagad" />
          <PayChip kind="crypto" />
        </div>
        <div className="partners">
          {PARTNERS.map((p) => {
            const href = safeHref(p.href);
            if (!href) return null;
            return (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer">
              {p.label}
            </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
