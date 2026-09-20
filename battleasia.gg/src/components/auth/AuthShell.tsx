import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../lib/assets';
import { useI18n } from '../../lib/i18n';
import { LocaleSelect } from '../LocaleSelect';
import { ThemeDock } from '../ThemeDock';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: Props) {
  const { t } = useI18n();
  return (
    <div className="auth-shell">
      <section className="auth-form-pane">
        <div className="auth-toolbar">
          <Link className="brand" to="/dashboard">
            <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>2.0</span>
            </div>
          </Link>
          <div className="auth-toolbar-right">
            <LocaleSelect />
            <ThemeDock />
          </div>
        </div>
        <h1>{title}</h1>
        {subtitle ? <p className="auth-sub">{subtitle}</p> : null}
        {children}
      </section>
      <aside className="auth-hero">
        <div className="hero-media" aria-hidden>
          <img
            className="hero-poster"
            src="/assets/hero/hero-live-poster.webp"
            alt=""
            width={960}
            height={1280}
            decoding="async"
          />
          <span className="hero-vignette" />
          <span className="auth-hero-shade" />
        </div>
        <div className="auth-promo">
          <span className="auth-promo-badge">{t('hero.eyebrow')}</span>
          <h2 className="auth-promo-title">
            <span>{t('auth.promo.line1')}</span>
            <span className="auth-promo-accent">{t('auth.promo.line2')}</span>
          </h2>
          <p className="auth-promo-lead">{t('auth.promo.lead')}</p>
          <div className="auth-promo-stats">
            <article>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path
                  d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 7.2c.9-3.4 3.4-5.2 6.5-5.2s5.6 1.8 6.5 5.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <small>{t('auth.promo.players')}</small>
              <b>{t('auth.promo.playersVal')}</b>
            </article>
            <article>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path
                  d="M4.5 8.5h15v9.2a1.8 1.8 0 0 1-1.8 1.8H6.3A1.8 1.8 0 0 1 4.5 17.7V8.5Zm2.2-3h10.6l1.2 3H5.5l1.2-3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <small>{t('auth.promo.prizes')}</small>
              <b>{t('auth.promo.prizesVal')}</b>
            </article>
            <article>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path
                  d="M12 3.5 14.2 8l4.8.5-3.6 3.3.1 4.7L12 14.8 8.5 16.5l.1-4.7L5 8.5 9.8 8 12 3.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <small>{t('auth.promo.rooms')}</small>
              <b>{t('auth.promo.roomsVal')}</b>
            </article>
          </div>
        </div>
      </aside>
    </div>
  );
}
