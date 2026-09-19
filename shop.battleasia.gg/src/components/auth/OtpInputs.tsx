import { useRef } from 'react';

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  error?: string;
};

export function OtpInputs({ value, onChange, disabled, error }: Props) {
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function setAt(index: number, char: string) {
    const next = digits.map((d, i) => (i === index ? char : d === ' ' ? '' : d)).join('').replace(/\D/g, '').slice(0, 6);
    onChange(next);
    if (char && index < 5) refs.current[index + 1]?.focus();
  }

  return (
    <div>
      <div className="otp-row" onPaste={(e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        e.preventDefault();
        onChange(text);
        refs.current[Math.min(text.length, 5)]?.focus();
      }}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="otp-cell"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            value={digit === ' ' ? '' : digit}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setAt(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
                refs.current[i - 1]?.focus();
              }
            }}
          />
        ))}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
