import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminAuthShell } from '../components/AdminAuthShell';
import { PasswordField } from '../components/PasswordField';
import { isApiError } from '../lib/api';
import { adminSignIn, finishLogin, safeReturnTo, stashOtpPassword } from '../lib/auth';
import { focusFirstError, httpCopy, readRememberedEmail, sanitizeLine, writeRememberedEmail } from '../lib/form';
import { useI18n } from '../lib/i18n';

export function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const remembered = readRememberedEmail();
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!wait) return;
    const id = window.setInterval(() => setWait((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [wait]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || wait) return;
    const clean = sanitizeLine(email);
    if (!clean || !password) {
      setError(t('login.fail'));
      focusFirstError([clean ? 'password' : 'email']);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = await adminSignIn(clean, password);
      writeRememberedEmail(clean, remember);
      if (payload.otpRequired) {
        stashOtpPassword(password);
        navigate(`/auth/otp?email=${encodeURIComponent(clean)}&returnTo=${encodeURIComponent(params.get('returnTo') || '')}`);
        return;
      }
      finishLogin(payload);
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    } catch (err) {
      if (isApiError(err) && err.status === 429) setWait(err.retryAfter || 60);
      setError(httpCopy(err, t, t('login.fail')));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminAuthShell title={t('login.title')} subtitle={t('login.sub')}>
      <form className="auth-form" onSubmit={onSubmit}>
        {error ? <p className="form-error">{error}</p> : null}
        <label className="field" htmlFor="email">
          {t('login.email')}
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={busy || wait > 0}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => setEmail(sanitizeLine(e.target.value))}
          />
        </label>
        <PasswordField
          id="password"
          label={t('login.password')}
          value={password}
          autoComplete="current-password"
          disabled={busy || wait > 0}
          onChange={setPassword}
        />
        <label className="auth-switch">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> {t('auth.remember')}
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy || wait > 0}>
          {wait > 0 ? t('http.429').replace('{n}', String(wait)) : busy ? t('login.signing') : t('login.continue')}
        </button>
        <p className="auth-switch">
          {t('login.arena')} <a href={(import.meta.env.VITE_PLAYER_URL as string) || 'https://battleasia.gg'}>battleasia.gg</a>
        </p>
      </form>
    </AdminAuthShell>
  );
}
