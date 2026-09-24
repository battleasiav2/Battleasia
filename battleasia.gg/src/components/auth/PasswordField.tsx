import { useState } from 'react';
import { useI18n } from '../../lib/i18n';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  meter?: boolean;
  hints?: boolean;
};

export function scorePassword(value: string) {
  if (!value) return 0;
  let score = 1;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(4, score);
}

export function passwordRules(value: string) {
  return {
    length: value.length >= 8,
    case: /[A-Z]/.test(value) && /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

/** Signup requires Good+ (score >= 3). */
export function isPasswordStrong(value: string) {
  return scorePassword(value) >= 3;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3l18 18M10.5 10.7a2.5 2.5 0 003.5 3.5M9.9 5.2A10.4 10.4 0 0112 5c5.2 0 9.2 3.4 10.5 7-.5 1.3-1.4 2.6-2.6 3.6M6.1 6.3C4.4 7.5 3.2 9.1 2.5 12c1.3 3.6 5.3 7 10.5 7 1.2 0 2.3-.2 3.4-.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12C3.8 8.4 7.8 5 13 5s9.2 3.4 10.5 7c-1.3 3.6-5.3 7-10.5 7S3.8 15.6 2.5 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  disabled,
  meter,
  hints,
}: Props) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const score = meter || hints ? scorePassword(value) : 0;
  const rules = passwordRules(value);
  const labels = [t('auth.pwWeak'), t('auth.pwWeak'), t('auth.pwFair'), t('auth.pwGood'), t('auth.pwStrong')];

  return (
    <label className="field" htmlFor={id}>
      {label}
      <span className="field-control password-wrap">
        <span className="field-ico" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10V8a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={t('auth.passwordPh') || '••••••••'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(e.target.value.trim())}
        />
        <button
          type="button"
          className="eye"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? t('auth.hidePassword') || 'Hide password' : t('auth.showPassword') || 'Show password'}
        >
          <EyeIcon open={show} />
        </button>
      </span>
      {meter && value ? (
        <span className={`pw-meter score-${score}`} aria-live="polite">
          <span className="pw-meter-bars">
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={n <= score ? 'on' : ''} />
            ))}
          </span>
          <span className="pw-meter-label">{labels[score]}</span>
        </span>
      ) : null}
      {hints && value ? (
        <ul className="pw-hints" aria-live="polite">
          <li className={rules.length ? 'is-ok' : 'is-miss'}>{t('auth.pwHint.length')}</li>
          <li className={rules.case ? 'is-ok' : 'is-miss'}>{t('auth.pwHint.case')}</li>
          <li className={rules.number ? 'is-ok' : 'is-miss'}>{t('auth.pwHint.number')}</li>
          <li className={rules.special ? 'is-ok' : 'is-miss'}>{t('auth.pwHint.special')}</li>
        </ul>
      ) : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
