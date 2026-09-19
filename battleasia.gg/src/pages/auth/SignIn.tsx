import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { PasswordField } from '../../components/auth/PasswordField';
import { isApiError } from '../../lib/api';
import { markSignedIn, safeReturnTo, signIn } from '../../lib/auth';
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
      setErrors({ form: httpCopy(err, t, t('errors.login')) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t('auth.signin')} subtitle={t('auth.signinSub')}>
      <form className="auth-form" onSubmit={onSubmit}>
        {errors.form ? <p className="form-error">{errors.form}</p> : null}
        <label className="field" htmlFor="email">
          {t('auth.email')}
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={busy || wait > 0}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => setEmail(sanitizeLine(e.target.value))}
          />
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
        <div className="auth-meta">
          <label className="auth-switch">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> {t('auth.remember')}
          </label>
          <Link className="auth-link" to="/auth/forgot-password">
            {t('auth.forgotLink')}
          </Link>
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || wait > 0}>
          {wait > 0 ? t('http.429').replace('{n}', String(wait)) : busy ? t('auth.signing') : t('auth.signin')}
        </button>
        <p className="auth-switch">
          {t('auth.newhere')} <Link to="/auth/sign-up">{t('auth.create')}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
