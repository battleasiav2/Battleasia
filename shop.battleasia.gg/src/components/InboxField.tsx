import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = {
  label: string;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/** Auth-style input: placeholder inside the box (no label above). */
export function InboxField({ label, placeholder, hint, error, id, className, ...inputProps }: Props) {
  const inputId = id ?? `inbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label className="field field-inbox" htmlFor={inputId}>
      <span className="field-control field-control--plain">
        <input
          id={inputId}
          className={className}
          placeholder={placeholder ?? label}
          aria-label={label}
          {...inputProps}
        />
      </span>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
