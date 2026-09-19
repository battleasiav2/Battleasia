import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { OtpInputs } from '../../components/auth/OtpInputs';
import { isApiError } from '../../lib/api';
import { markShopGate, resendVerification, verifyEmailSignup } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

export function EmailVerificationPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = (params.get('email') || '').trim();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const masked = useMemo(() => {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    return `${name[0]}***@${domain}`;
  }, [email]);

  async function verify(nextCode = code) {
    if (nextCode.length !== 6) {
      setError(t('errors.otp'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const user = await verifyEmailSignup(email, nextCode);
      markShopGate(user);
      navigate('/user/shop', { replace: true });
    } catch (err) {
      setError(isApiError(err) ? err.message : t('errors.otp'));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (seconds > 0) return;
    setBusy(true);
    try {
      await resendVerification(email);
      setSeconds(60);
      setInfo(t('auth.codeSent'));
    } catch (err) {
      setError(isApiError(err) ? err.message : t('auth.sendFail'));
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <AuthShell title={t('auth.emailMissing')} subtitle={t('auth.verifyNeed')}>
        <p className="auth-switch">
          <Link className="btn btn-primary" to="/auth/sign-up">
            {t('auth.goSignup')}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.verify')} subtitle={`${t('auth.verifySub')} ${masked}`}>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          void verify();
        }}
      >
        <OtpInputs
          value={code}
          disabled={busy}
          error={error}
          onChange={(next) => {
            setCode(next);
            if (next.length === 6) void verify(next);
          }}
        />
        {info ? <p className="auth-ref">{info}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? t('auth.verifying') : t('auth.verifyBtn')}
        </button>
        <button className="btn btn-ghost" type="button" disabled={busy || seconds > 0} onClick={() => void resend()}>
          {seconds > 0 ? `${t('auth.resend')} ${seconds}s` : t('auth.resend')}
        </button>
      </form>
    </AuthShell>
  );
}
