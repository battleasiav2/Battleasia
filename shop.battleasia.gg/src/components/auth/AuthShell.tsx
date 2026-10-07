import type { ReactNode } from 'react';
import { ASSETS } from '../../lib/assets';
import { useI18n } from '../../lib/i18n';
import { AuthBack } from './AuthBack';
import { AuthTrustRow } from './AuthTrustRow';
import { ShopPublicHeader } from '../ShopPublicHeader';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: Props) {
  const { t } = useI18n();
  return (
    <div className="shop-public">
      <ShopPublicHeader />
      <div className="signin-page signin-page--landing">
      <AuthBack to="/auth/sign-in" />
      <section className="landing-auth landing-auth--flow" aria-labelledby="shop-auth-title">
        <div className="landing-auth-art">
          <img
            className="landing-auth-photo"
            src="/assets/hero/auth-bac-panel-clean.jpg"
            alt=""
            width={768}
            height={1024}
          />
          <div>
            <p className="landing-auth-bac">
              <img src={ASSETS.coin} width={18} height={18} alt="" />
              <span>{t('auth.bacLine')}</span>
            </p>
            <h2 className="landing-auth-promo">{t('auth.matchStarts')}</h2>
            <p>{t('auth.matchCopy')}</p>
          </div>
          <p className="landing-auth-region">{t('auth.region')}</p>
        </div>
        <section className="signin-panel landing-auth-form">
          <h1 id="shop-auth-title">{title}</h1>
          {subtitle ? <p className="signin-sub">{subtitle}</p> : null}
          {children}
          <AuthTrustRow />
        </section>
      </section>
      </div>
    </div>
  );
}
