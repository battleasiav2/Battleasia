import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowLeft, ArrowRight, ChevronDown, Crosshair, Crown, Eye, EyeOff, Headphones, MessageCircle, ShieldCheck, Sparkles, Users, X, Zap } from 'lucide-react';
import '../styles/landing-5173.css';
import { GamingCursor } from '../components/GamingCursor';
import { LandingSupportChat } from '../components/LandingSupportChat';
import { usePlayerSupportUnread } from '../hooks/usePlayerSupportUnread';
import { UserAvatar } from '../components/UserAvatar';
import { isApiError } from '../lib/api';
import { fetchAppDownload, formatApkSize } from '../lib/app-download';
import {
  checkEmailAvailable,
  clearSignedIn,
  fetchMe,
  forgotPassword,
  isSignedIn,
  logout,
  markSignedIn,
  readSessionUser,
  resendVerification,
  resetPassword,
  safeReturnTo,
  signIn,
  signUp,
  verifyEmailSignup,
  type AuthUser,
} from '../lib/auth';
import { fetchPublicDashboard } from '../lib/dashboard';
import { estimateMatchWinningPool, fetchGames, fetchMatches } from '../lib/games';
import { useI18n } from '../lib/i18n';
import { captureReferral } from '../lib/ref';
import { LANDING_LANG, landingText, readLandingLocale, type LandingLocale } from './landing5173-text';

type Locale = LandingLocale;

const DownloadIcon = ArrowDownRight;
const LANG_OPTIONS: { id: Locale; code: string; label: string; flag: string }[] = [
  { id: 'EN', code: 'EN', label: 'English', flag: '/assets/flags/gb.gif' },
  { id: 'BN', code: 'BN', label: 'বাংলা', flag: '/assets/flags/bd.webp' },
  { id: 'ZH', code: 'ZH', label: '中文', flag: '/assets/flags/cn.png' },
  { id: 'HI', code: 'HI', label: 'हिन्दी', flag: '/assets/flags/in.gif' },
  { id: 'UR', code: 'UR', label: 'اردو', flag: '/assets/flags/pk.gif' },
];

