import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthTrustRow } from '../../components/auth/AuthTrustRow';
import { PasswordField } from '../../components/auth/PasswordField';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { ShopPublicHeader } from '../../components/ShopPublicHeader';
import { ASSETS } from '../../lib/assets';
import { isApiError } from '../../lib/api';
import { markShopGate, clearShopGate, isShopAuthed, safeReturnTo, signIn } from '../../lib/auth';
import { focusFirstError, httpCopy, readRememberedEmail, sanitizeLine, writeRememberedEmail } from '../../lib/form';
import { registerPushToken } from '../../lib/push';
import { captureReferral } from '../../lib/ref';
import { useI18n } from '../../lib/i18n';

export function SignInPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const remembered = readRememberedEmail();
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    captureReferral();
  }, []);

  useEffect(() => {
    const code = params.get('oauth');
    if (!code || code === 'app') return;
    const keys: Record<string, string> = {
      denied: 'auth.oauthDenied',
      disabled: 'auth.oauthDisabled',
      email: 'auth.oauthEmail',
    };
    setErrors({ form: t(keys[code] || 'auth.oauthFailed') });
  }, [params, t]);

  useEffect(() => {
    if (params.get('reauth') === '1') {
      clearShopGate();
      return;
    }
    if (isShopAuthed()) {
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    }
  }, [navigate, params]);

  useEffect(() => {
    if (!wait) return;
    const id = window.setInterval(() => setWait((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [wait]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || wait) return;
    const clean = sanitizeLine(email);
    const next: Record<string, string> = {};
    if (!clean) next.email = t('errors.email');
    if (!password) next.password = t('errors.password');
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirstError([next.email ? 'email' : 'password']);
      return;
    }
    setBusy(true);
    try {
      const user = await signIn(clean, password);
      writeRememberedEmail(clean, remember);
      markShopGate(user);
      void registerPushToken('web');
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    } catch (err) {
      if (isApiError(err) && err.status === 403 && /verif/i.test(err.message)) {
        navigate(`/auth/email-verification?email=${encodeURIComponent(clean)}`);
        return;
      }
      if (isApiError(err) && err.status === 429) setWait(err.retryAfter || 60);
      setErrors({ form: httpCopy(err, t, t('errors.login')) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shop-public">
      <ShopPublicHeader />
      <div className="signin-page signin-page--landing">
      <section className="landing-auth" aria-labelledby="shop-signin-title">
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

        <form className="signin-panel landing-auth-form" onSubmit={onSubmit}>
          <h1 id="shop-signin-title">{t('auth.welcome')}</h1>
          <p className="signin-sub">{t('auth.welcomeLead')}</p>
          {params.get('oauth') === 'app' ? <p className="signin-note">{t('auth.oauthApp')}</p> : null}
          {errors.form ? <p className="form-error">{errors.form}</p> : null}
          <label className="field" htmlFor="email">
            {t('auth.emailAddress')}
            <span className="field-control">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                disabled={busy || wait > 0}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => setEmail(sanitizeLine(e.target.value))}
              />
            </span>
            {errors.email ? <span className="field-error">{errors.email}</span> : null}
          </label>
          <PasswordField
            id="password"
            label={t('auth.password')}
            value={password}
            autoComplete="current-password"
            disabled={busy || wait > 0}
            error={errors.password}
            onChange={setPassword}
          />
          <div className="landing-auth-meta">
            <label className="signin-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              {t('auth.remember')}
            </label>
            <Link to="/auth/forgot-password">{t('auth.forgotLink')}</Link>
          </div>
          <button className="signin-submit" type="submit" disabled={busy || wait > 0}>
            <span>
              {wait > 0 ? t('http.429').replace('{n}', String(wait)) : busy ? t('auth.signing') : t('cta.signin')}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <SocialLogin returnTo={safeReturnTo(params.get('returnTo'))} />
          <AuthTrustRow />
        </form>
      </section>
      </div>
    </div>
  );
}
