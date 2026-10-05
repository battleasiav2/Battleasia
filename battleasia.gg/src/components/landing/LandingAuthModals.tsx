import { useEffect, useMemo, useState } from 'react';
import { isApiError } from '../../lib/api';
import {
  forgotPassword,
  markSignedIn,
  resendVerification,
  resetPassword,
  signIn,
  verifyEmailSignup,
} from '../../lib/auth';
import { focusFirstError, httpCopy, readRememberedEmail, sanitizeLine, writeRememberedEmail } from '../../lib/form';
import { registerPushToken } from '../../lib/push';
import { useI18n } from '../../lib/i18n';
import { PasswordField } from '../auth/PasswordField';
import { SocialLogin } from '../auth/SocialLogin';
import { OtpInputs } from '../auth/OtpInputs';
import type { LandingAuthView } from '../../lib/landingAuth';
import { AuthModalSignUpForm } from './AuthModalSignUpForm';

const FW_LOGO = '/assets/fw/logo-battleasia.png';
const FW_COIN = '/assets/fw/bac-coin.webp';

type Props = {
  view: LandingAuthView | null;
  returnTo: string;
  email: string;
  oauth: string | null;
  onViewChange: (view: LandingAuthView, patch?: { email?: string }) => void;
  onClose: () => void;
  onSignedIn: (returnTo: string) => void;
};

function TrustLine() {
  const { t } = useI18n();
  return (
    <div className="trust-row">
      {t('auth.trustSecure')} · {t('auth.trustFair')} · {t('auth.trustCash')}
    </div>
  );
}

function BrandPanel() {
  const { t } = useI18n();
  return (
    <div className="modal-brand-panel">
      <img src={FW_LOGO} alt="" className="logo-img" width={200} height={200} loading="lazy" />
      <p className="modal-brand-tagline">{t('auth.promo.line1')}</p>
      <span className="bac-unit" style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <img src={FW_COIN} alt="" className="bac-coin bac-coin--sm" width={20} height={20} />
        <span>{t('auth.promo.lead')}</span>
      </span>
    </div>
  );
}