function LangMenu({ locale, onPick, dropUp = false }: { locale: Locale; onPick: (id: Locale) => void; dropUp?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const current = LANG_OPTIONS.find((item) => item.id === locale) ?? LANG_OPTIONS[0];
  return (
    <div className={`lang-menu${open ? ' open' : ''}${dropUp ? ' drop-up' : ''}`} ref={ref}>
      <button type="button" className="lang-trigger" aria-haspopup="listbox" aria-expanded={open} aria-label="Language" onClick={() => setOpen((v) => !v)}>
        <img className="lang-flag" src={current.flag} alt="" width={22} height={15} />
        <span className="lang-code">{current.code}</span>
        <ChevronDown size={14} />
      </button>
      {open ? (
        <ul className="lang-panel" role="listbox" aria-label="Language">
          {LANG_OPTIONS.map((item) => (
            <li key={item.id}>
              <button type="button" role="option" aria-selected={item.id === locale} className={item.id === locale ? 'active' : ''} onClick={() => { onPick(item.id); setOpen(false); }}>
                <img className="lang-flag" src={item.flag} alt="" width={22} height={15} />
                <span className="lang-label">{item.label}</span>
                <span className="lang-code">{item.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
type ModalName = 'signin' | 'signup' | 'otp' | 'forgot' | 'reset' | null;
const text = landingText;
const games = [
  { name: 'PUBG Mobile', cls: 'pubg', tag: 'Most played', image: '/images/game-pubg-hero.jpg' },
  { name: 'Free Fire', cls: 'fire', tag: '', image: '/images/game-freefire-hero.jpg' },
  { name: 'Call of Duty', cls: 'cod', tag: '', image: '/images/game-cod-hero.jpg' },
  { name: 'Mobile Legends', cls: 'mlbb', tag: '', image: '/images/game-mlbb-hero.jpg' },
  { name: 'Valorant Mobile', cls: 'valorant', tag: 'COMING SOON', image: '/images/game-valorant-hero.jpg' },
];
type RailMatch = { id?: string; gameId?: string; name: string; game: string; entry: number; prize: string; filled: number; capacity: number };
const matchStatus = (filled: number, capacity: number) =>
  filled >= capacity ? 'Full' : filled / capacity >= 0.9 ? 'Almost full' : 'Open';
const questions = [
  ['Fair play','How do you keep tournaments fair?','Every room is monitored and match results are reviewed. Cheating, teaming, emulator abuse or exploiting a bug leads to disqualification and account action.'],
  ['Fair play','What happens if I suspect a cheater?','Send a report through support with the match name, player ID and any evidence. Our team reviews reports after each event.'],
  ['Rooms','When do I receive my Room ID and password?','Room credentials appear in your match details shortly before the scheduled start. Join early and follow the in-room instructions.'],
  ['Payments','How are prizes awarded?','Prize pools are paid in BAC coins to the winners’ demo account balance after results are confirmed by tournament staff.'],
  ['Payments','Which payment methods are supported?','The platform plans to support bKash, Nagad and selected crypto options. This preview does not process real deposits or payments.'],
  ['Payments','How do withdrawals work?','Withdrawal requests are not available in this demo. In the live service, verified players can request a payout through supported channels.'],
  ['Account','Can I use a referral code?','Yes. Add a referral code when creating an account. Referral rewards and eligibility are shown before you join a live event.'],
  ['Account','Can I change my game ID or region?','Contact support if your game account changes. Your tournament region should match your game server to keep matchmaking fair.'],
  ['Rooms','How can I contact player support?','Use the chat bubble on this page or email support@battleasia.gg. Include your username and match title so we can help faster.'],
  ['Account','Who can play in tournaments?','Players must meet the minimum age for their region and follow each game’s terms. Tournament-specific eligibility is listed before registration.'],
];
const modeData = [['01','SOLO','One player. No backup. Every decision is yours.'],['02','DUO','Two minds, one plan. Find your rhythm together.'],['03','SQUAD','Four on the drop. A full team and a bigger prize.'],['04','TDM','Fast rounds. Clean aim. Straight into the action.']];

const WIN_BOARD_PLAYERS = [
  { name: 'RafsanX', region: 'BD' }, { name: 'Nabil_07', region: 'BD' }, { name: 'ViperBD', region: 'BD' },
  { name: 'SumonPL', region: 'BD' }, { name: 'Mahi_BD', region: 'BD' }, { name: 'ZayedOP', region: 'BD' },
  { name: 'Arjun_Mumbai', region: 'IN' }, { name: 'PriyaDelhi', region: 'IN' }, { name: 'Rohit_KL', region: 'IN' },
  { name: 'Hamza_LHR', region: 'PK' }, { name: 'Sara_ISB', region: 'PK' },
  { name: 'Budi_JKT', region: 'ID' }, { name: 'Sinta_ID', region: 'ID' },
  { name: 'Ken_MAN', region: 'PH' }, { name: 'Maria_PH', region: 'PH' },
  { name: 'Hafiz_KL', region: 'MY' }, { name: 'Mei_MY', region: 'MY' },
  { name: 'Lee_SG', region: 'SG' }, { name: 'Somchai_TH', region: 'TH' },
  { name: 'Minh_VN', region: 'VN' }, { name: 'Yuki_TKY', region: 'JP' }, { name: 'Jin_Seoul', region: 'KR' },
  { name: 'Tyler_TX', region: 'US' }, { name: 'Lucas_SP', region: 'BR' }, { name: 'Omar_CAI', region: 'EG' },
  { name: 'Tunde_LAG', region: 'NG' }, { name: 'Asha_NBO', region: 'KE' }, { name: 'Liam_UK', region: 'GB' },
] as const;

const WIN_BOARD_GAMES = ['PUBG · Solo', 'PUBG · Squad', 'Free Fire · Clash', 'COD · BR', 'MLBB · Rank', 'Valorant · Spike'] as const;

type WinLoseEntry = {
  id: string;
  name: string;
  region: string;
  game: string;
  entry: number;
  won: boolean;
  payout: number;
};

const createWinLoseEntry = (): WinLoseEntry => {
  const player = WIN_BOARD_PLAYERS[Math.floor(Math.random() * WIN_BOARD_PLAYERS.length)];
  const entry = [15, 20, 25, 35, 50, 75, 100, 150][Math.floor(Math.random() * 8)];
  const won = Math.random() < 0.7;
  const payout = won ? Math.round(entry * (1.6 + Math.random() * 5.4)) : 0;
  const game = WIN_BOARD_GAMES[Math.floor(Math.random() * WIN_BOARD_GAMES.length)];
  return {
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: player.name,
    region: player.region,
    game,
    entry,
    won,
    payout,
  };
};

const WIN_BOARD_VISIBLE = 10;
/** Flip to true to bring the sample win/loss ticker back. */
const SHOW_WIN_LOSE_BOARD = false;

function WinLoseBoard() {
  const [rows, setRows] = useState<WinLoseEntry[]>(() =>
    Array.from({ length: WIN_BOARD_VISIBLE }, () => createWinLoseEntry())
  );
  const [highlightId, setHighlightId] = useState('');
  const [winRateTenths, setWinRateTenths] = useState(624);

  const winsInFeed = rows.filter((r) => r.won).length;
  const lossesInFeed = rows.length - winsInFeed;

  useEffect(() => {
    const pushRow = () => {
      const entry = createWinLoseEntry();
      setRows((prev) => [entry, ...prev.slice(0, WIN_BOARD_VISIBLE - 1)]);
      setHighlightId(entry.id);
      setWinRateTenths((prev) => {
        const rate = prev / 10;
        if (rate < 68.5) return Math.min(720, prev + Math.round(0.6 + Math.random() * 1.4));
        if (entry.won) return Math.min(725, prev + Math.round(Math.random() * 0.8));
        return Math.max(665, prev - Math.round(Math.random() * 0.5));
      });
    };
    pushRow();
    const id = window.setInterval(pushRow, prefersReduced() ? 8000 : 2600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const id = window.setTimeout(() => setHighlightId(''), 900);
    return () => window.clearTimeout(id);
  }, [highlightId]);

  const winRate = winRateTenths / 10;

  return (
    <article className="win-lose-board reveal" aria-label="Live win and loss board">
      <div className="win-lose-layout">
        <aside className="win-lose-aside">
          <span className="win-lose-aside-tag"><span className="kpi-live-dot" aria-hidden="true" />Live</span>
          <span className="win-lose-rate-label">Community win rate</span>
          <strong className="win-lose-rate-value">
            <LiveNumber value={winRateTenths} format={(n) => `${(n / 10).toFixed(1)}%`} />
          </strong>
          <div className="win-lose-rate-track" aria-hidden="true">
            <span className="win-lose-rate-fill" style={{ width: `${Math.min(100, winRate)}%` }} />
          </div>
          <span className="win-lose-rate-hint">Slow climb toward 70% target</span>
          <dl className="win-lose-mini-stats">
            <div>
              <dt>Wins on board</dt>
              <dd><LiveNumber value={winsInFeed} /></dd>
            </div>
            <div>
              <dt>Losses</dt>
              <dd><LiveNumber value={lossesInFeed} /></dd>
            </div>
          </dl>
          <p className="win-lose-aside-note">Sample payouts · not real money</p>
        </aside>
        <div className="win-lose-table">
          <div className="win-lose-columns" aria-hidden="true">
            <span>Player</span>
            <span>Match</span>
            <span>Entry</span>
            <span>Status</span>
            <span>Payout</span>
          </div>
          <ul className="win-lose-feed">
            {rows.map((row, index) => (
              <li
                key={row.id}
                className={`win-lose-row ${row.won ? 'is-win' : 'is-loss'} ${row.id === highlightId ? 'is-new' : ''}`}
              >
                <span className="win-lose-player">
                  <PlayerAvatar name={row.name} className="win-lose-avatar" />
                  <span>
                    <strong>{row.name}</strong>
                    <small>{row.region}{index === 0 ? ' · just now' : ''}</small>
                  </span>
                </span>
                <span className="win-lose-game">{row.game}</span>
                <span className="win-lose-entry"><BacCoin size={13} />{formatNumber(row.entry)}</span>
                <span className={`win-lose-status ${row.won ? 'win' : 'loss'}`}>{row.won ? 'Won' : 'Lost'}</span>
                <span className={`win-lose-payout ${row.won ? 'win' : 'loss'}`}>
                  {row.won ? <><BacCoin size={13} />{formatNumber(row.payout)}</> : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
const trustItems = [['shield', 'Secure login'],['crosshair','Fair play'],['zap','Real payouts']];

const playerPhoto = (name: string) => `https://i.pravatar.cc/128?u=battleasia-${encodeURIComponent(name)}`;

function BacCoin({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <img src="/assets/bac-coin.webp" alt="" className={`bac-coin-icon ${className}`.trim()} width={size} height={size} loading="lazy" decoding="async" />;
}

const BAC_SPIN_MODES = [
  'spin-mode-y',
  'spin-mode-x',
  'spin-mode-wobble',
  'spin-mode-tumble',
  'spin-mode-diagonal',
  'spin-mode-float',
] as const;

/** Hero showcase — BAC coin cycles through 6 slow 3D spin styles. */
function HeroBacCoinShowcase() {
  const [spinMode, setSpinMode] = useState(0);

  useEffect(() => {
    if (prefersReduced()) return;
    const id = window.setInterval(
      () => setSpinMode((mode) => (mode + 1) % BAC_SPIN_MODES.length),
      5200
    );
    return () => window.clearInterval(id);
  }, []);

  const modeClass = BAC_SPIN_MODES[spinMode];

  return (
    <div className="hero-bac-coin" data-spin={spinMode} aria-hidden="true">
      <span className="hero-bac-coin-glow" />
      <span className="hero-bac-coin-orbit" />
      <div className="hero-bac-coin-scene">
        <div key={modeClass} className={`hero-bac-coin-flip ${modeClass}`}>
          <BacCoin size={96} className="hero-bac-coin-face hero-bac-coin-face-front" />
          <BacCoin size={96} className="hero-bac-coin-face hero-bac-coin-face-back" />
        </div>
      </div>
      <span className="hero-bac-coin-spark hero-bac-coin-spark-a" />
      <span className="hero-bac-coin-spark hero-bac-coin-spark-b" />
      <span className="hero-bac-coin-spark hero-bac-coin-spark-c" />
      <span className="hero-bac-coin-label">BAC</span>
    </div>
  );
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      src="/assets/logo-battleasia.png"
      alt="BattleAsia"
      className={compact ? 'brand-logo brand-logo--compact' : 'brand-logo'}
      width={compact ? 36 : 44}
      height={compact ? 36 : 44}
      loading="eager"
      decoding="async"
    />
  );
}

function AuthModalLogo({ showSignArrow, signLabel }: { showSignArrow: boolean; signLabel: string }) {
  return (
    <div className="modal-logo-stack">
      <div className="modal-logo-showcase">
        <span className="modal-logo-glow" aria-hidden="true" />
        <span className="modal-logo-orbit" aria-hidden="true" />
        <img
          src="/assets/logo-battleasia.png"
          alt="BattleAsia"
          className="modal-logo-img"
          width={168}
          height={168}
          loading="eager"
          decoding="async"
        />
        <span className="modal-logo-shine" aria-hidden="true" />
      </div>
      {showSignArrow && (
        <div className="modal-sign-arrow" aria-hidden="true">
          <span className="modal-sign-arrow-stem" />
          <span className="modal-sign-arrow-board">
            {signLabel}
            <ArrowRight size={15} strokeWidth={2.5} />
          </span>
        </div>
      )}
    </div>
  );
}

function AuthCtaArrow() {
  return (
    <span className="auth-cta-arrow" aria-hidden="true">
      <span className="auth-cta-arrow-trail" />
      <ArrowRight size={17} strokeWidth={2.5} />
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg className="oauth-icon oauth-icon--google" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="oauth-icon oauth-icon--discord" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.107 13.107 0 0 1-1.872-.878.075.075 0 0 1-.007-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.077.077 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.386 0-1.316.956-2.386 2.157-2.386 1.21 0 2.176 1.077 2.157 2.386 0 1.317-.956 2.386-2.157 2.386zm7.974 0c-1.182 0-2.157-1.069-2.157-2.386 0-1.316.955-2.386 2.157-2.386 1.21 0 2.176 1.077 2.157 2.386 0 1.317-.946 2.386-2.157 2.386z"
      />
    </svg>
  );
}

function PlayerAvatar({ name, className = 'player-avatar' }: { name: string; className?: string }) {
  return <img src={playerPhoto(name)} alt="" className={className} width={36} height={36} loading="lazy" decoding="async" />;
}

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const formatNumber = (value: number) => value.toLocaleString('en-US');
const formatBac = (value: number) => (value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : formatNumber(Math.round(value)));

type ClickFxPoint = { id: number; x: number; y: number };

function GamingClickFx() {
  const [hits, setHits] = useState<ClickFxPoint[]>([]);

  useEffect(() => {
    if (prefersReduced()) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const id = Date.now() + Math.random();
      setHits((prev) => [...prev.slice(-11), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => setHits((prev) => prev.filter((hit) => hit.id !== id)), 620);
    };
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  if (prefersReduced()) return null;

  return (
    <div className="click-fx-layer" aria-hidden="true">
      {hits.map((hit) => (
        <div key={hit.id} className="click-fx-hit" style={{ left: hit.x, top: hit.y }}>
          <span className="click-fx-ring" />
          <span className="click-fx-ring click-fx-ring--b" />
          <span className="click-fx-bracket click-fx-bracket--tl" />
          <span className="click-fx-bracket click-fx-bracket--tr" />
          <span className="click-fx-bracket click-fx-bracket--bl" />
          <span className="click-fx-bracket click-fx-bracket--br" />
          <span className="click-fx-core" />
        </div>
      ))}
    </div>
  );
}

/** Counts smoothly from the previous value to the next one. */
function LiveNumber({
  value,
  className = '',
  format = formatNumber,
}: {
  value: number;
  className?: string;
  format?: (value: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (from.current === value) return;
    if (prefersReduced()) { from.current = value; setDisplay(value); return; }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(origin + (value - origin) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}

const KPI_JOIN_BAR_HEIGHTS = [38, 52, 46, 58, 50, 64, 56, 68];

/** Top-right KPI decoration — different motif per metric. */
function KpiCardDecor({ variant }: { variant: string }) {
  return (
    <div className={`kpi-decor kpi-decor--${variant}`} aria-hidden="true">
      {variant === 'joins' && (
        <div className="kpi-decor-bars">
          {KPI_JOIN_BAR_HEIGHTS.map((height, index) => (
            <span
              key={index}
              className="kpi-decor-bar"
              style={{ '--spark-h': `${height}%`, '--spark-i': index } as CSSProperties}
            />
          ))}
        </div>
      )}
      {variant === 'matches' && (
        <div className="kpi-decor-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="kpi-decor-cell" style={{ '--cell-i': index } as CSSProperties} />
          ))}
        </div>
      )}
      {variant === 'ongoing' && (
        <div className="kpi-decor-live">
          <span className="kpi-decor-live-ring kpi-decor-live-ring--a" />
          <span className="kpi-decor-live-ring kpi-decor-live-ring--b" />
          <span className="kpi-decor-live-core" />
        </div>
      )}
      {variant === 'winnings' && (
        <div className="kpi-decor-coins">
          <span className="kpi-decor-coin kpi-decor-coin--1" />
          <span className="kpi-decor-coin kpi-decor-coin--2" />
          <span className="kpi-decor-coin kpi-decor-coin--3" />
        </div>
      )}
    </div>
  );
}
const ARENA_SEAT_CAPACITY = 10_000;

function getArenaSeatStatus(pct: number) {
  if (pct >= 95) return { label: 'Almost full', hot: true };
  if (pct >= 68) return { label: 'Filling fast', hot: true };
  if (pct >= 40) return { label: 'Steady flow', hot: false };
  return { label: 'Seats open', hot: false };
}

type TrustIconKey = 'shield' | 'zap' | 'crosshair' | 'users' | 'help';

function TrustIcon({ name }: { name: TrustIconKey }) {
  if (name === 'shield') return <ShieldCheck size={17} />;
  if (name === 'zap') return <Zap size={17} />;
  if (name === 'crosshair') return <Crosshair size={17} />;
  if (name === 'users') return <Users size={17} />;
  return <Headphones size={17} />;
}

function TrustLiveCard({
  variant,
  icon,
  title,
  desc,
  metric,
  note,
  live,
  tick,
}: {
  variant: string;
  icon: TrustIconKey;
  title: string;
  desc: string;
  metric: ReactNode;
  note: string;
  live?: boolean;
  tick?: number | string;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (tick === undefined) return;
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 720);
    return () => window.clearTimeout(id);
  }, [tick]);

  return (
    <article className={`trust-item trust-live-card trust-${variant} ${pulse ? 'is-ticking' : ''} ${live ? 'trust-is-live' : ''}`}>
      <span className="trust-card-shine" aria-hidden="true" />
      <div className="trust-icon"><TrustIcon name={icon} /></div>
      <div className="trust-metric">{metric}</div>
      <div className="trust-metric-note">{live && <span className="kpi-live-dot" aria-hidden="true" />}{note}</div>
      <strong>{title}</strong>
      <span>{desc}</span>
    </article>
  );
}

function KpiLiveCard({
  variant,
  label,
  value,
  note,
  coin,
  live,
  tick,
}: {
  variant: string;
  label: string;
  value: ReactNode;
  note: ReactNode;
  coin?: boolean;
  live?: boolean;
  tick?: number | string;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (tick === undefined) return;
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 720);
    return () => window.clearTimeout(id);
  }, [tick]);

  return (
    <article className={`kpi kpi-live-card kpi-${variant} ${pulse ? 'is-ticking' : ''} ${live ? 'kpi-is-live' : ''}`}>
      <span className="kpi-card-shine" aria-hidden="true" />
      <KpiCardDecor variant={variant} />
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {coin && <BacCoin size={22} className="kpi-coin kpi-coin-live" />}
        {value}
        {coin && <span className="coin">BAC</span>}
      </div>
      <div className="kpi-note">{live && <span className="kpi-live-dot" aria-hidden="true" />}{note}</div>
    </article>
  );
}

/** Slides rows to their new position whenever the order changes. */
function useFlipRows(containerRef: React.RefObject<HTMLElement | null>, orderKey: string) {
  const offsets = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-flip-key]'));
    const reduced = prefersReduced();
    rows.forEach((row) => {
      const key = row.dataset.flipKey as string;
      const top = row.getBoundingClientRect().top;
      const previous = offsets.current.get(key);
      if (!reduced && previous !== undefined && Math.abs(previous - top) > 1) {
        row.animate(
          [{ transform: `translateY(${previous - top}px)` }, { transform: 'translateY(0)' }],
          { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      }
      offsets.current.set(key, top);
    });
  }, [containerRef, orderKey]);
}

function MenuGlyph({ kind }: { kind: 'home' | 'about' | 'play' | 'rules' }) {
  const paths: Record<typeof kind, string> = {
    home: 'M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z',
    about: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
    play: 'M7 8h10a5 5 0 0 1 4.8 6.4l-.9 3a2.3 2.3 0 0 1-3.9.9L15 16H9l-2 2.3a2.3 2.3 0 0 1-3.9-.9l-.9-3A5 5 0 0 1 7 8ZM8 11v4M6 13h4',
    rules: 'M8 4h8l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM16 4v4h4M9 13h6M9 17h4',
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[kind]} />
    </svg>
  );
}

export function Landing5173({ chat = false }: { chat?: boolean }) {
  const [locale, setLocale] = useState<Locale>(readLandingLocale);
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalName>(null);
  const [logged, setLogged] = useState(isSignedIn);
  const [me, setMe] = useState<AuthUser | null>(() => readSessionUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [matchTab, setMatchTab] = useState<'high'|'live'>('high');
  const [leaderboardTab, setLeaderboardTab] = useState<'profit'|'kills'>('profit');
  const [faqOpen, setFaqOpen] = useState<number|null>(0);
  const [faqFilter, setFaqFilter] = useState('All');
  const [toast, setToast] = useState('');
  const [socialOpen, setSocialOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { count: supportUnread, markRead: markSupportRead } = usePlayerSupportUnread(logged);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [phone, setPhone] = useState('');
  const [server, setServer] = useState('Asia');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [cooldown, setCooldown] = useState(60);
  const [remember, setRemember] = useState(true);
  const [liveStats, setLiveStats] = useState({
    players: 0,
    matches: 0,
    joins: 0,
    totalMatches: 0,
    winningsBac: 0,
    ongoing: 0,
  });
  const [highMatches, setHighMatches] = useState<RailMatch[]>([]);
  const [liveMatches, setLiveMatches] = useState<RailMatch[]>([]);
  const [gameOpen, setGameOpen] = useState<Record<string, number>>({ pubg: 0, fire: 0, cod: 0, mlbb: 0, valorant: 0 });
  const [apkUrl, setApkUrl] = useState('');
  const [apkLabel, setApkLabel] = useState('');
  const [returnPath, setReturnPath] = useState('/user/play');
  const playerName = me?.username || 'Player';
  const [arenaSeatsFilled, setArenaSeatsFilled] = useState(0);
  const arenaSeatPct = Math.min(100, Math.round((arenaSeatsFilled / ARENA_SEAT_CAPACITY) * 100));
  const arenaSeatStatus = getArenaSeatStatus(arenaSeatPct);
  const arenaSeatRotate = arenaSeatPct * 3.6 - 90;
  const [profitBoard, setProfitBoard] = useState<{ name: string; score: number }[]>([]);
  const [killBoard, setKillBoard] = useState<{ name: string; score: number }[]>([]);
  const [movedPlayer, setMovedPlayer] = useState('');
  const [trustMetrics, setTrustMetrics] = useState({
    completed: 0,
    bacPaid: 0,
    liveRooms: 0,
    inSeats: 0,
  });
  const t = text[locale];
  const { t: appT } = useI18n();
  const activeMatches = useMemo(
    () => (matchTab === 'high' ? highMatches : liveMatches),
    [matchTab, highMatches, liveMatches],
  );
  const railRef = useRef<HTMLDivElement>(null);
  const accountRail = useRef(false);
  const podiumRef = useRef<HTMLDivElement>(null);
  const chasingRef = useRef<HTMLDivElement>(null);
  const railHover = useRef(false);
  const railHoldUntil = useRef(0);
  const railVisible = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const leaders = leaderboardTab === 'profit' ? profitBoard : killBoard;
  const leaderOrder = leaders.map((row) => row.name).join('|');

  useFlipRows(podiumRef, leaderOrder);
  useFlipRows(chasingRef, leaderOrder);

  const holdRail = (ms = 4000) => { railHoldUntil.current = Date.now() + ms; };

  const tickerItems = useMemo(() => {
    const items = [...liveMatches, ...highMatches]
      .filter((match, index, arr) => !match.id || arr.findIndex((row) => row.id === match.id) === index)
      .map((match) => {
      const left = match.capacity - match.filled;
      return left <= 0
        ? `${match.name} — lobby full`
        : `${match.name} — ${left} ${left === 1 ? 'seat' : 'seats'} left`;
    });
    const topProfit = profitBoard[0];
    const topKills = killBoard[0];
    if (topProfit) items.push(`${topProfit.name} leads season profit · ${formatNumber(topProfit.score)} BAC`);
    if (topKills) items.push(`${topKills.name} tops the kill board · ${formatNumber(topKills.score)} kills`);
    return items;
  }, [liveMatches, highMatches, profitBoard, killBoard]);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  };
  const resetAuthFields = () => {
    setOtp(['', '', '', '', '', '']);
    setSignupStep(1);
    setError('');
  };
  const openAuth = (name: ModalName) => {
    setError('');
    if (name === 'signup' || name === 'signin') resetAuthFields();
    setModal(name);
    setMobileOpen(false);
  };
  const closeModal = () => {
    setModal(null);
    resetAuthFields();
  };

  useEffect(() => {
    const lang = LANDING_LANG[locale];
    document.documentElement.lang = lang;
    try { localStorage.setItem('ba-lang', lang); } catch { /* ignore */ }
  }, [locale]);

  const chooseLocale = (id: Locale) => setLocale(id);

  useEffect(() => {
    captureReferral();
    const q = new URLSearchParams(window.location.search);
    const auth = q.get('auth');
    if (auth === 'signin' || auth === 'signup' || auth === 'otp' || auth === 'forgot' || auth === 'reset') setModal(auth);
    if (chat || q.get('chat') === '1') setChatOpen(true);
    const mail = q.get('email');
    if (mail) setEmail(mail);
    const back = safeReturnTo(q.get('returnTo'));
    if (q.get('returnTo')) setReturnPath(back);
    if (q.get('oauth') === 'failed') setToast('Sign-in was cancelled. Try again.');
  }, [chat]);

  useEffect(() => {
    let cancel = false;
    let timer = 0;
    let tries = 0;
    const load = async () => {
      tries += 1;
      try {
        const pulse = await fetchPublicDashboard();
        if (cancel) return;
        setLiveStats({
          players: pulse.playersOnline,
          matches: pulse.matchesToday,
          joins: pulse.todayJoins,
          totalMatches: pulse.matches,
          winningsBac: pulse.winnings,
          ongoing: pulse.ongoing,
        });
        setArenaSeatsFilled(pulse.inSeats);
        const toRail = (m: (typeof pulse.ongoingMatches)[number]): RailMatch => ({
          id: m.id,
          gameId: m.gameId,
          name: m.matchName,
          game: m.gameName,
          entry: m.entryFee,
          prize: formatNumber(m.prizeEstimate),
          filled: m.participantsCount,
          capacity: Math.max(m.totalPlayer, 1),
        });
        if (!accountRail.current) {
          setLiveMatches(pulse.ongoingMatches.map(toRail));
          setHighMatches(pulse.highPrizeMatches.map(toRail));
        }
        setProfitBoard(pulse.topProfit.map((p) => ({ name: p.username, score: p.totalWinnings })));
        setKillBoard(pulse.topKillers.map((p) => ({ name: p.username, score: p.totalKills })));
        setTrustMetrics({
          completed: pulse.matches,
          bacPaid: pulse.winnings,
          liveRooms: pulse.ongoing,
          inSeats: pulse.inSeats,
        });
        const open: Record<string, number> = {};
        const alias: Record<string, RegExp> = {
          pubg: /pubg/i,
          fire: /free\s*fire|freefire/i,
          cod: /call of duty|\bcod\b/i,
          mlbb: /mlbb|mobile legends/i,
          valorant: /valorant/i,
        };
        for (const [cls, re] of Object.entries(alias)) {
          const hit = Object.entries(pulse.openByGame).find(([name]) => re.test(name));
          open[cls] = hit ? hit[1] : 0;
        }
        setGameOpen(open);
        const missing =
          pulse.topProfit.length === 0 &&
          pulse.ongoingMatches.length === 0 &&
          pulse.highPrizeMatches.length === 0;
        if (missing && tries < 3) {
          timer = window.setTimeout(() => {
            if (!cancel) void load();
          }, 1500);
        }
      } catch {
        if (tries < 3) {
          timer = window.setTimeout(() => {
            if (!cancel) void load();
          }, 1500);
        }
      }
      try {
        const apk = await fetchAppDownload();
        if (cancel || !apk.downloadUrl) return;
        setApkUrl(apk.downloadUrl);
        const size = formatApkSize(apk.fileSize);
        const label = [apk.version ? `v${apk.version}` : '', size].filter(Boolean).join(' · ');
        if (label) setApkLabel(label);
      } catch { /* keep the zip APK label */ }
    };
    void load();
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!me) return;
    let cancel = false;
    void (async () => {
      const games = await fetchGames();
      if (cancel || !games.length) return;
      const lists = await Promise.all(games.filter((game) => !game.comingSoon).map((game) => fetchMatches(game.id)));
      if (cancel) return;
      const open = lists
        .flat()
        .filter((match) => match.status === 'active' || match.status === 'start');
      if (!open.length) return;
      accountRail.current = true;
      const toRail = (match: (typeof open)[number]): RailMatch => ({
        id: match.id,
        gameId: match.gameId,
        name: match.matchName,
        game: match.gameName || '',
        entry: Number(match.entryFee) || 0,
        prize: formatNumber(estimateMatchWinningPool(match)),
        filled: Number(match.participantsCount) || 0,
        capacity: Math.max(Number(match.totalPlayer) || 1, 1),
      });
      setHighMatches(open.slice(0, 12).map(toRail));
      const live = open.filter((match) => match.status === 'start');
      if (live.length) setLiveMatches(live.slice(0, 12).map(toRail));
    })();
    return () => {
      cancel = true;
    };
  }, [me]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      document.documentElement.style.setProperty('--scroll-progress', `${(window.scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100}%`);
      const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));
      const current = sections.filter((el) => el.getBoundingClientRect().top <= 150).at(-1);
      if (current?.id) setActiveLink(current.id === 'about-us' ? 'about' : current.id === 'how-to-play' ? 'play' : current.id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'auto' });
    };
    const frame = window.requestAnimationFrame(syncHash);
    window.addEventListener('hashchange', syncHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', syncHash);
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: .1 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!modal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [modal]);
  useEffect(() => {
    if (!modal) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
      if (event.key === 'Tab') {
        const dialog = document.querySelector('[role="dialog"]');
        const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]')).filter((el) => el.offsetParent !== null) : [];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);
  useEffect(() => {
    if (modal !== 'otp' && modal !== 'reset') return;
    setCooldown(60);
    const timer = setInterval(() => setCooldown((v) => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [modal]);

  useEffect(() => {
    if (!movedPlayer) return;
    const id = setTimeout(() => setMovedPlayer(''), 1400);
    return () => clearTimeout(id);
  }, [movedPlayer]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || prefersReduced()) return;
    const observer = new IntersectionObserver(([entry]) => { railVisible.current = entry.isIntersecting; }, { threshold: 0.2 });
    observer.observe(rail);
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      const paused = railHover.current || Date.now() < railHoldUntil.current || !railVisible.current || document.hidden;
      if (!paused) {
        const max = rail.scrollWidth - rail.clientWidth;
        if (max > 4) {
          const next = rail.scrollLeft + delta * 0.022;
          rail.scrollLeft = next >= max - 0.5 ? 0 : next;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!logged) {
      setMe(null);
      return;
    }
    let alive = true;
    fetchMe()
      .then((user) => {
        if (alive) setMe(user);
      })
      .catch(() => {
        if (!alive) return;
        clearSignedIn();
        setLogged(false);
        setMe(null);
      });
    const onAvatar = (ev: Event) => {
      const avatar = (ev as CustomEvent<{ avatar?: string }>).detail?.avatar;
      if (avatar) setMe((prev) => (prev ? { ...prev, avatar } : { avatar }));
    };
    window.addEventListener('ba:avatar-updated', onAvatar);
    return () => {
      alive = false;
      window.removeEventListener('ba:avatar-updated', onAvatar);
    };
  }, [logged]);

  const goArena = (path = '/user/play') => {
    if (!logged) { setReturnPath(path); openAuth('signin'); return; }
    navigate(path);
  };
  const onJoin = () => (logged ? navigate('/user/play') : openAuth('signup'));
  const signOut = () => {
    void logout().finally(() => {
      setMe(null);
      setLogged(false);
      setMobileOpen(false);
      notify('Signed out.');
    });
  };
  const onMatch = (match: RailMatch) => {
    const dest = match.gameId ? `/user/play/${match.gameId}` : '/user/play';
    if (logged) {
      navigate(dest);
      return;
    }
    setReturnPath(dest);
    openAuth('signin');
    navigate({ pathname: '/dashboard', search: `?auth=signin&returnTo=${encodeURIComponent(dest)}` });
  };
  const onGame = (closed: boolean) => (closed ? notify(t.soon) : goArena('/user/play'));
  const anchor = (id: string) => {
    setMobileOpen(false);
    window.history.replaceState(null, '', `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const fail = (err: unknown) => setError(isApiError(err) ? err.message : 'Something went wrong. Try again.');
  const handleSignin = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Enter your password to continue.'); return; }
    void signIn(email.trim(), password).then((user) => {
      markSignedIn(user);
      setMe(user);
      setLogged(true);
      closeModal();
      navigate(returnPath);
    }).catch(fail);
  };
  const handleSignupStep = (event: FormEvent) => {
    event.preventDefault();
    if (signupStep === 1) {
      if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
      if (password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      void checkEmailAvailable(email.trim()).then((row) => {
        if (!row.available) { setError(row.message || 'This email is already in use.'); return; }
        setError(''); setSignupStep(2);
      }).catch(fail);
      return;
    }
    if (!username.trim() || !gameId.trim() || !phone.trim()) { setError('Complete your player details to continue.'); return; }
    if (!terms) { setError('Please accept the terms to create your account.'); return; }
    const digits = phone.replace(/\D/g, '');
    void signUp({
      email: email.trim(),
      username: username.trim(),
      password,
      pubgId: gameId.trim(),
      countryCode: '+880',
      mobileNo: digits.startsWith('880') ? digits.slice(3) : digits,
      phone: phone.trim(),
      gameServer: server,
    }).then(() => { setError(''); setModal('otp'); }).catch(fail);
  };
  const handleOtp = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError('Enter all six digits to verify.'); return; }
    void verifyEmailSignup(email.trim(), otp.join('')).then((user) => {
      markSignedIn(user);
      setMe(user);
      setLogged(true);
      closeModal();
      navigate(returnPath);
    }).catch(fail);
  };
  const handleForgot = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    void forgotPassword(email.trim()).then(() => { setError(''); setOtp(['','','','','','']); setModal('reset'); }).catch(fail);
  };
  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError('Enter all six digits from your email.'); return; }
    if (password.length < 8 || password !== confirm) { setError('Use matching passwords with at least 8 characters.'); return; }
    void resetPassword(email.trim(), otp.join(''), password).then(() => {
      resetAuthFields();
      setModal('signin');
      notify('Password updated. Sign in.');
    }).catch(fail);
  };
    const onOtpInput = (index: number, value: string, target: HTMLInputElement) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      setOtp((prev) => prev.map((v, i) => digits[i] ?? v));
      target.parentElement?.querySelectorAll('input')[Math.min(digits.length, 5)]?.focus();
      return;
    }
    const next = [...otp]; next[index] = value.replace(/\D/g, '').slice(-1); setOtp(next);
    if (value && index < 5) target.parentElement?.querySelectorAll('input')[index + 1]?.focus();
  };
  const onOtpKey = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) event.currentTarget.parentElement?.querySelectorAll('input')[index - 1]?.focus();
  };
  const filteredQuestions = questions.filter((q) => faqFilter === 'All' || q[0] === faqFilter);
  const passwordStrength = password.length < 5 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;

  return (
    <div className="ba5173"><div className="site-shell">
      <GamingCursor />
      <GamingClickFx />
      <div className="progress-line" />
      <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); anchor('home'); }}><BrandLogo /><span>Battle Asia</span></a>
          <div className="nav-end">
          <nav className="nav-links" aria-label="Main navigation">
            {[['home',t.home],['about',t.about],['play',t.play],['rules',t.rules]].map(([id,label]) => <a key={id} href={`#${id}`} className={activeLink === id ? 'active' : ''} onClick={(e) => { e.preventDefault(); anchor(id === 'about' ? 'about-us' : id); }}>{label}</a>)}
          </nav>
          <div className="nav-actions">
            {logged ? <><button className="btn btn-ghost" onClick={signOut}>{appT('cta.signout')}</button><Link className="btn btn-primary" to="/user/play">{t.arena} <ArrowRight size={14}/></Link></> : <><button className="btn btn-ghost" onClick={() => openAuth('signin')}>{t.signin}</button><button className="btn btn-primary" onClick={onJoin}>{t.signup} <ArrowRight size={14}/></button></>}
          </div>
          <div className="header-tools">
            <LangMenu locale={locale} onPick={chooseLocale} />
          </div>
          </div>
          {logged ? (
            <Link className="nav-profile" to="/user/play" aria-label={playerName}>
              <UserAvatar src={me?.avatar} name={playerName} size={34} priority />
            </Link>
          ) : null}
          <button className="mobile-trigger" aria-label="Open menu" onClick={() => setMobileOpen(true)}><span className="ba-menu-ico" /></button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" /><div className="hero-glow" />
          <div className="hero-animation" aria-hidden="true">
            <div className="arena-scene">
              <div className="arena-lightbar arena-lightbar-top"><i /><i /><i /><i /><i /><i /></div>
              <div className="arena-beam arena-beam-left" />
              <div className="arena-beam arena-beam-center" />
              <div className="arena-beam arena-beam-right" />
              <div className="arena-bowl">
                <div className="arena-bowl-upper" />
                <div className="arena-bowl-lower" />
              </div>
              <div className="arena-lightbar arena-lightbar-low"><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="arena-floor" />
              <div className="arena-stage"><i /><i /><i /></div>
            </div>
          </div>
          <div className="hero-bottom-line" />
          <div className="wrap hero-content">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot"/><span>{t.eyebrow} · Bangladesh & Asia</span></div>
              <h1>Battle Asia</h1>
              <p className="hero-lead">{t.lead}</p>
              <div className="hero-ctas"><button className="btn btn-primary" onClick={onJoin}>{t.signup} <ArrowRight size={15}/></button><button className="btn btn-ghost" onClick={() => { if (apkUrl) window.location.href = apkUrl; }}><DownloadIcon size={15}/>{t.download} <span className="mono" style={{fontSize:9,opacity:.7}}>{apkLabel}</span></button></div>
              <div className="hero-live"><span className="live-tag is-live">Live</span><span className="live-metric"><strong><LiveNumber value={liveStats.players} /></strong> {t.players}</span><span className="live-metric"><strong><LiveNumber value={liveStats.matches} /></strong> {t.matches}</span></div>
            </div>
          </div>
          <aside className="hero-side hero-side-live">
            <span className="hero-side-glow" aria-hidden="true" />
            <div className="side-top"><span>Arena seats</span><span className="side-live-code">BD-01 · live</span></div>
            <div
              className="seat-ring"
              style={{ '--seat-pct': arenaSeatPct, '--seat-rotate': arenaSeatRotate } as CSSProperties}
              role="img"
              aria-label={`${arenaSeatPct}% ${t.seats.toLowerCase()}`}
            >
              <span className="seat-ring-glow" aria-hidden="true" />
              <span className="seat-ring-track" aria-hidden="true"><i className="seat-ring-dot" /></span>
              <div className="seat-value">
                <LiveNumber value={arenaSeatPct} format={(n) => `${n}%`} />
                <small>{t.seats}</small>
              </div>
            </div>
            <div className="side-foot">
              <span><LiveNumber value={arenaSeatsFilled} /> / {formatNumber(ARENA_SEAT_CAPACITY)}</span>
              <b className={`seat-status ${arenaSeatStatus.hot ? 'seat-status-hot' : ''}`}>{arenaSeatStatus.label}</b>
            </div>
          </aside>
          <HeroBacCoinShowcase />
        </section>

        <div className="live-ticker" aria-label="Live arena updates">
          <span className="live-ticker-tag"><i aria-hidden="true" />Live</span>
          <div className="live-ticker-window">
            <div className="live-ticker-track">
              {tickerItems.map((item) => <span className="live-ticker-item" key={item}>{item}</span>)}
              {tickerItems.map((item) => <span className="live-ticker-item" key={`echo-${item}`} aria-hidden="true">{item}</span>)}
            </div>
          </div>
        </div>

        <section className="pulse-section">
          <div className="wrap">
            <div className="pulse-head reveal"><h2 className="section-title">{t.pulse}</h2><div className="pulse-live kpi-pulse-badge"><span className="kpi-pulse-badge-dot" aria-hidden="true" />Live arena pulse</div></div>
            <div className="kpi-grid reveal kpi-grid-live">
              <div className="kpi-ecg" aria-hidden="true"><svg viewBox="0 0 400 24" preserveAspectRatio="none"><path className="kpi-ecg-path" d="M0 12h40l8-9 8 18 8-18 8 9h40l6-5 6 10 6-10 6 5h40l10-8 10 16 10-16 10 8h40l8-6 8 12 8-12 8 6h40" /></svg></div>
              <KpiLiveCard variant="joins" label={t.joins} tick={liveStats.joins} value={<LiveNumber value={liveStats.joins} />} note="Signed up today" />
              <KpiLiveCard variant="matches" label={t.totalmatches} tick={liveStats.totalMatches} value={<LiveNumber value={liveStats.totalMatches} />} note="Completed matches" />
              <KpiLiveCard variant="ongoing" label={t.ongoing} tick={liveStats.ongoing} live value={<span className="kpi-live-value"><LiveNumber value={liveStats.ongoing} /></span>} note="Happening now" />
              <KpiLiveCard
                variant="winnings"
                label={t.winnings}
                tick={liveStats.winningsBac}
                coin
                value={<LiveNumber value={liveStats.winningsBac} format={formatBac} />}
                note="BAC coins awarded"
              />
            </div>
            <article id="leaderboard" className="leaderboard-feature reveal" aria-labelledby="leaderboard-title">
              <div className="leader-feature-head">
                <div><div className="section-kicker">Season board</div><h3 id="leaderboard-title" className="leader-feature-title">The ones to beat</h3></div>
                <div className="leader-switch" role="tablist" aria-label="Leaderboard category">
                  <button className={leaderboardTab==='profit'?'active':''} role="tab" aria-selected={leaderboardTab==='profit'} onClick={() => setLeaderboardTab('profit')}>Top profit</button>
                  <button className={leaderboardTab==='kills'?'active':''} role="tab" aria-selected={leaderboardTab==='kills'} onClick={() => setLeaderboardTab('kills')}>Top killers</button>
                </div>
              </div>
              <div className="leader-data-note">Live results from completed matches</div>
              {(() => {
                const metric = leaderboardTab==='profit' ? 'BAC' : 'KILLS';
                const ranked = leaders.map((row, index) => ({ ...row, rank: String(index + 1).padStart(2, '0') }));
                if (!ranked.length) return <p className="section-copy">No ranked players yet.</p>;
                const podium = [ranked[1], ranked[0], ranked[2]].filter((row): row is (typeof ranked)[number] => Boolean(row));
                return <>
                  <div className="podium-stage" aria-hidden="true">
                    <div className="podium-aurora" />
                    <div className="podium-beam" />
                  </div>
                  <div className="podium podium-is-live" ref={podiumRef} aria-label={`${leaderboardTab==='profit'?'Top profit':'Top killers'} podium`}>
                    {podium.map(({rank,name,score}) => {
                      const isChampion = rank === '01';
                      return <div className={`podium-place place-${rank} ${movedPlayer===name?'is-live-change':''}`} key={name} data-flip-key={name}>
                        <div className="podium-avatar-stack">
                          {isChampion && <span className="podium-crown"><Crown size={15} strokeWidth={2.2} /></span>}
                          {isChampion && <span className="podium-orbit" />}
                          <div className={`podium-medallion medallion-${rank}`} aria-hidden="true"><PlayerAvatar name={name} className="podium-avatar" /></div>
                        </div>
                        <span className="podium-rank">{isChampion ? 'Champion' : `Rank ${Number(rank)}`}</span>
                        <strong className="podium-name">{name}</strong>
                        <span className="podium-score">{leaderboardTab==='profit'&&<BacCoin size={14} className="score-coin" />}<LiveNumber value={score} /> <small>{metric}</small></span>
                        <div className={`podium-block ${isChampion ? 'podium-block-live' : ''}`}>
                          {isChampion && <>
                            <span className="podium-block-shimmer" />
                            <span className="podium-spark" style={{ '--spark-i': 0 } as CSSProperties} />
                            <span className="podium-spark" style={{ '--spark-i': 1 } as CSSProperties} />
                            <span className="podium-spark" style={{ '--spark-i': 2 } as CSSProperties} />
                            <span className="podium-spark" style={{ '--spark-i': 3 } as CSSProperties} />
                          </>}
                          <span className="podium-block-num">{rank}</span>
                        </div>
                      </div>;
                    })}
                  </div>
                  <div className="ranked-rest" ref={chasingRef}>
                    <div className="ranked-rest-label"><span>The chasing pack</span><span>Rank / player / {metric}</span></div>
                    {ranked.slice(3).map(({rank,name,score}) => <div className={`compact-rank-row ${movedPlayer===name?'is-live-change':''}`} key={name} data-flip-key={name}>
                      <span className="compact-rank">{rank}</span><PlayerAvatar name={name} className="compact-avatar player-avatar" /><strong>{name}</strong><span className="compact-score">{leaderboardTab==='profit'&&<BacCoin size={12} className="score-coin" />}<LiveNumber value={score} /></span>
                    </div>)}
                  </div>
                </>;
              })()}
            </article>
          </div>
        </section>

        <section className="match-section">
          <div className="wrap">
            <div className="section-topline reveal"><div><div className="section-kicker">Matchmaking</div><h2 className="section-title" style={{marginBottom:0}}>Find your next match</h2></div><div className="rail-controls"><button className="icon-button" aria-label="Previous matches" onClick={() => { holdRail(); railRef.current?.scrollBy({left:-280,behavior:'smooth'}); }}><ArrowLeft size={16}/></button><button className="icon-button" aria-label="Next matches" onClick={() => { holdRail(); railRef.current?.scrollBy({left:280,behavior:'smooth'}); }}><ArrowRight size={16}/></button></div></div>
            <div className="match-tabs reveal"><button className={`match-tab ${matchTab==='high'?'active':''}`} onClick={() => setMatchTab('high')}>{t.high}</button><button className={`match-tab ${matchTab==='live'?'active':''}`} onClick={() => setMatchTab('live')}>{t.live}</button></div>
            <div
              className="match-rail reveal"
              ref={railRef}
              onMouseEnter={() => { railHover.current = true; }}
              onMouseLeave={() => { railHover.current = false; }}
              onFocusCapture={() => { railHover.current = true; }}
              onBlurCapture={() => { railHover.current = false; }}
              onPointerDown={() => holdRail(6000)}
              onWheel={() => holdRail(6000)}
            >{activeMatches.length === 0 ? <p className="section-copy">No matches right now.</p> : activeMatches.map((match) => {
              const status = matchStatus(match.filled, match.capacity);
              const full = status === 'Full';
              const almostFull = status === 'Almost full';
              const joinClass = full ? 'join-btn-view' : almostFull ? 'join-btn-urgent' : 'join-btn-live';
              return <article className={`match-card ${almostFull ? 'match-card-hot' : ''}`} key={match.id || `${match.game}-${match.name}`}><div className="match-card-top"><span className="game-tag">{match.game.split(' · ')[0]}</span><span className={`status ${full?'full':''}`}>{status}</span></div><h3>{match.name}</h3><div className="match-info"><span>Entry<strong><BacCoin size={14} />{match.entry} BAC</strong></span><span>Prize pool<strong><BacCoin size={14} />{match.prize} BAC</strong></span></div><div className="capacity"><span className="capacity-fill" style={{width:`${match.filled/match.capacity*100}%`}}/></div><div className="match-foot"><span><LiveNumber value={match.filled} />/{match.capacity} players</span><button type="button" className={`join-btn ${joinClass}`} onClick={() => onMatch(match)}><span className="join-btn-shine" aria-hidden="true" />{!full && <span className="join-btn-dot" aria-hidden="true" />}<span className="join-btn-text">{full ? 'View event' : 'Join match'}</span><span className="join-arrow" aria-hidden="true">↗</span></button></div></article>;
            })}</div>
          </div>
        </section>

        {SHOW_WIN_LOSE_BOARD ? (
        <section className="win-lose-section" aria-labelledby="win-lose-heading">
          <div className="wrap">
            <div className="win-lose-section-head reveal">
              <div className="section-kicker"><span className="kpi-live-dot" aria-hidden="true" /> Live results</div>
              <h2 id="win-lose-heading" className="section-title" style={{ marginBottom: 0 }}>Win &amp; loss board</h2>
              <p className="win-lose-section-copy">Sample payouts from players worldwide — updates automatically.</p>
            </div>
            <WinLoseBoard />
          </div>
        </section>
        ) : null}

        <section id="play" className="section">
          <div className="wrap">
            <div className="reveal"><div className="section-kicker">Games</div><h2 className="section-title">{t.games}</h2><p className="section-copy">{t.gamesub}</p></div>
            <div className="games-grid reveal">{games.map((game) => <button key={game.name} type="button" className={`game-card ${game.cls} ${game.cls === 'valorant' && (gameOpen.valorant ?? 0) === 0 ? 'disabled' : ''}`} onClick={() => onGame(game.cls === 'valorant' && (gameOpen.valorant ?? 0) === 0)} aria-label={`${game.name} ${(gameOpen[game.cls] ?? 0) === 0 ? 'coming soon' : `${gameOpen[game.cls] ?? 0} open matches`}`} onMouseMove={(e) => { const r=e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx',`${e.clientX-r.left}px`);e.currentTarget.style.setProperty('--my',`${e.clientY-r.top}px`); if(matchMedia('(hover:hover)').matches){e.currentTarget.style.setProperty('--rx',`${((e.clientY-r.top)/r.height-.5)*-7}deg`);e.currentTarget.style.setProperty('--ry',`${((e.clientX-r.left)/r.width-.5)*7}deg`);} }} onMouseLeave={(e) => {e.currentTarget.style.setProperty('--rx','0deg');e.currentTarget.style.setProperty('--ry','0deg')}}><img src={game.image} alt="" className="game-card-art" loading="lazy" decoding="async" />{game.tag && (game.cls !== 'valorant' || (gameOpen.valorant ?? 0) === 0) ? <span className="game-badge">{game.cls === 'valorant' ? t.soon : game.tag}</span> : null}<div className="game-card-copy"><h3>{game.name}</h3><p className={(gameOpen[game.cls] ?? 0) || game.cls !== 'valorant' ? '' : 'soon'}>{(gameOpen[game.cls] ?? 0) ? `${gameOpen[game.cls] ?? 0} ${t.open}` : game.cls === 'valorant' ? t.soon : `0 ${t.open}`}</p></div></button>)}</div>
          </div>
        </section>

        <section id="about-us" className="section about-section">
          <div className="wrap about-layout">
            <div className="about-copy reveal"><div className="section-kicker">About Battle Asia</div><h2 className="section-title">{t.aboutTitle}</h2><p>{t.aboutLead}</p><p>From your first room to the final circle, we make competition clear, fair and worth showing up for. Play PUBG Mobile first, then take your shot across a growing roster of mobile games.</p><div className="about-ctas"><button className="btn btn-primary" onClick={onJoin}>{t.create} <ArrowRight size={14}/></button><button className="btn btn-ghost" onClick={() => anchor('play')}>Explore games</button></div></div>
            <div className="about-trust-panel reveal">
              <div className="about-trust-head"><span className="kpi-pulse-badge-dot" aria-hidden="true" />Live platform proof</div>
              <div className="trust-ecg" aria-hidden="true"><svg viewBox="0 0 400 24" preserveAspectRatio="none"><path className="trust-ecg-path" d="M0 12h32l6-8 6 16 6-16 6 8h32l5-4 5 8 5-8 5 4h32l8-6 8 12 8-12 8 6h32l6-5 6 9 6-9 6 5h32" /></svg></div>
              <div className="trust-list trust-list-live">
                <TrustLiveCard variant="verified" icon="shield" title="Trust, built in" desc="Clear rules. Verified results." live tick={trustMetrics.completed} metric={<LiveNumber value={trustMetrics.completed} />} note="Completed matches" />
                <TrustLiveCard variant="payouts" icon="zap" title="Payouts that count" desc="BAC winnings after results." tick={trustMetrics.bacPaid} metric={<LiveNumber value={trustMetrics.bacPaid} format={formatBac} />} note="BAC paid" />
                <TrustLiveCard variant="rooms" icon="crosshair" title="Fair rooms" desc="Competitive play, monitored." live tick={trustMetrics.liveRooms} metric={<LiveNumber value={trustMetrics.liveRooms} />} note="Live rooms now" />
                <TrustLiveCard variant="community" icon="users" title="A real community" desc="Squads from across the region." tick={trustMetrics.inSeats} metric={<LiveNumber value={trustMetrics.inSeats} />} note="Players in open rooms" />
              </div>
            </div>
          </div>
        </section>

        <section id="how-to-play" className="section">
          <div className="wrap"><div className="reveal"><div className="section-kicker">How to play</div><h2 className="section-title">{t.modes}</h2><p className="section-copy">Different squads. Different stakes. Pick the way you play best.</p></div><div className="modes-grid reveal">{modeData.map(([num,name,desc])=><article className={`mode-card mode-${num}`} key={num}><div className="mode-art" role="img" aria-label={`${name} game mode artwork`}><span className="mode-num">{num}</span><span className="mode-art-label">Mode {num}</span></div><div className="mode-copy"><h3>{name}</h3><p>{desc}</p></div></article>)}</div></div>
        </section>

        <section id="rules" className="section faq-section">
          <div className="wrap"><div className="section-kicker">FAQ</div><h2 className="section-title">{t.faq}</h2><p className="section-copy">A good competition starts with knowing where you stand.</p>
            <div className="faq-layout"><aside className="faq-side"><div className="topic-chips">{['All','Payments','Fair play','Rooms','Account'].map((tag) => <button key={tag} className={`topic-chip ${faqFilter===tag?'active':''}`} onClick={() => {setFaqFilter(tag);setFaqOpen(0)}}>{tag==='Payments'?t.payments:tag==='Fair play'?t.fair:tag==='Rooms'?t.rooms:tag==='Account'?t.account:tag}</button>)}</div><p className="faq-note">Every match is different. The event page always has the final rules, schedule and prize details.</p></aside>
              <div className="faq-list">{filteredQuestions.map(([,q,a],i)=><article className={`faq-item ${faqOpen===i?'open':''}`} key={q}><button className="faq-question" aria-expanded={faqOpen===i} onClick={() => setFaqOpen(faqOpen===i?null:i)}>{q}<ChevronDown size={16}/></button><div className="faq-answer"><div className="faq-answer-inner"><p>{a}</p></div></div></article>)}</div>
            </div>
            <div className="support-band reveal"><div><div className="section-kicker" style={{marginBottom:10}}>Support</div><h3>{t.support}</h3><p>{t.supportCopy} · support@battleasia.gg</p></div><button className="btn btn-primary" onClick={() => setChatOpen(true)}><MessageCircle size={15}/> Start a chat</button></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-main">
            <div className="footer-brand"><a href="#home" className="brand" onClick={(e)=>{e.preventDefault();anchor('home')}}><BrandLogo /><span>Battle Asia</span></a><p>Mobile tournaments for the players who show up. Bangladesh and across Asia.</p><div className="social-links"><button aria-label="Facebook" onClick={() => notify('Facebook community link is coming soon.')}><span>f</span></button><button aria-label="Discord" onClick={() => notify('Discord invite is coming soon.')}><MessageCircle size={14}/></button><button aria-label="YouTube" onClick={() => notify('YouTube channel is coming soon.')}><span>▶</span></button></div></div>
            <div className="footer-col"><h4>Support</h4><div className="footer-links"><a href="mailto:support@battleasia.gg">Contact support</a><a href="#rules" onClick={(e)=>{e.preventDefault();anchor('rules')}}>FAQ</a><a href="#rules" onClick={(e)=>{e.preventDefault();anchor('rules')}}>Fair play policy</a></div></div>
            <div className="footer-col"><h4>Legal</h4><div className="footer-links"><Link to="/terms-and-conditions">Terms of service</Link><Link to="/privacy-policy">Privacy policy</Link></div></div>
            <div className="footer-col"><h4>Explore</h4><div className="footer-links"><a href="#play" onClick={(e)=>{e.preventDefault();anchor('play')}}>Games</a><a href="#how-to-play" onClick={(e)=>{e.preventDefault();anchor('how-to-play')}}>Tournament modes</a><a href="#home" onClick={(e)=>{e.preventDefault();anchor('home')}}>Back to top ↑</a></div></div>
          </div>
          <div className="payment-strip"><span>Payment methods</span><span className="pay-badge">bKash</span><span className="pay-badge">Nagad</span><span className="pay-badge">USDT</span></div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} Battle Asia</span><span>Bangladesh & Asia</span></div>
        </div>
      </footer>

      <div className="float-actions">
        <div className={`social-pop ${socialOpen?'open':''}`}><button aria-label="Facebook" onClick={()=>notify('Facebook community link is coming soon.')}>f</button><button aria-label="Discord" onClick={()=>notify('Discord invite is coming soon.')}><MessageCircle size={15}/></button><button aria-label="YouTube" onClick={()=>notify('YouTube channel is coming soon.')}>▶</button></div>
        <button className="float-btn" aria-label="Social links" onClick={() => setSocialOpen(!socialOpen)}>{socialOpen?<X size={18}/>:<Sparkles size={17}/>}</button>
        <button
          className="float-btn chat"
          aria-label={supportUnread > 0 ? `Open support chat, ${supportUnread} new replies` : 'Open support chat'}
          onClick={() => {
            const next = !chatOpen;
            setChatOpen(next);
            if (next && logged) void markSupportRead();
          }}
        >
          <MessageCircle size={18} />
          {supportUnread > 0 && !chatOpen ? (
            <span className="chat-fab-badge" aria-hidden>
              {supportUnread > 9 ? '9+' : supportUnread}
            </span>
          ) : null}
        </button>
      </div>
      <LandingSupportChat open={chatOpen} onClose={() => setChatOpen(false)} />
      
      <div className="toast-stack" aria-live="polite">{toast&&<div className="toast">{toast}</div>}</div>

      <div className={`mobile-drawer ${mobileOpen?'open':''}`} aria-hidden={!mobileOpen}>
        <div className="drawer-head"><a className="brand" href="#home" onClick={(e)=>{e.preventDefault();anchor('home')}}><BrandLogo compact /><span>Battle Asia</span></a><button className="drawer-close" aria-label="Close menu" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
        <nav className="drawer-nav">
          {([
            ['home', 'home', t.home, 'home'],
            ['about-us', 'about', t.about, 'about'],
            ['play', 'play', t.play, 'play'],
            ['rules', 'rules', t.rules, 'rules'],
          ] as const).map(([id, key, label, icon]) => (
            <a
              href={`#${id}`}
              key={id}
              className={activeLink === key ? 'is-active' : ''}
              onClick={(e) => { e.preventDefault(); anchor(id); }}
            >
              <span className="drawer-nav-ico"><MenuGlyph kind={icon} /></span>
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="drawer-cards">{logged ? <Link className="drawer-card drawer-profile" to="/user/play" onClick={() => setMobileOpen(false)}><UserAvatar src={me?.avatar} name={playerName} size={36} /><span>{playerName}<small>{appT('cta.enterArena')}</small></span></Link> : <button className="drawer-card" onClick={()=>openAuth('signin')}>{t.signin}<small>Access your player profile</small></button>}<button className="drawer-card" onClick={()=>logged?navigate('/user/play'):onJoin()}>{t.arena}<small>Join a live tournament</small></button></div>
        <button className="drawer-card drawer-apk" onClick={() => { if (apkUrl) window.location.href = apkUrl; }}>Download the APK <small>{apkLabel}</small></button>
        <div className="drawer-tools"><LangMenu locale={locale} onPick={chooseLocale} dropUp /></div>
        <div className="drawer-foot">{logged ? <><button className="btn btn-ghost" onClick={signOut}>{appT('cta.signout')}</button><Link className="btn btn-primary" to="/user/play" onClick={() => setMobileOpen(false)}>{t.arena}</Link></> : <><button className="btn btn-ghost" onClick={()=>openAuth('signin')}>{t.signin}</button><button className="btn btn-primary" onClick={onJoin}>{t.signup}</button></>}</div>
      </div>

      {modal&&<div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)closeModal()}}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-art"><AuthModalLogo showSignArrow={modal === 'signup'} signLabel={t.signup} /><div className="modal-bac-line"><BacCoin size={18} /><span>Victory pays real · BAC</span></div><div><div className="modal-promo">Your next match starts here</div><p>Find your room. Bring your squad.<br/>Play for something that counts.</p></div><div style={{color:'#a9ad98',fontSize:11}}>Bangladesh & Asia</div></div>
        <div className="modal-form"><button className="modal-close" aria-label="Close dialog" onClick={closeModal}><X size={17}/></button>
          {modal==='signin'&&<><h2 id="modal-title" className="modal-heading">Welcome back</h2><p className="modal-sub">Enter the arena where every match matters.</p><form className="form-fields" onSubmit={handleSignin}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="field"><label>{t.email}</label><input autoFocus type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/></div><div className="field"><label>{t.password}</label><div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password"/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div><div className="form-meta"><label className="checkline"><input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)}/>{t.remember}</label><button type="button" className="inline-link" onClick={()=>{setError('');setModal('forgot')}}>{t.forgot}</button></div><button className="btn btn-primary form-submit auth-cta-btn"><span>{t.signin}</span><AuthCtaArrow /></button><div className="oauth-row"><button type="button" className="oauth-btn oauth-btn--google" onClick={() => { window.location.href = `/api/v2/users/oauth/google?returnTo=${encodeURIComponent(returnPath)}` }}><span className="oauth-icon-wrap oauth-icon-wrap--google"><GoogleIcon /></span><span className="oauth-btn-label">Continue with Google</span></button><button type="button" className="oauth-btn oauth-btn--discord" onClick={() => { window.location.href = `/api/v2/users/oauth/discord?returnTo=${encodeURIComponent(returnPath)}` }}><span className="oauth-icon-wrap oauth-icon-wrap--discord"><DiscordIcon /></span><span className="oauth-btn-label">Continue with Discord</span></button></div></form><p className="auth-switch">New to the arena? <button className="inline-link" onClick={()=>{setSignupStep(1);setModal('signup')}}>{t.createAccount}</button></p></>}
          {modal==='signup'&&<><h2 id="modal-title" className="modal-heading">{t.createAccount}</h2><p className="modal-sub">A few details, then you’re on the roster.</p><div className="stepper"><i className="active"/><i className={signupStep===2?'active':''}/></div><form className="form-fields" onSubmit={handleSignupStep}>{error&&<div className="form-error" role="alert">{error}</div>}
            {signupStep===1?<><div className="field"><label>{t.email}</label><input autoFocus type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/><small style={{color:email.includes('@')?(email.includes('taken')?'#ef9b88':'#b7cf62'):'#777',fontSize:9,display:'block',marginTop:5}}>{email.includes('@')?(email.includes('taken')?'This email is already in use.':'✓ Email available'):'Availability checked as you type'}</small></div><div className="field"><label>{t.password}</label><div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div><div className="strength">{[0,1,2].map((v)=><i key={v} className={v<passwordStrength?'on':''}/>)}</div><small style={{color:'#787b83',fontSize:9}}>Use 8+ characters with a mix of letters and numbers.</small></div><div className="field"><label>Confirm password</label><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Repeat password"/>{confirm&&<small style={{color:confirm===password?'#b7cf62':'#e09382',fontSize:9}}>{confirm===password?'Passwords match':'Passwords do not match'}</small>}</div><button className="btn btn-primary form-submit auth-cta-btn"><span>{t.continue}</span><AuthCtaArrow /></button></>:<><div className="field"><label>{t.username}</label><input autoFocus value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Your player name"/></div><div className="field-row"><div className="field"><label>{t.gameId}</label><input value={gameId} onChange={(e)=>setGameId(e.target.value)} placeholder="Player ID"/></div><div className="field"><label>{t.phone}</label><input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+880 1XXX"/></div></div><div className="field"><label>{t.server}</label><select value={server} onChange={(e)=>setServer(e.target.value)}>{['Asia','Europe','South America','Middle East','KR / JP'].map((s)=><option key={s}>{s}</option>)}</select></div>{new URLSearchParams(window.location.search).get('ref')&&<div className="form-error" style={{background:'rgba(212,232,42,.08)',color:'#c6d17e',borderColor:'rgba(212,232,42,.2)'}}>Referral code {new URLSearchParams(window.location.search).get('ref')} applied.</div>}<label className="checkline"><input type="checkbox" checked={terms} onChange={(e)=>setTerms(e.target.checked)}/>{appT('auth.agreeLead')} <Link to="/terms-and-conditions" onClick={(e)=>e.stopPropagation()}>{appT('footer.terms')}</Link> {appT('auth.agreeAnd')} <Link to="/privacy-policy" onClick={(e)=>e.stopPropagation()}>{appT('footer.privacy')}</Link></label><div className="field-row"><button type="button" className="btn btn-ghost" onClick={()=>{setSignupStep(1);setError('')}}><ArrowLeft size={14}/> Back</button><button className="btn btn-primary auth-cta-btn"><span>{t.createAccount}</span><AuthCtaArrow /></button></div></>}</form><p className="auth-switch">Already on the roster? <button type="button" className="inline-link" onClick={()=>openAuth('signin')}>{t.signin}</button></p></>}
          {modal==='otp'&&<><h2 id="modal-title" className="modal-heading">{t.verify}</h2><p className="modal-sub">{t.otpHelp} <strong style={{color:'#e1e2dd'}}>{email.replace(/^(.).+(@.+)$/,'$1***$2')||'j***@battleasia.gg'}</strong></p><form className="form-fields" onSubmit={handleOtp}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="otp-row">{otp.map((digit,i)=><input key={i} aria-label={`Verification digit ${i+1}`} inputMode="numeric" maxLength={6} value={digit} onChange={(e)=>onOtpInput(i,e.target.value,e.target)} onKeyDown={(e)=>onOtpKey(e,i)}/>)}</div><button className="btn btn-primary form-submit">{t.verify} <ArrowRight size={14}/></button><div className="form-meta"><span /><button type="button" disabled={cooldown>0} className="inline-link" onClick={()=>{ setCooldown(60); void resendVerification(email.trim()).then(() => notify('A new code has been sent.')).catch(fail); }}>{cooldown>0?`Resend in ${cooldown}s`:t.resend}</button></div></form></>}
          {modal==='forgot'&&<><h2 id="modal-title" className="modal-heading">Reset your password</h2><p className="modal-sub">We’ll send a reset code to your email address.</p><form className="form-fields" onSubmit={handleForgot}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="field"><label>{t.email}</label><input autoFocus type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/></div><button className="btn btn-primary form-submit">{t.send} <ArrowRight size={14}/></button><button type="button" className="inline-link" onClick={()=>setModal('signin')}>Back to sign in</button></form></>}
          {modal==='reset'&&<><h2 id="modal-title" className="modal-heading">Choose a new password</h2><p className="modal-sub">Enter the code sent to {email.replace(/^(.).+(@.+)$/,'$1***$2')} and set a new password.</p><form className="form-fields" onSubmit={handleReset}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="otp-row">{otp.map((digit,i)=><input key={i} aria-label={`Reset code digit ${i+1}`} inputMode="numeric" maxLength={6} value={digit} onChange={(e)=>onOtpInput(i,e.target.value,e.target)} onKeyDown={(e)=>onOtpKey(e,i)}/>)}</div><div className="field"><label>New password</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters"/></div><div className="field"><label>Confirm password</label><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Repeat new password"/></div><button className="btn btn-primary form-submit">Reset password</button><div className="form-meta"><span/><button type="button" disabled={cooldown>0} className="inline-link" onClick={()=>{ setCooldown(60); void forgotPassword(email.trim()).catch(fail); }}>{cooldown>0?`Resend in ${cooldown}s`:t.resend}</button></div></form></>}
          <div className="trust-row">{trustItems.map(([icon,label])=><span key={label}>{icon==='shield'?<ShieldCheck size={12}/>:icon==='crosshair'?<Crosshair size={12}/>:<Zap size={12}/>} {label}</span>)}</div>
        </div>
      </section></div>}
    </div>
    </div>
  );
}