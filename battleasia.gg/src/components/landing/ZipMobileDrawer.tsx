import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ZipLocaleSelect } from './ZipLocaleSelect';
import { formatApkSize, type AppDownloadInfo } from '../../lib/app-download';
import { useI18n } from '../../lib/i18n';

type Props = {
  open: boolean;
  onClose: () => void;
  logo: string;
  siteName: string;
  links: Array<{ href: string; label: string }>;
  inArena: boolean;
  arenaTo: string;
  signInTo: string;
  apk: AppDownloadInfo | null;
  onSignOut?: () => void;
};

export function ZipMobileDrawer({ open, onClose, logo, siteName, links, inArena, arenaTo, signInTo, apk, onSignOut }: Props) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector('.landing-fw')?.classList.add('modal-open');
    return () => {
      document.body.style.overflow = prev;
      document.querySelector('.landing-fw')?.classList.remove('modal-open');
    };
  }, [open]);

  return (
    <>
      <div className={`drawer-overlay${open ? ' is-open' : ''}`} aria-hidden={!open} onClick={onClose} />
      <aside className={`mobile-drawer${open ? ' is-open' : ''}`} aria-label="Mobile menu" aria-hidden={!open}>
        <div className="logo">
          <img src={logo} alt="" className="logo-img" width={88} height={88} />
          <span className="logo-text">{siteName}</span>
        </div>
        <nav className="drawer-nav">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={onClose}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="drawer-quick">
          <Link className="btn btn-ghost" to={signInTo} onClick={onClose}>
            {t('cta.signin')}
          </Link>
          <Link className="btn btn-primary" to={inArena ? '/user/play' : arenaTo} onClick={onClose}>
            {t('cta.enterArena')}
          </Link>
        </div>
        <div className="apk-card glass">
          <strong>{t('drawer.apk')}</strong>
          <span>
            {[apk?.version ? `v${apk.version}` : '', apk?.fileSize ? formatApkSize(apk.fileSize) : ''].filter(Boolean).join(' · ')}
          </span>
          {apk && !apk.enabled ? null : (
            <a
              className="btn btn-primary btn-block"
              style={{ marginTop: 12 }}
              href={apk?.downloadUrl || '/api/uploads/app/BattleAsia.apk'}
              download={apk?.fileName || 'BattleAsia.apk'}
            >
              {t('cta.apk')}
            </a>
          )}
        </div>
        <div className="settings-row">
          <ZipLocaleSelect />
        </div>
        <div className="drawer-footer-actions btn-row btn-row--stretch">
          {inArena ? (
            <button type="button" className="btn btn-ghost" onClick={() => { onSignOut?.(); onClose(); }}>
              {t('cta.signout')}
            </button>
          ) : (
            <Link className="btn btn-ghost" to={signInTo} onClick={onClose}>
              {t('cta.signin')}
            </Link>
          )}
          <Link className="btn btn-primary" to={arenaTo} onClick={onClose}>
            {t('cta.signupJoin')}
          </Link>
        </div>
      </aside>
    </>
  );
}
