import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { OtpInputs } from '../../components/auth/OtpInputs';
import { PasswordField } from '../../components/auth/PasswordField';
import { isApiError } from '../../lib/api';
import { forgotPassword, resetPassword } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

export function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = (params.get('email') || '').trim();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return setError(t('errors.otp'));
    if (password.length < 8) return setError(t('errors.min8'));
    if (password !== confirm) return setError(t('errors.mismatch'));
    setBusy(true);
    setError('');
    try {
      await resetPassword(email, code, password);
      navigate('/auth/sign-in');
    } catch (err) {
      setError(isApiError(err) ? err.message : t('errors.otp'));
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <AuthShell title={t('auth.reset')} subtitle={t('auth.resetNeed')}>
        <p className="auth-switch">
          <Link className="btn btn-primary" to="/auth/forgot-password">
            {t('auth.sendCode')}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.reset')} subtitle={t('auth.resetSub')}>
      <form className="auth-form" onSubmit={onSubmit}>
        <OtpInputs value={code} onChange={setCode} disabled={busy} />
        <PasswordField id="password" label={t('auth.newPassword')} value={password} autoComplete="new-password" disabled={busy} meter onChange={setPassword} />
        <PasswordField id="confirm" label={t('auth.confirm')} value={confirm} autoComplete="new-password" disabled={busy} onChange={setConfirm} />
        {error ? <p className="field-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? t('auth.sending') : t('auth.reset')}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          disabled={busy || seconds > 0}
          onClick={async () => {
            try {
              await forgotPassword(email);
              setSeconds(60);
            } catch (err) {
              setError(isApiError(err) ? err.message : t('errors.otp'));
            }
          }}
        >
          {seconds > 0 ? `${t('auth.resend')} ${seconds}s` : t('auth.resend')}
        </button>
      </form>
    </AuthShell>
  );
}
