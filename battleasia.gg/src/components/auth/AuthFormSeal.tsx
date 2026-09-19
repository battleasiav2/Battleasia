/** Shield + crosshair seal for auth form cards (trust mark). */
export function AuthFormSeal() {
  return (
    <div className="auth-seal" aria-hidden>
      <svg className="auth-seal-svg" viewBox="0 0 72 72" width="56" height="56">
        <defs>
          <linearGradient id="authSealStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--ba-accent)" />
            <stop offset="100%" stopColor="var(--ba-accent-b, #21D4FD)" />
          </linearGradient>
          <linearGradient id="authSealFill" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(14,16,24,0.9)" />
          </linearGradient>
        </defs>
        {/* Shield */}
        <path
          d="M36 6 58 14.5v18.2c0 14.8-9.4 24.8-22 29.3C23.4 57.5 14 47.5 14 32.7V14.5L36 6Z"
          fill="url(#authSealFill)"
          stroke="url(#authSealStroke)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Crosshair */}
        <circle cx="36" cy="34" r="11" fill="none" stroke="url(#authSealStroke)" strokeWidth="1.8" />
        <circle cx="36" cy="34" r="3.2" fill="var(--ba-accent)" />
        <path
          d="M36 20v5.5M36 42.5V48M22 34h5.5M44.5 34H50"
          fill="none"
          stroke="url(#authSealStroke)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
