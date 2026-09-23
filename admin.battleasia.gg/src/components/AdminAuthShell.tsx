import type { ReactNode } from 'react';
import { ASSETS } from '../lib/assets';
import { useI18n } from '../lib/i18n';
import { LocaleSelect } from './LocaleSelect';
import { ThemeDock } from './ThemeDock';

const PLAYER = (import.meta.env.VITE_PLAYER_URL as string | undefined) || 'https://battleasia.gg';

export function AdminAuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="auth-shell">
      <section className="auth-form-pane">
        <div className="auth-toolbar">
          <a className="brand" href={PLAYER}>
            <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>ADMIN</span>
            </div>
          </a>
          <div className="auth-toolbar-right">
            <LocaleSelect />
            <ThemeDock />
          </div>
        </div>
        <p className="auth-staff-pill">{t('login.staffPill')}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="auth-sub">{subtitle}</p> : null}
        {children}
      </section>
      <aside className="auth-hero">
        <div className="hero-media" aria-hidden>
          <img
            className="hero-poster"
            src="/assets/hero/auth-login.png?v=4"
            alt=""
            width={960}
            height={1280}
            decoding="async"
          />
          <span className="hero-vignette" />
          <span className="auth-hero-shade" />
        </div>
        <div className="auth-promo">
          <span className="auth-promo-badge">{t('login.heroBadge')}</span>
          <h2 className="auth-promo-title">
            <span>{t('login.promo.line1')}</span>
            <span className="auth-promo-accent">{t('login.promo.line2')}</span>
          </h2>
          <p className="auth-promo-lead">{t('login.promo.lead')}</p>
        </div>
      </aside>
    </div>
  );
}
