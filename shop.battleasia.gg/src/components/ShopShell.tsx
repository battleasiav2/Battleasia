import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HudProvider, useHud } from '../contexts/HudContext';
import { ASSETS } from '../lib/assets';
import { fetchMe, getMainAppUrl, isShopAuthed, leaveShop, patchSessionBalance, readSessionUser } from '../lib/auth';
import { api, isApiError, unwrapList } from '../lib/api';
import { shopUntil } from '../lib/shopSession';
import { useI18n } from '../lib/i18n';
import { getAuthedSocket } from '../lib/socket';
import { CoinValue } from './CoinValue';
import { GamingCursor } from './GamingCursor';
import { LocaleSelect } from './LocaleSelect';
import { DrawerIcons } from './MobileDrawer';
import { NoticeDrawer } from './NoticeDrawer';
import { ThemeDock } from './ThemeDock';

function inEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

function ShopChrome() {
  const { t } = useI18n();
  const { toast, toastText, handlers } = useHud();
  const location = useLocation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(Number(readSessionUser()?.balance) || 0);
  const [hide, setHide] = useState(() => sessionStorage.getItem('ba-shop-hide-balance') === '1');
  const [navOpen, setNavOpen] = useState(false);
  const [alerts, setAlerts] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (inEditable(e.target)) return;
      const k = e.key;
      if (k === 'w') {
        e.preventDefault();
        navigate('/user/wallet');
      } else if (k === 'b') {
        e.preventDefault();
        navigate('/user/shop');
      } else if (k === 't') {
        e.preventDefault();
        navigate('/user/transfer');
      } else if (k === 'd') {
        e.preventDefault();
        navigate('/user/wallet?withdraw=1');
      } else if (k === 'h') {
        e.preventDefault();
        setHide((v) => {
          const next = !v;
          sessionStorage.setItem('ba-shop-hide-balance', next ? '1' : '0');
          return next;
        });
      } else if (k === 's') {
        e.preventDefault();
        handlers.share();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers, navigate]);

  useEffect(() => {
    const until = shopUntil();
    if (!until) return;
    function expire() {
      if (shopUntil() > Date.now()) return;
      leaveShop();
      navigate('/auth/sign-in?reauth=1', { replace: true });
    }
    const id = window.setTimeout(expire, Math.max(0, until - Date.now()));
    window.addEventListener('focus', expire);
    document.addEventListener('visibilitychange', expire);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('focus', expire);
      document.removeEventListener('visibilitychange', expire);
    };
  }, [navigate]);

  useEffect(() => {
    if (!isShopAuthed()) return;
    fetchMe()
      .then((user) => {
        if (user?.balance != null) {
          const next = Number(user.balance) || 0;
          setBalance(next);
          patchSessionBalance(next);
        }
      })
      .catch((err) => {
        if (isApiError(err) && err.status === 401) {
          leaveShop();
          navigate(`/auth/sign-in?returnTo=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
      });
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!isShopAuthed()) return;
    let off: (() => void) | undefined;
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      const onBal = (data: { balance?: number }) => {
        if (data?.balance == null) return;
        const next = Number(data.balance) || 0;
        setBalance(next);
        patchSessionBalance(next);
      };
      const onNote = () => setAlerts((n) => n + 1);
      sock.on('balance-updated', onBal);
      sock.on('user-stats-updated', onBal);
      sock.on('new-notification', onNote);
      off = () => {
        sock.off('balance-updated', onBal);
        sock.off('user-stats-updated', onBal);
        sock.off('new-notification', onNote);
      };
    });
    return () => off?.();
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isShopAuthed()) return;
    const id = window.setTimeout(() => {
      api('/api/v2/notifications?limit=40')
        .then((payload) => {
          const rows = unwrapList<{ isUnRead?: boolean }>(payload);
          setAlerts(rows.filter((row) => row.isUnRead).length);
        })
        .catch(() => undefined);
    }, 1400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  const closeNav = useCallback(() => setNavOpen(false), []);
  const path = location.pathname;

  function toggleBalance() {
    setHide((v) => {
      const next = !v;
      sessionStorage.setItem('ba-shop-hide-balance', next ? '1' : '0');
      return next;
    });
  }

  return (
    <div className="play-app">
      <GamingCursor />
      <header className={`play-hud${navOpen ? ' is-open' : ''}`}>
        <Link className="brand" to="/user/shop" onClick={closeNav}>
          <img src={ASSETS.logo} width={44} height={44} alt="BattleAsia" />
          <span className="brand-name">Battle Asia</span>
        </Link>
        <button
          className="nav-burger"
          type="button"
          aria-expanded={navOpen}
          aria-label={navOpen ? t('hud.closeMenu') : t('hud.openMenu')}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
        </button>
        <div className="hud-menu-bar">
          <nav className="play-nav" aria-label={t('nav.shop')} onClick={closeNav}>
            <a href={getMainAppUrl('/user/play')}>{t('nav.play')}</a>
            <Link className={path.startsWith('/user/shop') || path === '/user' ? 'active' : ''} to="/user/shop">
              {t('nav.shop')}
            </Link>
            <a href={getMainAppUrl('/user/earn')}>{t('nav.earn')}</a>
            <Link className={path.startsWith('/user/transfer') ? 'active' : ''} to="/user/transfer">
              {t('nav.transfer')}
            </Link>
            <a href={getMainAppUrl('/user/feed')}>{t('nav.feed')}</a>
          </nav>
        </div>
        <div className="play-hud-right">
          <ThemeDock />
          <a
            className="hud-bell"
            href={getMainAppUrl('/user/account/notifications')}
            aria-label={t('hud.alerts')}
            title={t('hud.alerts')}
            onClick={(e) => {
              if (window.matchMedia('(max-width: 820px)').matches) {
                e.preventDefault();
                setNotesOpen(true);
              }
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 17h12l-1.4-2.1V11a4.6 4.6 0 0 0-3.1-4.3V6a1.5 1.5 0 1 0-3 0v.7A4.6 4.6 0 0 0 7.4 11v3.9L6 17Zm6 3a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"
                fill="currentColor"
              />
            </svg>
            {alerts > 0 ? <span className="hud-dot">{alerts > 9 ? '9+' : alerts}</span> : null}
          </a>
          <button type="button" className="balance-pill hud-balance" onClick={toggleBalance}>
            {hide ? <span className="coin"><b>**** BAC</b></span> : <CoinValue value={balance} />}
          </button>
          <LocaleSelect />
          <button
            className="hud-signout"
            type="button"
            onClick={() => {
              leaveShop();
              window.location.assign(getMainAppUrl('/dashboard'));
            }}
          >
            {t('cta.signout')}
          </button>
        </div>
      </header>
      <NoticeDrawer open={notesOpen} onClose={() => setNotesOpen(false)} onCount={setAlerts} />
      {navOpen
        ? createPortal(
            <div className="m-drawer m-drawer--landing m-drawer--dash" role="dialog" aria-modal="true" aria-label={t('nav.shop')}>
              <aside className="ld-panel">
                <header className="ld-head">
                  <button className="ld-close" type="button" aria-label={t('hud.closeMenu')} onClick={closeNav}>
                    {DrawerIcons.close}
                  </button>
                  <Link className="ld-brand" to="/user/shop" onClick={closeNav}>
                    <img src={ASSETS.logo} width={36} height={36} alt="" />
                    <span>Battle Asia</span>
                  </Link>
                </header>
                <nav className="ld-nav" onClick={closeNav}>
                  <a href={getMainAppUrl('/user/play')}>
                    <span className="ld-nav-ico">{DrawerIcons.gamepad}</span>
                    <span>{t('nav.play')}</span>
                  </a>
                  <Link className={path.startsWith('/user/shop') || path === '/user' ? 'is-active' : ''} to="/user/shop">
                    <span className="ld-nav-ico">{DrawerIcons.bag}</span>
                    <span>{t('nav.shop')}</span>
                  </Link>
                  <a href={getMainAppUrl('/user/earn')}>
                    <span className="ld-nav-ico">{DrawerIcons.gift}</span>
                    <span>{t('nav.earn')}</span>
                  </a>
                  <Link className={path.startsWith('/user/transfer') ? 'is-active' : ''} to="/user/transfer">
                    <span className="ld-nav-ico">{DrawerIcons.send}</span>
                    <span>{t('nav.transfer')}</span>
                  </Link>
                  <a href={getMainAppUrl('/user/feed')}>
                    <span className="ld-nav-ico">{DrawerIcons.feed}</span>
                    <span>{t('nav.feed')}</span>
                  </a>
                </nav>
                <button className="ld-card" type="button" onClick={toggleBalance}>
                  <small>{t('shop.balance')}</small>
                  {hide ? <b>**** BAC</b> : <CoinValue value={balance} />}
                </button>
                <div className="ld-tools">
                  <ThemeDock />
                  <LocaleSelect />
                </div>
                <footer className="ld-foot">
                  <button
                    className="ld-signout"
                    type="button"
                    onClick={() => {
                      leaveShop();
                      window.location.assign(getMainAppUrl('/dashboard'));
                    }}
                  >
                    {t('cta.signout')}
                  </button>
                </footer>
              </aside>
            </div>,
            document.body,
          )
        : null}
      <Outlet context={{ toast, setBalance }} />
      {toastText ? <div className="play-toast" role="status">{toastText}</div> : null}
    </div>
  );
}

export function ShopShell() {
  return (
    <HudProvider>
      <ShopChrome />
    </HudProvider>
  );
}
