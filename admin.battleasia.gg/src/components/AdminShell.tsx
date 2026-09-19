import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ASSETS } from '../lib/assets';
import { adminLogout, can, fetchAdminMe, readAdminUser } from '../lib/auth';
import { isApiError } from '../lib/api';
import { NAV, paletteItems } from '../lib/catalog';
import { NavGlyph } from '../lib/nav-icons';
import { disconnectAdminSocket, getAdminSocket } from '../lib/socket';
import { useI18n } from '../lib/i18n';
import { ThemeDock } from './ThemeDock';
import { LocaleSelect } from './LocaleSelect';

const OPEN_KEY = 'ba-admin-nav-open';
const RAIL_KEY = 'ba-admin-rail';

function readOpen(): string[] | null {
  try {
    const raw = localStorage.getItem(OPEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function groupForPath(path: string) {
  return NAV.find((group) => group.items.some((item) => item.to === path || (item.to !== '/dashboard' && path.startsWith(`${item.to}/`))))?.label;
}

function itemActive(path: string, to: string) {
  if (to === '/dashboard') return path === '/dashboard';
  return path === to || path.startsWith(`${to}/`);
}

export function AdminShell() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const user = readAdminUser();
  const [toast, setToast] = useState('');
  const [palette, setPalette] = useState(false);
  const [q, setQ] = useState('');
  const [mute, setMute] = useState(() => localStorage.getItem('ba-admin-mute') === '1');
  const [hi, setHi] = useState(0);
  const [pending, setPending] = useState({ deposits: 0, withdrawals: 0 });
  const [drawer, setDrawer] = useState(false);
  const [account, setAccount] = useState(false);
  const [rail, setRail] = useState(() => localStorage.getItem(RAIL_KEY) === '1');
  const [open, setOpen] = useState<string[]>(() => {
    const saved = readOpen();
    const current = groupForPath(location.pathname);
    if (saved) return current && !saved.includes(current) ? [...saved, current] : saved;
    return current ? [current] : ['nav.overview'];
  });
  const muteRef = useRef(mute);
  const accountRef = useRef<HTMLDivElement>(null);
  muteRef.current = mute;
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const initials = (user?.username || user?.email || 'A').slice(0, 1).toUpperCase();

  useEffect(() => {
    fetchAdminMe().catch((err) => {
      if (isApiError(err) && err.status === 401) {
        void adminLogout();
        navigate('/auth/login', { replace: true });
      }
    });
  }, [navigate]);

  useEffect(() => {
    setDrawer(false);
    setAccount(false);
    const current = groupForPath(location.pathname);
    if (current) {
      setOpen((prev) => (prev.includes(current) ? prev : [...prev, current]));
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(OPEN_KEY, JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(true);
        return;
      }
      if (e.key === 'Escape') {
        setPalette(false);
        setDrawer(false);
        setAccount(false);
        return;
      }
      if (typing) return;
      if (e.key === '?') {
        e.preventDefault();
        setPalette(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!account) return;
    function onDoc(e: PointerEvent) {
      if (!accountRef.current?.contains(e.target as Node)) setAccount(false);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [account]);

  useEffect(() => {
    let off: (() => void) | undefined;
    getAdminSocket().then((sock) => {
      if (!sock) return;
      const onDep = () => ping(t('chrome.newDeposit'));
      const onWdr = () => ping(t('chrome.newWithdrawal'));
      const onDepCount = (d: { count?: number }) => setPending((p) => ({ ...p, deposits: Number(d.count) || 0 }));
      const onWdrCount = (d: { count?: number }) => setPending((p) => ({ ...p, withdrawals: Number(d.count) || 0 }));
      sock.on('new-deposit', onDep);
      sock.on('new-withdrawal', onWdr);
      sock.on('pending-deposits-count', onDepCount);
      sock.on('pending-withdrawals-count', onWdrCount);
      off = () => {
        sock.off('new-deposit', onDep);
        sock.off('new-withdrawal', onWdr);
        sock.off('pending-deposits-count', onDepCount);
        sock.off('pending-withdrawals-count', onWdrCount);
      };
    });
    return () => off?.();
  }, [t]);

  const items = useMemo(() => {
    const all = paletteItems().filter((i) => can(i.perm));
    const query = q.trim().toLowerCase();
    return query
      ? all.filter((i) => t(i.label).toLowerCase().includes(query) || i.label.toLowerCase().includes(query) || i.to.includes(query))
      : all;
  }, [q, t]);

  function ping(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2800);
    if (!muteRef.current) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.04;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch {
        /* ignore */
      }
    }
  }

  function toggleGroup(label: string) {
    setOpen((prev) => (prev.includes(label) ? prev.filter((id) => id !== label) : [...prev, label]));
  }

  function toggleRail() {
    const next = !rail;
    setRail(next);
    localStorage.setItem(RAIL_KEY, next ? '1' : '0');
  }

  const pendingTotal = pending.deposits + pending.withdrawals;

  return (
    <div className={`admin-app notranslate${rail ? ' is-rail' : ''}${drawer ? ' is-drawer' : ''}`} translate="no">
      {drawer ? <button className="admin-scrim" type="button" aria-label={t('chrome.close')} onClick={() => setDrawer(false)} /> : null}
      <aside className="admin-side notranslate" translate="no">
        <div className="admin-brand-row">
          <Link className="brand" to="/dashboard">
            <img src={ASSETS.logo} width={40} height={40} alt="" />
            <div>
              <small className="brand-kicker">Staff</small>
              <div className="brand-name">BATTLE ASIA</div>
            </div>
          </Link>
          <button className="admin-rail-btn" type="button" title={rail ? t('chrome.expand') : t('chrome.collapse')} onClick={toggleRail}>
            <span />
          </button>
        </div>
        <nav>
          {NAV.map((group) => {
            const visible = group.items.filter((i) => can(i.perm));
            if (!visible.length) return null;
            const expanded = rail || open.includes(group.label);
            return (
              <div className={`nav-group${expanded ? ' is-open' : ''}`} key={group.label}>
                <button className="nav-group-btn" type="button" onClick={() => toggleGroup(group.label)} aria-expanded={expanded}>
                  <span>{t(group.label)}</span>
                  <i />
                </button>
                {expanded
                  ? visible.map((item) => {
                      const count = item.badge === 'deposits' ? pending.deposits : item.badge === 'withdrawals' ? pending.withdrawals : 0;
                      return (
                        <Link
                          key={item.to}
                          className={itemActive(location.pathname, item.to) ? 'active' : ''}
                          to={item.to}
                          title={t(item.label)}
                          onClick={() => setDrawer(false)}
                        >
                          <NavGlyph name={item.icon} />
                          <span className="nav-label">{t(item.label)}</span>
                          {count ? <em className="nav-count">{count}</em> : null}
                        </Link>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <button className="admin-burger" type="button" aria-label={t('chrome.menu')} onClick={() => setDrawer((v) => !v)}>
            <span />
          </button>
          <button className="admin-search" type="button" onClick={() => setPalette(true)}>
            <NavGlyph name="scan" />
            <span>{t('chrome.search')}</span>
            <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <div className="admin-tools">
            {pendingTotal ? (
              <span className="admin-pending">
                {pending.deposits ? (
                  <Link to="/payments/deposit">
                    {pending.deposits} {t('chrome.dep')}
                  </Link>
                ) : null}
                {pending.deposits && pending.withdrawals ? <span>·</span> : null}
                {pending.withdrawals ? (
                  <Link to="/payments/withdrawal">
                    {pending.withdrawals} {t('chrome.wdr')}
                  </Link>
                ) : null}
              </span>
            ) : null}
            <LocaleSelect />
            <div className="admin-account" ref={accountRef}>
              <button className="admin-avatar" type="button" aria-expanded={account} aria-label={t('chrome.account')} onClick={() => setAccount((v) => !v)}>
                <b>{initials}</b>
                <span>{user?.email || user?.username}</span>
              </button>
              {account ? (
                <div className="admin-account-pop">
                  <p>{user?.email || user?.username}</p>
                  <ThemeDock />
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      const next = !mute;
                      setMute(next);
                      localStorage.setItem('ba-admin-mute', next ? '1' : '0');
                      ping(next ? t('chrome.chimeOff') : t('chrome.chimeOn'));
                    }}
                  >
                    {mute ? t('chrome.muted') : t('chrome.chime')}
                  </button>
                  <Link className="btn btn-ghost" to="/profile" onClick={() => setAccount(false)}>
                    {t('nav.profile')}
                  </Link>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      void adminLogout().then(() => {
                        disconnectAdminSocket();
                        navigate('/auth/login');
                      });
                    }}
                  >
                    {t('chrome.signout')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <Outlet context={{ toast: ping }} />
      </div>
      {palette ? (
        <div className="palette" role="dialog" aria-label={t('chrome.palette')}>
          <button className="palette-bg" type="button" aria-label={t('chrome.close')} onClick={() => setPalette(false)} />
          <div className="palette-card">
            <input
              autoFocus
              value={q}
              placeholder={t('chrome.jump')}
              onChange={(e) => {
                setQ(e.target.value);
                setHi(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHi((v) => Math.min(items.length - 1, v + 1));
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHi((v) => Math.max(0, v - 1));
                }
                if (e.key === 'Enter' && items[hi]) {
                  navigate(items[hi].to);
                  setPalette(false);
                }
              }}
            />
            <div style={{ maxHeight: 320, overflow: 'auto', marginTop: 8 }}>
              {items.slice(0, 20).map((item, i) => (
                <button
                  key={item.to}
                  type="button"
                  className={i === hi ? 'on' : ''}
                  onClick={() => {
                    navigate(item.to);
                    setPalette(false);
                  }}
                >
                  <NavGlyph name={item.icon} /> {t(item.label)} <span style={{ color: 'var(--ba-muted)' }}>{item.to}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="admin-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
