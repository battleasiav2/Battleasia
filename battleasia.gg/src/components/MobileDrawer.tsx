import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { fetchAppDownload, formatApkSize } from '../lib/app-download';
import { useI18n } from '../lib/i18n';
import { applyAccent, readAccent, type AccentId } from '../lib/theme';
import { openBacShop } from '../lib/wallet';
import { LocaleSelect } from './LocaleSelect';
import { UserAvatar } from './UserAvatar';

export type DrawerTarget = {
  to?: string;
  href?: string;
  download?: string;
  onClick?: () => void;
  external?: boolean;
};

export type DrawerLink = DrawerTarget & {
  key: string;
  label: string;
  active?: boolean;
};

export type DrawerCard = DrawerLink & {
  desc: string;
  icon: ReactNode;
  badge?: number;
};

const MENU_ACCENTS: { id: AccentId; color: string }[] = [
  { id: 'lime', color: '#d4e82a' },
  { id: 'jade', color: '#61d7bd' },
  { id: 'ember', color: '#f08c63' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  logo: string;
  playerName: string;
  avatar?: string | null;
  onSignOut: () => void;
};

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const DrawerIcons = {
  arrow: (
    <Svg>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  chevron: (
    <Svg size={18}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  ),
  external: (
    <Svg>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Svg>
  ),
  close: (
    <Svg size={22}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  ),
  gift: (
    <Svg>
      <path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1.2C7 7 9 7 12 7Zm0 0c1.5-3 5-3.5 5-1.2C17 7 15 7 12 7Z" />
    </Svg>
  ),
  flask: (
    <Svg>
      <path d="M9 3h6M10 3v6L4.6 18.3A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.7L14 9V3M7.5 15h9" />
    </Svg>
  ),
  bell: (
    <Svg>
      <path d="M6 17h12l-1.4-2.1V11a4.6 4.6 0 0 0-9.2 0v3.9L6 17ZM10 20a2 2 0 0 0 4 0" />
    </Svg>
  ),
  user: (
    <Svg>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Svg>
  ),
  gamepad: (
    <Svg>
      <path d="M7 8h10a5 5 0 0 1 4.8 6.4l-.9 3a2.3 2.3 0 0 1-3.9.9L15 16H9l-2 2.3a2.3 2.3 0 0 1-3.9-.9l-.9-3A5 5 0 0 1 7 8ZM8 11v4M6 13h4M15.5 12h.01M17.5 14h.01" />
    </Svg>
  ),
  download: (
    <Svg>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </Svg>
  ),
  login: (
    <Svg>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l4-4-4-4M14 12H4" />
    </Svg>
  ),
  logout: (
    <Svg>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 16l4-4-4-4M20 12H10" />
    </Svg>
  ),
  send: (
    <Svg>
      <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" />
    </Svg>
  ),
  cash: (
    <Svg>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 9.5v.01M17 14.5v.01" />
    </Svg>
  ),
};

function Target({
  target,
  className,
  onClose,
  children,
  label,
}: {
  target: DrawerTarget;
  className: string;
  onClose: () => void;
  children: ReactNode;
  label?: string;
}) {
  const click = () => {
    target.onClick?.();
    onClose();
  };
  if (target.to) {
    return (
      <Link className={className} to={target.to} onClick={click} aria-label={label}>
        {children}
      </Link>
    );
  }
  if (target.href) {
    return (
      <a className={className} href={target.href} download={target.download} onClick={click} aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} type="button" onClick={click} aria-label={label}>
      {children}
    </button>
  );
}

export function MobileDrawer({ open, onClose, logo, playerName, avatar, onSignOut }: Props) {
  const { t } = useI18n();
  const location = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [accentId, setAccentId] = useState<AccentId>(readAccent);
  const [apkHref, setApkHref] = useState('/api/uploads/app/BattleAsia.apk');
  const [apkNote, setApkNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setAccentId(readAccent());
    let live = true;
    void fetchAppDownload().then((apk) => {
      if (!live || !apk.enabled) return;
      setApkHref(apk.downloadUrl || '/api/uploads/app/BattleAsia.apk');
      const size = formatApkSize(apk.fileSize);
      setApkNote([apk.version ? `v${apk.version}` : '', size].filter(Boolean).join(' · '));
    });
    return () => {
      live = false;
    };
  }, [open]);

  const pickAccent = (id: AccentId) => {
    applyAccent(id);
    setAccentId(id);
    window.dispatchEvent(new Event('ba-theme-change'));
  };

  const links: DrawerLink[] = [
    { key: 'play', label: t('nav.play'), to: '/user/play', active: location.pathname.startsWith('/user/play') },
    { key: 'shop', label: t('nav.shop'), to: '/user/shop', active: location.pathname.startsWith('/user/shop') },
    { key: 'earn', label: t('nav.earn'), to: '/user/earn', active: location.pathname.startsWith('/user/earn') },
    { key: 'transfer', label: t('nav.transfer'), onClick: () => openBacShop('transfer') },
    { key: 'feed', label: t('nav.feed'), to: '/user/feed', active: location.pathname.startsWith('/user/feed') },
  ];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="m-drawer m-drawer--landing m-drawer--dash" role="dialog" aria-modal="true" aria-label="Battle Asia">
      <aside className="ld-panel">
        <header className="ld-head">
          <button ref={closeRef} className="ld-close" type="button" aria-label={t('hud.closeMenu')} onClick={onClose}>
            {DrawerIcons.close}
          </button>
          <Link className="ld-brand" to="/dashboard" onClick={onClose}>
            <img src={logo} width={36} height={36} alt="" />
            <span>Battle Asia</span>
          </Link>
        </header>

        <nav className="ld-nav" aria-label={t('hud.arena')}>
          {links.map((link) => (
            <Target key={link.key} target={link} onClose={onClose} className={link.active ? 'is-active' : ''}>
              {link.label}
            </Target>
          ))}
        </nav>

        <div className="ld-cards">
          <Link className="ld-card ld-profile" to="/user/play" onClick={onClose}>
            <UserAvatar src={avatar} name={playerName} size={36} />
            <span>
              {playerName}
              <small>{t('cta.enterArena')}</small>
            </span>
          </Link>
          <Link className="ld-card" to="/user/play" onClick={onClose}>
            {t('cta.enterArena')}
            <small>{t('drawer.joinLive')}</small>
          </Link>
        </div>

        <a className="ld-card ld-apk" href={apkHref} onClick={onClose}>
          {t('drawer.downloadApk')}
          {apkNote ? <small>{apkNote}</small> : null}
        </a>

        <div className="ld-tools">
          <div className="ld-accents" aria-label={t('theme.accent')}>
            {MENU_ACCENTS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                aria-label={chip.id}
                className={accentId === chip.id ? 'is-on' : undefined}
                style={{ background: chip.color }}
                onClick={() => pickAccent(chip.id)}
              />
            ))}
          </div>
          <LocaleSelect />
        </div>

        <footer className="ld-foot">
          <button
            type="button"
            className="ld-signout"
            onClick={() => {
              onSignOut();
              onClose();
            }}
          >
            {t('cta.signout')}
          </button>
          <Link className="ld-enter" to="/user/play" onClick={onClose}>
            {t('cta.enterArena')}
          </Link>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
