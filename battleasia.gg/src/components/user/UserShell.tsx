import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HudProvider, useHud } from '../../contexts/HudContext';
import { ASSETS } from '../../lib/assets';
import { fetchMe, logout, readSessionUser } from '../../lib/auth';
import { isApiError } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { fetchP2Flags } from '../../lib/p2';
import { disconnectSocket, getAuthedSocket } from '../../lib/socket';
import { fetchNotifications, pingPresence } from '../../lib/social';
import { CoinValue } from '../CoinValue';
import { ErrorBoundary } from '../ErrorBoundary';
import { LocaleSelect } from '../LocaleSelect';
import { ThemeDock } from '../ThemeDock';
import { UserAvatar } from '../UserAvatar';
import { openBacShop } from '../../lib/wallet';

const SiteFooter = lazy(() => import('../SiteFooter').then((m) => ({ default: m.SiteFooter })));
const DeferredSupportChat = lazy(() =>
  import('../SupportChat').then((m) => ({ default: m.DeferredSupportChat })),
);
const SocialFab = lazy(() => import('../SocialFab').then((m) => ({ default: m.SocialFab })));

function inEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function UserChrome() {
  const { t } = useI18n();
  const { toast, toastText, handlers } = useHud();
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState(Number(readSessionUser()?.balance) || 0);
  const [hide, setHide] = useState(() => localStorage.getItem('ba-hide-balance') === '1');
  const [sheet, setSheet] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [pop, setPop] = useState<'more' | 'user' | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem('ba-mute') === '1');
  const [alerts, setAlerts] = useState(0);
  const [labsOn, setLabsOn] = useState(false);
  const [me, setMe] = useState(readSessionUser());

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetchP2Flags().then((f) => setLabsOn(Object.values(f).some(Boolean)));
    }, 1200);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let live = true;
    fetchMe()
      .then((user) => {
        if (!live) return;
        setMe(user);
        if (user?.balance != null) setBalance(Number(user.balance) || 0);
      })
      .catch((err) => {
        if (!live) return;
        if (isApiError(err) && err.status === 401) {
          navigate(`/auth/sign-in?returnTo=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session boot once per shell mount
  }, [navigate]);

  useEffect(() => {
    const onFocus = () => {
      fetchMe()
        .then((user) => {
          setMe(user);
          if (user?.balance != null) setBalance(Number(user.balance) || 0);
        })
        .catch(() => undefined);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    const onAvatar = (ev: Event) => {
      const avatar = (ev as CustomEvent<{ avatar?: string }>).detail?.avatar;
      if (!avatar) return;
      setMe((prev) => (prev ? { ...prev, avatar } : prev));
    };
    window.addEventListener('ba:avatar-updated', onAvatar);
    return () => window.removeEventListener('ba:avatar-updated', onAvatar);
  }, []);

  useEffect(() => {
    let interval = 0;
    const start = () => {
      void pingPresence().catch(() => undefined);
      interval = window.setInterval(() => void pingPresence().catch(() => undefined), 45000);
    };
    const id = window.setTimeout(start, 1500);
    return () => {
      window.clearTimeout(id);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
    setPop(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!pop) return;
    function onDoc() {
      setPop(null);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [pop]);

  useEffect(() => {
    function onCount(e: Event) {
      setAlerts(Number((e as CustomEvent<number>).detail) || 0);
    }
    window.addEventListener('ba-alerts', onCount);
    const id = window.setTimeout(() => {
      fetchNotifications()
        .then((rows) => setAlerts(rows.filter((n) => n.isUnRead).length))
        .catch(() => undefined);
    }, 1400);
    return () => {
      window.removeEventListener('ba-alerts', onCount);
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    let off: (() => void) | undefined;
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      const onBal = (data: { balance?: number }) => {
        if (data?.balance != null) setBalance(Number(data.balance) || 0);
      };
      const onNote = (data: { subject?: string; title?: string; message?: string }) => {
        setAlerts((n) => n + 1);
        toast(data.subject || data.title || data.message || t('hud.alert'));
      };
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
  }, [t, toast]);

  const closeSheet = useCallback(() => setSheet(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (sheet) {
          closeSheet();
          return;
        }
        return;
      }
      if (inEditable(e.target)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === '?') {
        e.preventDefault();
        setSheet((v) => !v);
        return;
      }
      if (k === 'j') {
        e.preventDefault();
        handlers.quickJoin();
      } else if (k === 'c') {
        e.preventDefault();
        handlers.copyRoom();
      } else if (k === 'r') {
        e.preventDefault();
        handlers.ready();
      } else if (k === 'l') {
        e.preventDefault();
        handlers.leave();
      } else if (k === 'm') {
        e.preventDefault();
        handlers.matchDetails();
      } else if (k === 'b') {
        e.preventDefault();
        openBacShop('entry');
      } else if (k === 't') {
        e.preventDefault();
        openBacShop('transfer');
      } else if (k === 'h') {
        e.preventDefault();
        setHide((v) => {
          const next = !v;
          localStorage.setItem('ba-hide-balance', next ? '1' : '0');
          return next;
        });
      } else if (k === 'Enter') {
        handlers.openChat();
      } else if (k === 'Tab' && !inEditable(e.target)) {
        e.preventDefault();
        handlers.leaderboard();
      } else if (k === 'f') {
        e.preventDefault();
        handlers.follow();
      } else if (k === 's') {
        e.preventDefault();
        handlers.share();
      } else if (k === 'u') {
        e.preventDefault();
        setMuted((v) => {
          const next = !v;
          localStorage.setItem('ba-mute', next ? '1' : '0');
          toast(next ? t('hud.mute') : t('hud.unmute'));
          return next;
        });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSheet, handlers, sheet, t, toast]);

  return (
    <div className="play-app">
      <header className={`play-hud${navOpen ? ' is-open' : ''}`}>
        <Link className="brand" to="/dashboard">
          <img src={ASSETS.logo} width={44} height={44} alt="BattleAsia" />
          <div className="brand-name">
            BATTLE ASIA <span>2.0</span>
          </div>
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
        <nav className="play-nav" aria-label={t('hud.arena')} onClick={() => setNavOpen(false)}>
          <Link className={location.pathname.startsWith('/user/play') ? 'active' : ''} to="/user/play">
            {t('nav.play')}
          </Link>
          <Link className={location.pathname === '/user/shop' ? 'active' : ''} to="/user/shop">
            {t('nav.shop')}
          </Link>
          <Link className={location.pathname.startsWith('/user/earn') ? 'active' : ''} to="/user/earn">
            {t('nav.earn')}
          </Link>
          <a
            href="#transfer"
            onClick={(e) => {
              e.preventDefault();
              openBacShop('transfer');
            }}
          >
            {t('nav.transfer')}
          </a>
          <Link className={location.pathname.startsWith('/user/feed') ? 'active' : ''} to="/user/feed">
            {t('nav.feed')}
          </Link>
          <div className="hud-more" onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={
                location.pathname.startsWith('/user/referral') ||
                location.pathname.startsWith('/user/labs') ||
                location.pathname.includes('referr')
                  ? 'active'
                  : ''
              }
              aria-expanded={pop === 'more'}
              onClick={() => setPop((v) => (v === 'more' ? null : 'more'))}
            >
              {t('nav.more')}
            </button>
            {pop === 'more' ? (
              <div className="hud-menu">
                {labsOn ? (
                  <Link className={location.pathname.startsWith('/user/labs') ? 'active' : ''} to="/user/labs">
                    {t('nav.labs')}
                  </Link>
                ) : null}
                <Link
                  className={location.pathname.startsWith('/user/referral') || location.pathname.includes('referr') ? 'active' : ''}
                  to="/user/referral"
                >
                  {t('nav.referral')}
                </Link>
              </div>
            ) : null}
          </div>
        </nav>
        <div className="play-hud-right">
          <ThemeDock />
          <Link
            className={`hud-bell ${location.pathname.startsWith('/user/account/notifications') ? 'active' : ''}`}
            to="/user/account/notifications"
            aria-label={t('hud.alerts')}
            title={t('hud.alerts')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 17h12l-1.4-2.1V11a4.6 4.6 0 0 0-3.1-4.3V6a1.5 1.5 0 1 0-3 0v.7A4.6 4.6 0 0 0 7.4 11v3.9L6 17Zm6 3a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"
                fill="currentColor"
              />
            </svg>
            {alerts > 0 ? <span className="hud-dot">{alerts > 9 ? '9+' : alerts}</span> : null}
          </Link>
          <LocaleSelect />
        </div>
        <button
          type="button"
          className="balance-pill hud-balance"
          onClick={() => {
            setHide((v) => {
              const next = !v;
              localStorage.setItem('ba-hide-balance', next ? '1' : '0');
              return next;
            });
          }}
          title={t('hud.balanceHint')}
        >
          {hide ? <span className="coin"><b>**** BAC</b></span> : <CoinValue value={balance} />}
        </button>
        <div className="hud-account" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="hud-user"
            title={me?.username || t('nav.account')}
            aria-label={t('nav.account')}
            aria-expanded={pop === 'user'}
            onClick={() => setPop((v) => (v === 'user' ? null : 'user'))}
          >
            <UserAvatar className={`frame-${me?.cosmeticId || 'none'}`} src={me?.avatar} name={me?.username} size={36} />
          </button>
          {pop === 'user' ? (
            <div className="hud-menu is-end">
              <Link to="/user/account/profile">{t('nav.account')}</Link>
              <Link to="/dashboard">{t('nav.home')}</Link>
              <button
                type="button"
                onClick={() => {
                  setPop(null);
                  setSheet(true);
                }}
              >
                {t('hud.shortcuts')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setPop(null);
                  disconnectSocket();
                  await logout();
                  navigate('/dashboard');
                }}
              >
                {t('cta.signout')}
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <ErrorBoundary>
        <Outlet context={{ toast, setBalance, balance, muted }} />
      </ErrorBoundary>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
      <Suspense fallback={null}>
        <SocialFab />
        <DeferredSupportChat />
      </Suspense>
      {toastText ? <div className="play-toast" role="status">{toastText}</div> : null}
      {sheet ? (
        <div className="play-sheet" role="dialog" aria-labelledby="cheat-title">
          <button className="play-sheet-bg" type="button" aria-label={t('hud.close')} onClick={closeSheet} />
          <div className="play-sheet-card">
            <h2 id="cheat-title">{t('hud.title')}</h2>
            <ul>
              <li><kbd>J</kbd> {t('hud.j')}</li>
              <li><kbd>C</kbd> {t('hud.c')}</li>
              <li><kbd>R</kbd> {t('hud.r')}</li>
              <li><kbd>L</kbd> {t('hud.l')}</li>
              <li><kbd>M</kbd> {t('hud.m')}</li>
              <li><kbd>B</kbd> {t('hud.b')}</li>
              <li><kbd>T</kbd> {t('hud.t')}</li>
              <li><kbd>H</kbd> {t('hud.h')}</li>
              <li><kbd>Enter</kbd> {t('hud.enter')}</li>
              <li><kbd>Tab</kbd> {t('hud.tab')}</li>
              <li><kbd>F</kbd> {t('hud.f')}</li>
              <li><kbd>S</kbd> {t('hud.s')}</li>
              <li><kbd>U</kbd> {t('hud.u')}</li>
              <li><kbd>Esc</kbd> {t('hud.esc')}</li>
              <li><kbd>?</kbd> {t('hud.help')}</li>
            </ul>
            <button className="btn btn-primary" type="button" onClick={closeSheet}>
              {t('hud.close')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function UserShell() {
  return (
    <HudProvider>
      <UserChrome />
    </HudProvider>
  );
}
