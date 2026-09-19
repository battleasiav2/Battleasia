import type { ReactNode } from 'react';

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="nav-glyph" aria-hidden>
      {children}
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  dash: (
    <Svg>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" {...STROKE} />
      <rect x="13" y="3.5" width="7.5" height="5" rx="1.8" {...STROKE} />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.8" {...STROKE} />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" {...STROKE} />
    </Svg>
  ),
  users: (
    <Svg>
      <circle cx="9" cy="8" r="3" {...STROKE} />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" {...STROKE} />
      <circle cx="17" cy="8.5" r="2.2" {...STROKE} />
      <path d="M16.2 14.2c2.1.4 3.6 1.8 4.3 4.8" {...STROKE} />
    </Svg>
  ),
  roles: (
    <Svg>
      <path d="M12 3.5 19 7v5.2c0 4.1-2.8 6.8-7 8.3-4.2-1.5-7-4.2-7-8.3V7z" {...STROKE} />
      <path d="M9.2 12.2 11 14l3.8-3.8" {...STROKE} />
    </Svg>
  ),
  history: (
    <Svg>
      <circle cx="12" cy="12" r="8" {...STROKE} />
      <path d="M12 7.5V12l3.2 2" {...STROKE} />
    </Svg>
  ),
  online: (
    <Svg>
      <circle cx="12" cy="12" r="2.2" {...STROKE} />
      <path d="M7.4 7.4a6.5 6.5 0 0 0 0 9.2M16.6 7.4a6.5 6.5 0 0 1 0 9.2" {...STROKE} />
      <path d="M5 5a9.2 9.2 0 0 0 0 14M19 5a9.2 9.2 0 0 1 0 14" {...STROKE} />
    </Svg>
  ),
  premium: (
    <Svg>
      <path d="M12 4.2 14.6 9l5.4.6-4 3.7.1 5.4L12 16.4 8 18.7l.1-5.4-4-3.7L9.4 9z" {...STROKE} />
    </Svg>
  ),
  referral: (
    <Svg>
      <circle cx="7" cy="8" r="2.4" {...STROKE} />
      <circle cx="17" cy="7" r="2.4" {...STROKE} />
      <circle cx="16" cy="17" r="2.4" {...STROKE} />
      <path d="M9 9.4 15 8.2M8.6 10.2 14.2 15.4" {...STROKE} />
    </Svg>
  ),
  transfer: (
    <Svg>
      <path d="M4 8h13M14 4.5 17.5 8 14 11.5" {...STROKE} />
      <path d="M20 16H7M10 12.5 6.5 16 10 19.5" {...STROKE} />
    </Svg>
  ),
  games: (
    <Svg>
      <path d="M6.2 8.2h11.6A3.2 3.2 0 0 1 21 11.4v3.2A3.4 3.4 0 0 1 17.6 18H6.4A3.4 3.4 0 0 1 3 14.6v-3.2A3.2 3.2 0 0 1 6.2 8.2z" {...STROKE} />
      <path d="M8 11.2v4M6 13.2h4M16.2 12.2h.1M18.2 14.4h.1" {...STROKE} />
    </Svg>
  ),
  matches: (
    <Svg>
      <path d="M8 20h8M12 20V13" {...STROKE} />
      <path d="M7 4.5h10v4.2a5 5 0 0 1-10 0z" {...STROKE} />
      <path d="M7 7.2H4.8A3.2 3.2 0 0 0 8 10.6M17 7.2h2.2A3.2 3.2 0 0 1 16 10.6" {...STROKE} />
    </Svg>
  ),
  people: (
    <Svg>
      <circle cx="8.5" cy="8" r="2.6" {...STROKE} />
      <circle cx="15.5" cy="8.6" r="2.2" {...STROKE} />
      <path d="M4 18.5c.5-3 2.4-4.6 4.5-4.6s4 1.6 4.5 4.6M14.2 14.4c1.8.2 3.2 1.4 3.8 4.1" {...STROKE} />
    </Svg>
  ),
  ledger: (
    <Svg>
      <path d="M6 4.5h10.5A2 2 0 0 1 18.5 6.5v13H8A2 2 0 0 1 6 17.5z" {...STROKE} />
      <path d="M6 4.5A2.5 2.5 0 0 0 3.5 7v10.5A2 2 0 0 0 5.5 19.5" {...STROKE} />
      <path d="M10 9h5.5M10 12.5h5.5M10 16h3.5" {...STROKE} />
    </Svg>
  ),
  wallet: (
    <Svg>
      <path d="M4.5 8.2h15A1.5 1.5 0 0 1 21 9.7v8.1a1.8 1.8 0 0 1-1.8 1.8H5.5A2 2 0 0 1 3.5 17.6V8.8A2 2 0 0 1 5.5 6.8h11" {...STROKE} />
      <circle cx="16.5" cy="13.6" r="1.1" {...STROKE} />
    </Svg>
  ),
  deposit: (
    <Svg>
      <path d="M12 4.5v11M7.5 11.2 12 15.8l4.5-4.6" {...STROKE} />
      <path d="M5 19.5h14" {...STROKE} />
    </Svg>
  ),
  withdraw: (
    <Svg>
      <path d="M12 19.5V8.5M7.5 12.8 12 8.2l4.5 4.6" {...STROKE} />
      <path d="M5 4.5h14" {...STROKE} />
    </Svg>
  ),
  pack: (
    <Svg>
      <circle cx="12" cy="12" r="8" {...STROKE} />
      <path d="M12 8v8M9.4 10.2c.6-1 1.6-1.5 2.6-1.5 1.7 0 2.7 1 2.7 2.3 0 3.1-5.3 1.8-5.3 4.4 0 1.2 1.1 2.3 2.8 2.3 1.2 0 2.1-.5 2.6-1.3" {...STROKE} />
    </Svg>
  ),
  rate: (
    <Svg>
      <path d="M4.5 16.5 10 11l3.2 3.2 6.3-6.7" {...STROKE} />
      <path d="M14.5 7.5h5v5" {...STROKE} />
    </Svg>
  ),
  bell: (
    <Svg>
      <path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 4.2 1.2 5.3 1.2 5.3H5.3s1.2-1.1 1.2-5.3z" {...STROKE} />
      <path d="M10 18.4a2 2 0 0 0 4 0" {...STROKE} />
    </Svg>
  ),
  feed: (
    <Svg>
      <rect x="4" y="5" width="16" height="14" rx="2.4" {...STROKE} />
      <path d="M8 9h8M8 12.5h8M8 16h5" {...STROKE} />
    </Svg>
  ),
  tag: (
    <Svg>
      <path d="M4.5 12.2 11.8 4.9H19v7.2l-7.3 7.3z" {...STROKE} />
      <circle cx="15.2" cy="8.8" r="1.1" {...STROKE} />
    </Svg>
  ),
  social: (
    <Svg>
      <circle cx="12" cy="8" r="3.2" {...STROKE} />
      <path d="M5 19.2c.8-3.6 3.2-5.4 7-5.4s6.2 1.8 7 5.4" {...STROKE} />
    </Svg>
  ),
  flag: (
    <Svg>
      <path d="M6 4.5v16" {...STROKE} />
      <path d="M6 5.2h10.5l-2.2 3.6 2.2 3.6H6" {...STROKE} />
    </Svg>
  ),
  reel: (
    <Svg>
      <rect x="5" y="4.5" width="14" height="15" rx="2.4" {...STROKE} />
      <path d="M10 9.6 15.2 12 10 14.4z" {...STROKE} />
    </Svg>
  ),
  support: (
    <Svg>
      <path d="M5.5 12a6.5 6.5 0 1 1 13 0" {...STROKE} />
      <path d="M5.5 12v3.2A2.2 2.2 0 0 0 7.7 17.4H8.5V12zM18.5 12v3.2a2.2 2.2 0 0 1-2.2 2.2H15.5V12z" {...STROKE} />
      <path d="M9.5 19.2c.8 1 1.7 1.4 2.5 1.4s1.7-.4 2.5-1.4" {...STROKE} />
    </Svg>
  ),
  chat: (
    <Svg>
      <path d="M5 6.5h14v9.2H9.6L5 19.2z" {...STROKE} />
    </Svg>
  ),
  send: (
    <Svg>
      <path d="M4.5 12 19.5 5l-3.4 14-4.6-5.2z" {...STROKE} />
      <path d="M11.5 13.8 19.5 5" {...STROKE} />
    </Svg>
  ),
  mission: (
    <Svg>
      <circle cx="12" cy="12" r="7.5" {...STROKE} />
      <circle cx="12" cy="12" r="3.2" {...STROKE} />
      <path d="M12 4.5V3M12 21v-1.5M4.5 12H3M21 12h-1.5" {...STROKE} />
    </Svg>
  ),
  badge: (
    <Svg>
      <circle cx="12" cy="10" r="5.2" {...STROKE} />
      <path d="M8.8 14.6 7.5 20.2 12 17.8l4.5 2.4-1.3-5.6" {...STROKE} />
    </Svg>
  ),
  sliders: (
    <Svg>
      <path d="M5 7h14M5 12h14M5 17h14" {...STROKE} />
      <circle cx="9" cy="7" r="1.6" {...STROKE} />
      <circle cx="15" cy="12" r="1.6" {...STROKE} />
      <circle cx="10.5" cy="17" r="1.6" {...STROKE} />
    </Svg>
  ),
  toggle: (
    <Svg>
      <rect x="3.5" y="8" width="17" height="8" rx="4" {...STROKE} />
      <circle cx="15.2" cy="12" r="2.4" {...STROKE} />
    </Svg>
  ),
  mail: (
    <Svg>
      <rect x="3.5" y="6.5" width="17" height="11" rx="2" {...STROKE} />
      <path d="M5 8.2 12 13l7-4.8" {...STROKE} />
    </Svg>
  ),
  download: (
    <Svg>
      <path d="M12 4.5v10M8 11.2l4 3.8 4-3.8" {...STROKE} />
      <path d="M5 19.5h14" {...STROKE} />
    </Svg>
  ),
  scale: (
    <Svg>
      <path d="M12 4.5v15M8 19.5h8" {...STROKE} />
      <path d="M12 7.2 5.5 11 8 15.5h3.2M12 7.2 18.5 11 16 15.5h-3.2" {...STROKE} />
    </Svg>
  ),
  hold: (
    <Svg>
      <path d="M12 8.2V12l2.2 1.4" {...STROKE} />
      <path d="M12 4.5 19 8v5.2c0 4.1-2.8 6.8-7 8.3-4.2-1.5-7-4.2-7-8.3V8z" {...STROKE} />
    </Svg>
  ),
  kyc: (
    <Svg>
      <rect x="4" y="5" width="16" height="14" rx="2" {...STROKE} />
      <circle cx="9.2" cy="11" r="2" {...STROKE} />
      <path d="M6.4 16.4c.4-1.6 1.4-2.4 2.8-2.4s2.4.8 2.8 2.4M13.6 10h4.2M13.6 13.2H18" {...STROKE} />
    </Svg>
  ),
  print: (
    <Svg>
      <path d="M8.2 4.5h7.6v4H8.2z" {...STROKE} />
      <path d="M6 8.5h12v7.2H6z" {...STROKE} />
      <path d="M8.2 15.7h7.6v3.8H8.2z" {...STROKE} />
      <circle cx="16.2" cy="11.2" r="0.7" fill="currentColor" />
    </Svg>
  ),
  scan: (
    <Svg>
      <path d="M5 8.5V6.2A1.7 1.7 0 0 1 6.7 4.5H9M19 8.5V6.2A1.7 1.7 0 0 0 17.3 4.5H15M5 15.5v2.3A1.7 1.7 0 0 0 6.7 19.5H9M19 15.5v2.3a1.7 1.7 0 0 1-1.7 1.7H15" {...STROKE} />
      <path d="M7.5 12h9" {...STROKE} />
    </Svg>
  ),
  report: (
    <Svg>
      <path d="M7 4.5h7.2L19 9.2V19.5H7z" {...STROKE} />
      <path d="M14.2 4.5V9.2H19M9.5 12.5h5M9.5 15.6h3.6" {...STROKE} />
    </Svg>
  ),
  gavel: (
    <Svg>
      <path d="M8 14.5 15.6 6.9l2 2L10 16.5z" {...STROKE} />
      <path d="M6.2 16.4 4.5 18.1 6 19.6l1.7-1.7M14.8 5.8l2-2 1.6 1.6-2 2" {...STROKE} />
      <path d="M5 20.2h7" {...STROKE} />
    </Svg>
  ),
  audit: (
    <Svg>
      <rect x="6" y="4" width="12" height="16" rx="2" {...STROKE} />
      <path d="M9 9h6M9 12.4h6M9 15.8h3.6" {...STROKE} />
    </Svg>
  ),
  profile: (
    <Svg>
      <circle cx="12" cy="8.2" r="3.1" {...STROKE} />
      <path d="M5.4 19.2c.8-3.6 3.2-5.4 6.6-5.4s5.8 1.8 6.6 5.4" {...STROKE} />
    </Svg>
  ),
};

export function NavGlyph({ name }: { name?: string }) {
  return <>{ICONS[name || ''] || ICONS.dash}</>;
}
