import { useState } from 'react';
import { useI18n } from '../lib/i18n';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  meter?: boolean;
};

function scorePassword(value: string) {
  if (!value) return 0;
  let score = 1;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(4, score);
}

export function PasswordField({ id, label, value, onChange, autoComplete, error, disabled, meter }: Props) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const score = meter ? scorePassword(value) : 0;
  const labels = [t('auth.pwWeak'), t('auth.pwWeak'), t('auth.pwFair'), t('auth.pwGood'), t('auth.pwStrong')];

  return (
    <label className="field" htmlFor={id}>
      {label}
      <span className="password-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(e.target.value.trim())}
        />
        <button type="button" className="eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'Hide' : 'Show'}
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
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
