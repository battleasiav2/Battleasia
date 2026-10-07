import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { ASSETS } from '../lib/assets';
import { fetchMe, getMainAppUrl, isShopAuthed, leaveShop, patchSessionBalance, readSessionUser, type AuthUser } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { LocaleSelect } from './LocaleSelect';
import { ThemeDock } from './ThemeDock';
import '../styles/bac-gate.css';

type Props = {
  balance?: number;
  hideBalance?: boolean;
  onToggleBalance?: () => void;
};

function asBalance(value: unknown) {
  if (value && typeof value === 'object' && 'balance' in value) {
    return Number((value as { balance?: unknown }).balance) || 0;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function ShopPublicHeader({ balance, hideBalance, onToggleBalance }: Props) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [hide, setHide] = useState(false);
  const [who, setWho] = useState<AuthUser | null>(() => (isShopAuthed() ? readSessionUser() : null));
  const [live, setLive] = useState<number | null>(null);
  const shown = balance ?? live ?? asBalance(who?.balance);

  useEffect(() => {
    if (balance != null) return;
    let on = true;
    fetchMe()
      .then((me) => {
        if (!on || !me) return;
        setWho(me);
        if (me.balance != null) {
          const next = asBalance(me.balance);
          setLive(next);
          if (isShopAuthed()) patchSessionBalance(next);
        }
      })
      .catch(() => undefined);
    return () => {
      on = false;
    };
  }, [balance, pathname]);

  useEffect(() => {
    const onBal = (ev: Event) => setLive(asBalance((ev as CustomEvent<number>).detail));
    window.addEventListener('ba-balance', onBal);
    return () => window.removeEventListener('ba-balance', onBal);
  }, []);
  const hidden = hideBalance ?? hide;
  const main = getMainAppUrl('/dashboard');

  useEffect(() => {
    if (!more) return;
    const close = () => setMore(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [more]);

  function goMain(path: string) {
    window.location.assign(getMainAppUrl(path));
  }

  function signOut() {
    leaveShop();
    window.location.assign(getMainAppUrl('/dashboard'));
  }

  function toggleBalance() {
    if (onToggleBalance) onToggleBalance();
    else setHide((v) => !v);
  }

  return (
    <header className={`shop-top${open ? ' is-open' : ''}`}>
      <a className="shop-top-brand" href={main}>
        <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
        <span>Battle Asia</span>
      </a>
      <button
        className="nav-burger"
        type="button"
        aria-expanded={open}
        aria-label={open ? t('hud.closeMenu') : t('hud.openMenu')}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>
      <nav className="shop-top-nav" aria-label="Battle Asia" onClick={() => setOpen(false)}>
        <a href={getMainAppUrl('/user/play')}>{t('nav.play')}</a>
        <a href={getMainAppUrl('/user/shop')}>{t('nav.shop')}</a>
        <a href={getMainAppUrl('/user/earn')}>{t('nav.earn')}</a>
        <Link className={pathname.startsWith('/user/transfer') ? 'active' : ''} to="/user/transfer">
          {t('nav.transfer')}
        </Link>
        <a href={getMainAppUrl('/user/feed')}>{t('nav.feed')}</a>
        <span className="shop-top-more" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" aria-expanded={more} onClick={() => setMore((v) => !v)}>
            {t('nav.more')}
          </button>
          {more ? (
            <span className="shop-top-menu">
              <button type="button" onClick={() => goMain('/user/labs')}>{t('nav.labs')}</button>
              <button type="button" onClick={() => goMain('/user/referral')}>{t('nav.referral')}</button>
            </span>
          ) : null}
        </span>
      </nav>
      <div className="shop-top-tools">
        <button type="button" className="shop-top-user" aria-label={t('nav.account')} title={who?.username || t('nav.account')} onClick={() => goMain('/user/account/profile')}>
          {(who?.username || 'B').slice(0, 1).toUpperCase()}
        </button>
        <ThemeDock />
        <button type="button" className="shop-top-bell" aria-label={t('hud.alerts')} onClick={() => goMain('/user/account/notifications')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 17h12l-1.4-2.1V11a4.6 4.6 0 0 0-3.1-4.3V6a1.5 1.5 0 1 0-3 0v.7A4.6 4.6 0 0 0 7.4 11v3.9L6 17Zm6 3a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z" fill="currentColor" />
          </svg>
        </button>
        <button type="button" className="balance-pill hud-balance" onClick={toggleBalance}>
          {hidden ? <span className="coin"><b>**** BAC</b></span> : <CoinValue value={shown} />}
        </button>
        <LocaleSelect />
        <button type="button" className="shop-top-out" onClick={signOut}>
          {t('cta.signout')}
        </button>
      </div>
    </header>
  );
}
