import type { ReactNode } from 'react';
import { ASSETS } from '../../lib/assets';
import { getMainAppUrl } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import { LocaleSelect } from '../LocaleSelect';
import { ThemeDock } from '../ThemeDock';
import { AuthFormSeal } from './AuthFormSeal';
import { AuthTrustRow } from './AuthTrustRow';

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
            <img src={ASSETS.logo} width={48} height={48} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>SHOP</span>
            </div>
          </a>
          <div className="auth-toolbar-right">
            <LocaleSelect />
            <ThemeDock />
          </div>
        </div>
        <AuthFormSeal />
        <h1>{title}</h1>
        {subtitle ? <p className="auth-sub">{subtitle}</p> : null}
        {children}
        <AuthTrustRow />
      </section>
      <aside className="auth-hero">
        <div className="hero-media" aria-hidden>
          <img
            className="hero-poster"
            src="/assets/hero/auth-login.png?v=3"
            alt=""
            width={960}
            height={1280}
            decoding="async"
          />
          <span className="hero-vignette" />
          <span className="auth-hero-shade" />
        </div>
        <div className="auth-promo">
          <span className="auth-promo-badge">{t('auth.heroBadge')}</span>
          <h2 className="auth-promo-title">
            <span>{t('auth.promo.line1')}</span>
            <span className="auth-promo-accent">{t('auth.promo.line2')}</span>
          </h2>
          <p className="auth-promo-lead">{t('auth.promo.lead')}</p>
        </div>
      </aside>
    </div>
  );
}