export function LandingAuthModals({ view, returnTo, email, oauth, onViewChange, onClose, onSignedIn }: Props) {
  const { t } = useI18n();
  const open = view !== null;
  const narrow = view === 'forgot' || view === 'reset' || view === 'otp';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.querySelector('.landing-fw')?.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = prev;
      document.querySelector('.landing-fw')?.classList.remove('modal-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !view) return null;

  return (
    <div className="modal-root is-open" aria-hidden={false} role="dialog">
      <div className="modal-backdrop" aria-hidden onClick={onClose} />
      <div className={`modal-panel${narrow ? ' modal-panel--narrow' : ''}`}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        {!narrow ? <BrandPanel /> : null}
        <div className="modal-form-wrap">
          <TrustLine />
          {view === 'signin' ? (
            <SignInModalBody
              returnTo={returnTo}
              oauth={oauth}
              onForgot={() => onViewChange('forgot')}
              onSignup={() => onViewChange('signup')}
              onNeedOtp={(addr) => onViewChange('otp', { email: addr })}
              onSignedIn={onSignedIn}
            />
          ) : null}
          {view === 'signup' ? (
            <>
              <h2>{t('auth.create')}</h2>
              <AuthModalSignUpForm
                onNeedOtp={(addr) => onViewChange('otp', { email: addr })}
                onSwitchSignIn={() => onViewChange('signin')}
              />
            </>
          ) : null}
          {view === 'forgot' ? (
            <ForgotModalBody
              onSent={(addr) => onViewChange('reset', { email: addr })}
              onBack={() => onViewChange('signin')}
            />
          ) : null}
          {view === 'reset' ? (
            <ResetModalBody email={email} onDone={() => onViewChange('signin')} onForgot={() => onViewChange('forgot')} />
          ) : null}
          {view === 'otp' ? (
            <OtpModalBody email={email} returnTo={returnTo} onSignedIn={onSignedIn} onSignup={() => onViewChange('signup')} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SignInModalBody({
  returnTo,
  oauth,
  onForgot,
  onSignup,
  onNeedOtp,
  onSignedIn,
}: {
  returnTo: string;
  oauth: string | null;
  onForgot: () => void;
  onSignup: () => void;
  onNeedOtp: (email: string) => void;
  onSignedIn: (returnTo: string) => void;
}) {
  const { t } = useI18n();
  const remembered = readRememberedEmail();
  const [addr, setAddr] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!oauth || oauth === 'app') return;
    const keys: Record<string, string> = {
      denied: 'auth.oauthDenied',
      disabled: 'auth.oauthDisabled',
      email: 'auth.oauthEmail',
      failed: 'auth.oauthFailed',
    };
    setErrors({ form: t(keys[oauth] || 'auth.oauthFailed') });
  }, [oauth, t]);

  useEffect(() => {
    if (!wait) return;
    const id = window.setInterval(() => setWait((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [wait]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || wait) return;
    const clean = sanitizeLine(addr);
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
      onSignedIn(returnTo);
    } catch (err) {
      if (isApiError(err) && err.status === 403 && /verif/i.test(err.message)) {
        onNeedOtp(clean);
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
    <form className="modal-form" onSubmit={onSubmit}>
      <h2 id="signin-title">{t('auth.signinTitle')}</h2>
      {oauth === 'app' ? <p className="text-muted text-muted--sm">{t('auth.oauthApp')}</p> : null}
      {errors.form ? <p className="form-error">{errors.form}</p> : null}
      <label className="field" htmlFor="signin-email">
        {t('auth.email')}
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPh') || 'you@email.com'}
          value={addr}
          disabled={busy || wait > 0}
          onChange={(e) => setAddr(e.target.value)}
          onBlur={(e) => setAddr(sanitizeLine(e.target.value))}
        />
        {errors.email ? <span className="field-error">{errors.email}</span> : null}
      </label>
      <PasswordField
        id="signin-password"
        label={t('auth.password')}
        value={password}
        autoComplete="current-password"
        disabled={busy || wait > 0}
        error={errors.password}
        onChange={setPassword}
      />
      <label className="checkbox-row">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span>{t('auth.remember')}</span>
      </label>
      <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 12 }} disabled={busy || wait > 0}>
        {wait > 0 ? t('http.429').replace('{n}', String(wait)) : busy ? t('auth.signing') : t('auth.signin')}
      </button>
      <p style={{ textAlign: 'center', margin: '12px 0 0' }}>
        <button type="button" className="link-btn" onClick={onForgot}>
          {t('auth.forgot')}
        </button>
      </p>
      <SocialLogin returnTo={returnTo} variant="modal" />
      <p className="form-links">
        {t('auth.newhere')}{' '}
        <button type="button" className="link-btn" onClick={onSignup}>
          {t('auth.create')}
        </button>
      </p>
    </form>
  );
}

function ForgotModalBody({ onSent, onBack }: { onSent: (email: string) => void; onBack: () => void }) {
  const { t } = useI18n();
  const [addr, setAddr] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addr.trim()) {
      setError(t('errors.email'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await forgotPassword(addr);
      onSent(addr.trim());
    } catch (err) {
      setError(httpCopy(err, t, t('auth.sendFail')));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2>{t('auth.forgot')}</h2>
      <form className="modal-form" onSubmit={onSubmit}>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <label className="field" htmlFor="forgot-email">
          {t('auth.email')}
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={addr}
            disabled={busy}
            onChange={(e) => setAddr(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={busy}>
          {busy ? t('auth.sending') : t('auth.sendCode')}
        </button>
        <p className="form-links">
          <button type="button" className="link-btn" onClick={onBack}>
            {t('auth.back')}
          </button>
        </p>
      </form>
    </>
  );
}

function ResetModalBody({
  email,
  onDone,
  onForgot,
}: {
  email: string;
  onDone: () => void;
  onForgot: () => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return setError(t('errors.otp'));
    if (password.length < 8) return setError(t('errors.min8'));
    if (password !== confirm) return setError(t('errors.mismatch'));
    setBusy(true);
    setError('');
    try {
      await resetPassword(email, code, password);
      onDone();
    } catch (err) {
      setError(httpCopy(err, t, t('errors.otp')));
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <>
        <h2>{t('auth.reset')}</h2>
        <p className="text-muted">{t('auth.resetNeed')}</p>
        <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={onForgot}>
          {t('auth.sendCode')}
        </button>
      </>
    );
  }

  return (
    <>
      <h2>{t('auth.reset')}</h2>
      <form className="modal-form" onSubmit={onSubmit}>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <OtpInputs value={code} onChange={setCode} disabled={busy} />
        <PasswordField
          id="reset-password"
          label={t('auth.newPassword')}
          value={password}
          autoComplete="new-password"
          disabled={busy}
          onChange={setPassword}
        />
        <label className="field" htmlFor="reset-confirm">
          {t('auth.confirm')}
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            disabled={busy}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={busy}>
          {busy ? t('auth.verifying') : t('auth.verifyBtn')}
        </button>
      </form>
    </>
  );
}

function OtpModalBody({
  email,
  returnTo,
  onSignedIn,
  onSignup,
}: {
  email: string;
  returnTo: string;
  onSignedIn: (returnTo: string) => void;
  onSignup: () => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
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
      markSignedIn(user);
      void registerPushToken('web');
      onSignedIn(returnTo);
    } catch (err) {
      setError(httpCopy(err, t, t('errors.otp')));
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
      setError(httpCopy(err, t, t('auth.sendFail')));
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <>
        <h2>{t('auth.verify')}</h2>
        <p className="text-muted">{t('auth.verifyNeed')}</p>
        <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={onSignup}>
          {t('auth.goSignup')}
        </button>
      </>
    );
  }

  return (
    <>
      <h2>{t('auth.verify')}</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
        {t('auth.verifySub')} <strong>{masked}</strong>
      </p>
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          void verify();
        }}
      >
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
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
        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={busy}>
          {busy ? t('auth.verifying') : t('auth.verifyBtn')}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          style={{ width: '100%', marginTop: 10 }}
          disabled={busy || seconds > 0}
          onClick={() => void resend()}
        >
          {seconds > 0 ? `${t('auth.resend')} ${seconds}s` : t('auth.resend')}
        </button>
      </form>
    </>
  );
}
