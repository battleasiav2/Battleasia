import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { isApiError } from '../../lib/api';
import { forgotPassword } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('errors.email'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await forgotPassword(email);
      navigate(`/auth/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(isApiError(err) ? err.message : t('auth.sendFail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t('auth.forgot')} subtitle={t('auth.forgotSub')}>
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field" htmlFor="email">
          {t('auth.email')}
          <input id="email" type="email" autoComplete="email" value={email} disabled={busy} onChange={(e) => setEmail(e.target.value)} onBlur={(e) => setEmail(e.target.value.trim())} />
        </label>
        {error ? <p className="field-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? t('auth.sending') : t('auth.sendCode')}
        </button>
        <p className="auth-switch">
          <Link to="/auth/sign-in">{t('auth.back')}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
