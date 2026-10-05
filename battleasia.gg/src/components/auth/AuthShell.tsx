import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="auth-page-fw grain signin-page">
      <AuthBack to="/dashboard" />
      <div className="auth-page-shell">
        <section className="modal-art modal-brand-panel" aria-hidden={false}>
          <Link to="/dashboard" tabIndex={-1} aria-label="BattleAsia home">
            <img
              src="/assets/fw/logo-battleasia.png"
              alt=""
              className="logo-img"
              width={200}
              height={200}
              loading="eager"
            />
          </Link>
          <p className="modal-brand-tagline">{t('auth.promo.line1')}</p>
          <p className="text-muted text-muted--sm" style={{ marginTop: 8, maxWidth: 280 }}>
            {t('auth.promo.lead')}
          </p>
        </section>
        <section className="modal-form-wrap signin-panel">
          <AuthTrustRow />
          <h1>{title}</h1>
          {subtitle ? <p className="signin-sub">{subtitle}</p> : null}
          {children}
        </section>
      </div>
    </div>
  );
}
