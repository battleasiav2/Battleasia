import { useI18n } from '../../lib/i18n';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4A7.2 7.2 0 0 1 5 12c0-.8.1-1.6.4-2.4V6.5H1.4A12 12 0 0 0 0 12c0 1.9.5 3.8 1.4 5.5l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#5865F2"
        d="M19.27 5.33A16.4 16.4 0 0 0 15.2 4l-.4.72a14.2 14.2 0 0 1 3.55 1.4 15.4 15.4 0 0 0-12.7 0A13.5 13.5 0 0 1 9.2 4.72L8.8 4a16.4 16.4 0 0 0-4.07 1.33C1.9 9.5 1.2 13.6 1.6 17.64A16.6 16.6 0 0 0 6.8 20l.9-1.22a10.7 10.7 0 0 1-1.7-.82l.42-.32c3.4 1.58 7.1 1.58 10.46 0l.42.32c-.54.34-1.1.62-1.7.82L16.5 20a16.6 16.6 0 0 0 5.2-2.36c.5-4.7-.84-8.76-2.43-12.31ZM8.7 15.1c-1.02 0-1.86-.94-1.86-2.1s.82-2.1 1.86-2.1 1.88.94 1.86 2.1-.82 2.1-1.86 2.1Zm6.6 0c-1.02 0-1.86-.94-1.86-2.1s.82-2.1 1.86-2.1 1.88.94 1.86 2.1-.82 2.1-1.86 2.1Z"
      />
    </svg>
  );
}

export function SocialLogin({ returnTo }: { returnTo: string }) {
  const { t } = useI18n();
  const next = encodeURIComponent(returnTo);

  return (
    <div className="signin-social">
      <a className="signin-alt" href={`/api/v2/users/oauth/google?returnTo=${next}`}>
        <GoogleIcon />
        <span>{t('auth.google')}</span>
      </a>
      <a className="signin-alt" href={`/api/v2/users/oauth/discord?returnTo=${next}`}>
        <DiscordIcon />
        <span>{t('auth.discord')}</span>
      </a>
    </div>
  );
}
