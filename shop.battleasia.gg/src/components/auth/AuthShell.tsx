import type { ReactNode } from 'react';
import { ASSETS } from '../../lib/assets';
import { getMainAppUrl } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import { AuthBack } from './AuthBack';
import { AuthTrustRow } from './AuthTrustRow';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: Props) {
  const { t } = useI18n();
  return (
    <div className="signin-page">
      <AuthBack to="/auth/sign-in" />
      <div className="signin-layout">
        <section className="signin-brand">
          <a className="signin-logo" href={getMainAppUrl()}>
            <img src={ASSETS.logo} width={40} height={40} alt="" />
            <span>BATTLEASIA</span>
          </a>
          <p className="signin-tagline">
            {t('auth.promo.line1')} {t('auth.promo.line2')}
          </p>
          <div className="signin-art-wrap">
            <img className="signin-art" src="/assets/hero/auth-login.webp?v=5" alt="" width={853} height={634} />
          </div>
          <p className="signin-foot">{t('auth.promo.lead')}</p>
        </section>
        <section className="signin-panel">
          <h1>{title}</h1>
          {subtitle ? <p className="signin-sub">{subtitle}</p> : null}
          {children}
          <AuthTrustRow />
        </section>
      </div>
    </div>
  );
}
