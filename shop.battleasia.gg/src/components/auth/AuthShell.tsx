import type { ReactNode } from 'react';
import { ASSETS } from '../../lib/assets';
import { getMainAppUrl } from '../../lib/auth';
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
          <a className="brand" href={getMainAppUrl()}>
            <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>SHOP</span>
            </div>
          </a>
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
              <small>{t('auth.promo.players')}</small>
              <b>{t('auth.promo.playersVal')}</b>
            </article>
            <article>
              <small>{t('auth.promo.prizes')}</small>
              <b>{t('auth.promo.prizesVal')}</b>
            </article>
            <article>
              <small>{t('auth.promo.rooms')}</small>
              <b>{t('auth.promo.roomsVal')}</b>
            </article>
          </div>
        </div>
      </aside>
    </div>
  );
}
