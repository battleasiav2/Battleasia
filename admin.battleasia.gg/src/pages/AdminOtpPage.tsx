import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminAuthShell } from '../components/AdminAuthShell';
import { OtpInputs } from '../components/OtpInputs';
import { isApiError } from '../lib/api';
import { adminVerifyOtp, finishLogin, safeReturnTo, takeOtpPassword } from '../lib/auth';
import { useI18n } from '../lib/i18n';

export function AdminOtpPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = (params.get('email') || '').trim();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  async function verify(next = code) {
    const password = takeOtpPassword();
    if (next.length !== 6) {
      setError(t('otp.need'));
      return;
    }
    if (!password) {
      setError(t('otp.expired'));
      navigate('/auth/login');
      return;
    }
    setBusy(true);
    try {
      const payload = await adminVerifyOtp(email, password, next);
      finishLogin(payload);
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    } catch (err) {
      setError(isApiError(err) ? err.message : t('otp.invalid'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminAuthShell title={t('otp.title')} subtitle={t('otp.sub')}>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          void verify();
        }}
      >
        {error ? <p className="form-error">{error}</p> : null}
        <OtpInputs value={code} onChange={(v) => { setCode(v); if (v.length === 6) void verify(v); }} disabled={busy} error={error} />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {t('otp.verify')}
        </button>
        <p className="auth-switch">{seconds > 0 ? `${t('otp.resendIn')} ${seconds}s` : t('otp.requestNew')}</p>
      </form>
    </AdminAuthShell>
  );
}
