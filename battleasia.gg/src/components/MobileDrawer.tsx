import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

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

type Props = {
  open: boolean;
  onClose: () => void;
  logo: string;
  title: string;
  subtitle: string;
  links: DrawerLink[];
  section?: { title: string; cards: DrawerCard[] };
  tools?: { label: string; content: ReactNode };
  footer: {
    icon?: DrawerTarget & { label: string; icon: ReactNode };
    primary: DrawerTarget & { label: string; arrow?: boolean };
  };
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

export function MobileDrawer({ open, onClose, logo, title, subtitle, links, section, tools, footer }: Props) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

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
    <div className="m-drawer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="m-drawer-bg" type="button" tabIndex={-1} aria-label={t('hud.closeMenu')} onClick={onClose} />
      <aside className="m-drawer-panel">
        <header className="m-drawer-head">
          <span className="m-drawer-logo">
            <img src={logo} width={40} height={40} alt="" />
          </span>
          <span className="m-drawer-title">
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>
          <button ref={closeRef} className="m-drawer-close" type="button" aria-label={t('hud.closeMenu')} onClick={onClose}>
            {DrawerIcons.close}
          </button>
        </header>

        <div className="m-drawer-body">
          <nav className="m-drawer-links">
            {links.map((link) => (
              <Target
                key={link.key}
                target={link}
                onClose={onClose}
                className={`m-drawer-link${link.active ? ' is-active' : ''}`}
              >
                <span>{link.label}</span>
                {link.external ? DrawerIcons.external : DrawerIcons.chevron}
              </Target>
            ))}
          </nav>

          {section && section.cards.length ? (
            <>
              <div className="m-drawer-label">{section.title}</div>
              <div className="m-drawer-cards">
                {section.cards.map((card) => (
                  <Target
                    key={card.key}
                    target={card}
                    onClose={onClose}
                    className={`m-drawer-card${card.active ? ' is-active' : ''}`}
                  >
                    <span className="m-drawer-card-icon">{card.icon}</span>
                    <strong>
                      {card.label}
                      {card.badge ? <em className="m-drawer-badge">{card.badge > 9 ? '9+' : card.badge}</em> : null}
                      {card.external ? <span className="m-drawer-card-ext">{DrawerIcons.external}</span> : null}
                    </strong>
                    <span className="m-drawer-card-desc">{card.desc}</span>
                  </Target>
                ))}
              </div>
            </>
          ) : null}

          {tools ? (
            <div className="m-drawer-tools">
              <span className="m-drawer-tools-label">{tools.label}</span>
              <div className="m-drawer-tools-row">{tools.content}</div>
            </div>
          ) : null}
        </div>

        <footer className="m-drawer-foot">
          {footer.icon ? (
            <Target target={footer.icon} onClose={onClose} className="m-drawer-icon-btn" label={footer.icon.label}>
              {footer.icon.icon}
            </Target>
          ) : null}
          <Target target={footer.primary} onClose={onClose} className="m-drawer-cta">
            <span>{footer.primary.label}</span>
            {footer.primary.arrow ? DrawerIcons.arrow : null}
          </Target>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
