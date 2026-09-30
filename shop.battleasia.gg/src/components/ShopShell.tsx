import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { HudProvider, useHud } from '../contexts/HudContext';
import { ASSETS } from '../lib/assets';
import { fetchMe, getMainAppUrl, isShopAuthed, leaveShop, patchSessionBalance, readSessionUser } from '../lib/auth';
import { isApiError } from '../lib/api';
import { shopUntil } from '../lib/shopSession';
import { useI18n } from '../lib/i18n';
import { getAuthedSocket } from '../lib/socket';
import { LocaleSelect } from './LocaleSelect';
import { DrawerIcons, MobileDrawer } from './MobileDrawer';
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
        navigate('/user/withdrawal');
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
      sock.on('balance-updated', onBal);
      sock.on('user-stats-updated', onBal);
      off = () => {
        sock.off('balance-updated', onBal);
        sock.off('user-stats-updated', onBal);
      };
    });
    return () => off?.();
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const closeNav = useCallback(() => setNavOpen(false), []);
  const path = location.pathname;

  return (
    <div className="play-app">
      <header className="play-hud">
        <Link className="brand" to="/user/shop">
          <img src={ASSETS.logo} width={44} height={44} alt="BattleAsia Shop" />
          <div className="brand-name">
            BATTLE ASIA <span>SHOP</span>
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
        <nav className="play-nav" aria-label="Shop" onClick={() => setNavOpen(false)}>
          <Link className={location.pathname.startsWith('/user/shop') || location.pathname === '/user' ? 'active' : ''} to="/user/shop">
            {t('nav.shop')}
          </Link>
          <Link className={location.pathname.startsWith('/user/wallet') ? 'active' : ''} to="/user/wallet">
            {t('nav.wallet')}
          </Link>
          <Link className={location.pathname.startsWith('/user/transfer') ? 'active' : ''} to="/user/transfer">
            {t('nav.transfer')}
          </Link>
          <Link className={location.pathname.startsWith('/user/withdrawal') ? 'active' : ''} to="/user/withdrawal">
            {t('nav.withdraw')}
          </Link>
        </nav>
        <button
          type="button"
          className="balance-pill hud-balance"
          onClick={() => {
            setHide((v) => {
              const next = !v;
              sessionStorage.setItem('ba-shop-hide-balance', next ? '1' : '0');
              return next;
            });
          }}
        >
          {hide ? <span className="coin"><b>**** BAC</b></span> : <CoinValue value={balance} />}
        </button>
        <div className="play-hud-right">
          <LocaleSelect />
          <ThemeDock />
          <a className="btn btn-ghost" href={getMainAppUrl('/user/play')}>
            {t('auth.arena')}
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              leaveShop();
              window.location.assign(getMainAppUrl());
            }}
          >
            {t('auth.leaveShop')}
          </button>
        </div>
      </header>
      <MobileDrawer
        open={navOpen}
        onClose={closeNav}
        logo={ASSETS.logo}
        title="BATTLE ASIA SHOP"
        subtitle={t('drawer.shopTagline')}
        links={[
          { key: 'shop', label: t('nav.shop'), to: '/user/shop', active: path.startsWith('/user/shop') || path === '/user' },
          { key: 'wallet', label: t('nav.wallet'), to: '/user/wallet', active: path.startsWith('/user/wallet') },
        ]}
        section={{
          title: t('drawer.money'),
          cards: [
            {
              key: 'transfer',
              label: t('nav.transfer'),
              desc: t('drawer.transferDesc'),
              icon: DrawerIcons.send,
              to: '/user/transfer',
              active: path.startsWith('/user/transfer'),
            },
            {
              key: 'withdraw',
              label: t('nav.withdraw'),
              desc: t('drawer.withdrawDesc'),
              icon: DrawerIcons.cash,
              to: '/user/withdrawal',
              active: path.startsWith('/user/withdrawal'),
            },
          ],
        }}
        tools={{
          label: t('drawer.settings'),
          content: (
            <>
              <ThemeDock />
              <LocaleSelect />
            </>
          ),
        }}
        footer={{
          icon: {
            label: t('auth.leaveShop'),
            icon: DrawerIcons.logout,
            onClick: () => {
              leaveShop();
              window.location.assign(getMainAppUrl());
            },
          },
          primary: { label: t('auth.arena'), href: getMainAppUrl('/user/play'), arrow: true },
        }}
      />
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
