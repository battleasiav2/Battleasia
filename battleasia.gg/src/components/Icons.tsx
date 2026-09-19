type IconProps = { size?: number };

export function IconChat({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2.9-.7 2.1-1.6 3.2 1.8-.3 3.3-1.1 4.3-1.8.8.2 1.7.3 2.7.3 4.7 0 8.5-3.1 8.5-7s-3.8-7-8.5-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconClose({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function SocialGlyph({ name }: { name: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
  } as const;
  switch (name) {
    case 'Facebook':
      return (
        <svg {...common}>
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6L16 12h-3V10c0-.6.4-1 1-1Z" />
        </svg>
      );
    case 'Discord':
      return (
        <svg {...common}>
          <path d="M14.8 6c.5 0 1.8.2 2.8.8l.4.2c1.8 3.1 2.4 6.1 2.1 9.1l-.1.4c-1.2 1-2.6 1.7-4.1 2.1l-.5-.8c.5-.2 1-.4 1.5-.7-.6.3-3.4 1.4-6.9 1.4s-6.3-1.1-6.9-1.4c.5.3 1 .5 1.5.7l-.5.8c-1.5-.4-2.9-1.1-4.1-2.1l-.1-.4C.2 13.1.8 10.1 2.6 7l.4-.2C4 6.2 5.3 6 5.8 6l.5.8C7.6 6.3 9.7 6 12 6s4.4.3 5.7.8l.5-.8ZM9.2 14.2c.8 0 1.4-.7 1.4-1.5S10 11.2 9.2 11.2 7.8 11.9 7.8 12.7s.6 1.5 1.4 1.5Zm5.6 0c.8 0 1.4-.7 1.4-1.5s-.6-1.5-1.4-1.5-1.4.7-1.4 1.5.6 1.5 1.4 1.5Z" />
        </svg>
      );
    case 'TikTok':
      return (
        <svg {...common}>
          <path d="M14 4c.4 2.4 1.8 4 4 4.4V11c-1.5 0-2.9-.5-4-1.3V15a5 5 0 1 1-5-5c.3 0 .7 0 1 .1V13a2.2 2.2 0 1 0 2.2 2.2V4h1.8Z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg {...common}>
          <path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Zm8 1.8H8A2.2 2.2 0 0 0 5.8 8v8A2.2 2.2 0 0 0 8 18.2h8A2.2 2.2 0 0 0 18.2 16V8A2.2 2.2 0 0 0 16 5.8ZM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm4.6-.9a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9Z" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg {...common}>
          <path d="M22 12.2s0-3.2-.4-4.6a2.8 2.8 0 0 0-2-2C17.8 5.2 12 5.2 12 5.2s-5.8 0-7.6.4a2.8 2.8 0 0 0-2 2C2 9 2 12.2 2 12.2s0 3.2.4 4.6a2.8 2.8 0 0 0 2 2c1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4a2.8 2.8 0 0 0 2-2c.4-1.4.4-4.6.4-4.6ZM10 15.2V9.2l5.2 3-5.2 3Z" />
        </svg>
      );
    case 'Telegram':
      return (
        <svg {...common}>
          <path d="M20.5 5.5 3.8 11.8c-1.2.5-1.1 1.4-.2 1.8l4.3 1.3 1.6 5c.2.6.6.7 1.2.4l2.3-2.1 4.4 3.2c.8.5 1.4.2 1.6-.7l3-14.2c.3-1.2-.4-1.8-1.5-1.3ZM8.7 13.8l8.6-5.3c.4-.3.8 0 .5.3l-7.4 6.7-.3 3.2-1.4-4.9Z" />
        </svg>
      );
    case 'WhatsApp':
      return (
        <svg {...common}>
          <path d="M12 3.2A8.7 8.7 0 0 0 4.8 16.7L4 20.8l4.2-.8A8.8 8.8 0 1 0 12 3.2Zm5 12.4c-.2.6-1.2 1.1-1.9 1.2-.5.1-1.1.2-3.5-.7-3-1.2-4.9-4.2-5-4.4s-1.2-1.6-1.2-3 .7-2.2 1-2.5c.2-.2.5-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2 0 .4-.1.6l-.4.5c-.2.2-.4.4.2.6.3.4.7.9 1.2 1.3.6.5 1.2.9 1.9 1.1.2.1.4 0 .6-.2l.5-.6c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.5 0 .2 0 .8-.3 1.4Z" />
        </svg>
      );
    default:
      return <span>{name[0]}</span>;
  }
}

export function PayChip({ kind }: { kind: 'bkash' | 'nagad' | 'crypto' }) {
  if (kind === 'bkash') {
    return (
      <span className="pay-chip bkash">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="6" fill="#E2136E" />
          <path d="M7 12.5 12 6l5 6.5-5 5.5-5-5.5Z" fill="#fff" />
        </svg>
        bKash
      </span>
    );
  }
  if (kind === 'nagad') {
    return (
      <span className="pay-chip nagad">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="6" fill="#F26522" />
          <circle cx="12" cy="12" r="5.5" fill="#fff" />
        </svg>
        Nagad
      </span>
    );
  }
  return (
    <span className="pay-chip crypto">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#21D4FD" />
        <path d="M12 4.5 17 12 12 19.5 7 12Z" fill="#0E0F14" />
      </svg>
      CRYPTO
    </span>
  );
}
