import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { isPasswordStrong, PasswordField } from '../../components/auth/PasswordField';
import { isApiError } from '../../lib/api';
import { checkEmailAvailable, signUp } from '../../lib/auth';
import { captureReferral, readReferral } from '../../lib/ref';
import { useI18n } from '../../lib/i18n';
import { countries, countryDial } from '../../lib/countries';

const SERVERS = [
  { value: '', key: 'srv.select' },
  { value: 'europe', key: 'srv.europe' },
  { value: 'asia', key: 'srv.asia' },
  { value: 'south-america', key: 'srv.southAmerica' },
  { value: 'middle-east', key: 'srv.middleEast' },
  { value: 'krjp', key: 'srv.krjp' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
    inGameUserName: '',
    pubgId: '',
    countryCode: 'BD',
    mobile: '',
    gameServer: '',
    terms: false,
  });
  const refCode = readReferral();
  const emailTimer = useRef(0);
  const emailReq = useRef(0);

  useEffect(() => {
    captureReferral();
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(emailTimer.current);
  }, []);

  function setErr(key: string, value: string) {
    setErrors((prev) => {
      if (!value) {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validatePasswordLive(password: string) {
    if (!password) {
      setErr('password', '');
      return;
    }
    if (!isPasswordStrong(password)) {
      setErr('password', t('errors.pwWeak'));
      return;
    }
    setErr('password', '');
  }

  function validateConfirmLive(password: string, confirm: string) {
    if (!confirm) {
      setErr('confirm', '');
      return;
    }
    if (password !== confirm) {
      setErr('confirm', t('errors.mismatch'));
      return;
    }
    setErr('confirm', '');
  }

  async function runEmailCheck(raw: string): Promise<string> {
    const email = raw.trim().toLowerCase();
    if (!email) {
      setErr('email', '');
      setEmailChecking(false);
      return '';
    }
    if (!EMAIL_RE.test(email)) {
      const msg = t('errors.emailValid');
      setErr('email', msg);
      setEmailChecking(false);
      return msg;
    }
    const req = ++emailReq.current;
    setEmailChecking(true);
    try {
      const result = await checkEmailAvailable(email);
      if (req !== emailReq.current) return '';
      if (result.available) {
        setErr('email', '');
        return '';
      }
      const msg = result.pending ? t('errors.emailPending') : t('errors.emailTaken');
      setErr('email', msg);
      return msg;
    } catch (err) {
      if (req !== emailReq.current) return '';
      if (isApiError(err) && err.status === 400) {
        const msg = t('errors.emailValid');
        setErr('email', msg);
        return msg;
      }
      setErr('email', '');
      return '';
    } finally {
      if (req === emailReq.current) setEmailChecking(false);
    }
  }

  function onEmailChange(value: string) {
    set('email', value);
    window.clearTimeout(emailTimer.current);
    const trimmed = value.trim();
    if (!trimmed) {
      setErr('email', '');
      setEmailChecking(false);
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setErr('email', t('errors.emailValid'));
      return;
    }
    setErr('email', '');
    setEmailChecking(true);
    emailTimer.current = window.setTimeout(() => {
      void runEmailCheck(trimmed);
    }, 450);
  }

  function validateStep1() {
    const next: Record<string, string> = {};
    if (!EMAIL_RE.test(form.email.trim())) next.email = t('errors.emailValid');
    if (!form.password) next.password = t('errors.password');
    else if (!isPasswordStrong(form.password)) next.password = t('errors.pwWeak');
    if (!form.confirm) next.confirm = t('auth.confirm');
    if (form.password !== form.confirm) next.confirm = t('errors.mismatch');
    return next;
  }

  function validateStep2() {
    const next: Record<string, string> = {};
    if (!/^[a-zA-Z0-9_]+$/.test(form.inGameUserName.trim())) {
      next.inGameUserName = t('errors.username');
    }
    if (!/^[a-zA-Z0-9]{1,20}$/.test(form.pubgId.trim())) {
      next.pubgId = t('errors.pubg');
    }
    const mobile = form.mobile.replace(/\D/g, '');
    const dial = countryDial(form.countryCode);
    if (dial === '880' && !/^01\d{9}$/.test(mobile) && !/^1\d{9}$/.test(mobile)) {
      next.mobile = t('errors.bdMobile');
    } else if (mobile.length < 8) {
      next.mobile = t('errors.mobile');
    }
    if (!form.gameServer) next.gameServer = t('errors.server');
    if (!form.terms) next.terms = t('errors.terms');
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      const emailErr = await runEmailCheck(form.email);
      const next = validateStep1();
      if (emailErr) next.email = emailErr;
      setErrors(next);
      if (Object.keys(next).length) {
        document.getElementById(next.email ? 'email' : 'password')?.focus();
        return;
      }
      setStep(2);
      return;
    }
    const next = validateStep2();
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const mobileNo = form.mobile.replace(/\D/g, '').replace(/^0/, '');
      await signUp({
        email: form.email.trim(),
        username: form.inGameUserName.trim(),
        password: form.password,
        pubgId: form.pubgId.trim(),
        countryCode: countryDial(form.countryCode),
        mobileNo,
        phone: form.mobile.trim(),
        gameServer: form.gameServer,
      });
      navigate(`/auth/email-verification?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      const msg = isApiError(err) ? err.message : t('errors.signup');
      if (/email already/i.test(msg)) {
        setErrors({ email: t('errors.emailTaken'), form: '' });
        setStep(1);
        return;
      }
      if (/password/i.test(msg)) {
        setErrors({ password: msg, form: '' });
        setStep(1);
        return;
      }
      setErrors({ form: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t('auth.create')} subtitle={t('auth.signupSub')}>
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="step-bar" aria-label={t('auth.create')}>
          <button type="button" className={step === 1 ? 'on' : ''} onClick={() => setStep(1)}>
            {t('auth.step1')}
          </button>
          <i />
          <button type="button" className={step === 2 ? 'on' : ''} disabled={step < 2} onClick={() => setStep(2)}>
            {t('auth.step2')}
          </button>
        </div>
        {refCode ? <p className="auth-ref">{t('auth.refApplied')}: {refCode}</p> : null}
        {errors.form ? <p className="form-error">{errors.form}</p> : null}
        {step === 1 ? (
          <>
            <label className="field" htmlFor="email">
              {t('auth.email')}
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                disabled={busy}
                onChange={(e) => onEmailChange(e.target.value)}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  set('email', v);
                  window.clearTimeout(emailTimer.current);
                  void runEmailCheck(v);
                }}
              />
              {emailChecking ? <span className="field-hint">{t('auth.emailChecking')}</span> : null}
              {errors.email ? <span className="field-error">{errors.email}</span> : null}
              {!errors.email && !emailChecking && form.email && EMAIL_RE.test(form.email.trim()) ? (
                <span className="field-ok">{t('auth.emailOk')}</span>
              ) : null}
            </label>
            <PasswordField
              id="password"
              label={t('auth.password')}
              value={form.password}
              autoComplete="new-password"
              disabled={busy}
              error={errors.password}
              meter
              hints
              onChange={(v) => {
                set('password', v);
                validatePasswordLive(v);
                validateConfirmLive(v, form.confirm);
              }}
            />
            <PasswordField
              id="confirm"
              label={t('auth.confirm')}
              value={form.confirm}
              autoComplete="new-password"
              disabled={busy}
              error={errors.confirm}
              onChange={(v) => {
                set('confirm', v);
                validateConfirmLive(form.password, v);
              }}
            />
            <button className="btn btn-primary" type="submit" disabled={busy || emailChecking || Boolean(errors.email)}>
              {t('auth.continue')}
            </button>
          </>
        ) : (
          <>
            <label className="field" htmlFor="inGameUserName">
              {t('auth.username')}
              <input
                id="inGameUserName"
                autoComplete="username"
                value={form.inGameUserName}
                disabled={busy}
                onChange={(e) => set('inGameUserName', e.target.value)}
                onBlur={(e) => set('inGameUserName', e.target.value.trim())}
              />
              {errors.inGameUserName ? <span className="field-error">{errors.inGameUserName}</span> : null}
            </label>
            <label className="field" htmlFor="pubgId">
              {t('auth.pubg')}
              <input
                id="pubgId"
                inputMode="text"
                maxLength={20}
                value={form.pubgId}
                disabled={busy}
                onChange={(e) => set('pubgId', e.target.value)}
                onBlur={(e) => set('pubgId', e.target.value.trim())}
              />
              {errors.pubgId ? <span className="field-error">{errors.pubgId}</span> : null}
            </label>
            <label className="field" htmlFor="mobile">
              {t('auth.phone')}
              <span className="phone-row">
                <select
                  value={form.countryCode}
                  disabled={busy}
                  aria-label={t('auth.country')}
                  onChange={(e) => set('countryCode', e.target.value)}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} +{c.phone}
                    </option>
                  ))}
                </select>
                <input
                  id="mobile"
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  value={form.mobile}
                  disabled={busy}
                  onChange={(e) => set('mobile', e.target.value)}
                  onBlur={(e) => set('mobile', e.target.value.trim())}
                />
              </span>
              {errors.mobile ? <span className="field-error">{errors.mobile}</span> : null}
            </label>
            <label className="field" htmlFor="gameServer">
              {t('auth.server')}
              <select id="gameServer" value={form.gameServer} disabled={busy} onChange={(e) => set('gameServer', e.target.value)}>
                {SERVERS.map((s) => (
                  <option key={s.value || 'none'} value={s.value} disabled={!s.value}>
                    {t(s.key)}
                  </option>
                ))}
              </select>
              {errors.gameServer ? <span className="field-error">{errors.gameServer}</span> : null}
            </label>
            <label className="check">
              <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} />
              {t('auth.agreeLead')} <Link to="/terms-and-conditions">{t('footer.terms')}</Link> {t('auth.agreeAnd')}{' '}
              <Link to="/privacy-policy">{t('footer.privacy')}</Link>
            </label>
            {errors.terms ? <span className="field-error">{errors.terms}</span> : null}
            <div className="auth-row">
              <button className="btn btn-ghost" type="button" onClick={() => setStep(1)} disabled={busy}>
                {t('auth.back')}
              </button>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? t('auth.creating') : t('auth.create')}
              </button>
            </div>
          </>
        )}
        <p className="auth-switch">
          {t('auth.already')} <Link to="/auth/sign-in">{t('cta.signin')}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
