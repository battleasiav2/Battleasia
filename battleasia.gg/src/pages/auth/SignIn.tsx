import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordField } from '../../components/auth/PasswordField';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { AuthBack } from '../../components/auth/AuthBack';
import { ASSETS } from '../../lib/assets';
import { isApiError } from '../../lib/api';
import { markSignedIn, safeReturnTo, signIn } from '../../lib/auth';
import { focusFirstError, httpCopy, readRememberedEmail, sanitizeLine, writeRememberedEmail } from '../../lib/form';
import { registerPushToken } from '../../lib/push';
import { captureReferral } from '../../lib/ref';
import { useI18n } from '../../lib/i18n';
import { AuthTrustRow } from '../../components/auth/AuthTrustRow';

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
      markSignedIn(user);
      void registerPushToken('web');
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    } catch (err) {
      if (isApiError(err) && err.status === 403 && /verif/i.test(err.message)) {
        navigate(`/auth/email-verification?email=${encodeURIComponent(clean)}`);
        return;
      }
      if (isApiError(err) && err.status === 429) setWait(err.retryAfter || 60);
      const form = httpCopy(err, t, t('errors.login'));
      const fields = isApiError(err) ? err.fields || {} : {};
      setErrors({ ...fields, form: fields.form || form });
      focusFirstError([fields.email ? 'email' : fields.password ? 'password' : 'email']);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signin-page">
      <AuthBack to="/dashboard" />
      <div className="signin-layout">
        <section className="signin-brand">
          <div className="signin-logo">
            <img src={ASSETS.logo} width={40} height={40} alt="" />
            <span>BATTLEASIA</span>
          </div>
          <p className="signin-tagline">
            {t('auth.promo.line1')} {t('auth.promo.line2')}
          </p>
          <div className="signin-art-wrap">
            <img className="signin-art" src="/assets/hero/auth-login.webp?v=5" alt="" width={853} height={634} />
          </div>
          <p className="signin-foot">{t('auth.promo.lead')}</p>
        </section>

        <form className="signin-panel" onSubmit={onSubmit}>
          <h1>{t('auth.signinTitle')}</h1>
          {params.get('oauth') === 'app' ? <p className="signin-note">{t('auth.oauthApp')}</p> : null}
          {errors.form ? <p className="form-error">{errors.form}</p> : null}
          <label className="field" htmlFor="email">
            {t('auth.email')}
            <span className="field-control">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.emailPh') || 'you@email.com'}
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
          <label className="signin-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            {t('auth.remember')}
          </label>
          <button className="signin-submit" type="submit" disabled={busy || wait > 0}>
            {wait > 0 ? t('http.429').replace('{n}', String(wait)) : busy ? t('auth.signing') : t('auth.signin')}
          </button>
          <p className="signin-forgot">
            {t('auth.forgot')}? <Link to="/auth/forgot-password">{t('auth.resetHere')}</Link>
          </p>
          <div className="signin-divider">{t('auth.or')}</div>
          <SocialLogin returnTo={safeReturnTo(params.get('returnTo'))} />
          <Link className="signin-alt" to="/auth/sign-up">
            {t('auth.create')}
          </Link>
          <AuthTrustRow />
        </form>
      </div>
    </div>
  );
}
