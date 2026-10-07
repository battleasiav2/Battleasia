import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowDownRight, ArrowLeft, ArrowRight, ChevronDown, Crosshair, Crown, Eye, EyeOff, Headphones, Menu, MessageCircle, ShieldCheck, Sparkles, Users, X, Zap } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import { type ReactNode } from 'react';

const queryClient = new QueryClient();
type Locale = 'EN' | 'BN';
type ModalName = 'signin' | 'signup' | 'otp' | 'forgot' | 'reset' | null;

const text: Record<Locale, Record<string, string>> = {
  EN: {
    home: 'Home', about: 'About', play: 'Play', rules: 'Rules', signin: 'Sign in', signup: 'Join', arena: 'Enter arena',
    eyebrow: 'Mobile tournament arena for South Asia', lead: 'Your next clutch is worth more. Compete in mobile tournaments, earn BAC coins, and make your name count.',
    download: 'Download APK', players: 'Players online', matches: 'Matches today', seats: 'Seats filled', pulse: 'Arena pulse',
    joins: "Today's joins", totalmatches: 'Total matches', ongoing: 'Ongoing now', winnings: 'Total winnings',
    high: 'High prize', live: 'Live / ongoing', games: 'Pick your game', gamesub: 'One arena. The games your squad already plays.',
    aboutTitle: 'Built for the next generation of champions.', aboutLead: 'Battle Asia is a tournament arena built around the way South Asia plays: on mobile, with friends, and always for something worth winning.',
    modes: 'Find your format', faq: 'The details matter.', support: 'Need a hand? We’re right here.', supportCopy: 'Our player support team is one message away.',
    payments: 'Payments', fair: 'Fair play', rooms: 'Rooms', account: 'Account', trust: 'Secure login', fairplay: 'Fair play', payouts: 'Real payouts',
    open: 'open matches', soon: 'Coming soon', promo: 'The next match could be yours', create: 'Create account', continue: 'Continue', verify: 'Verify email',
    send: 'Send code', resend: 'Resend code', password: 'Password', email: 'Email address', remember: 'Remember me', forgot: 'Forgot password?',
    createAccount: 'Create account', enterEmail: 'Enter your email', otpHelp: 'Enter the six-digit code we sent to', username: 'In-game username', gameId: 'PUBG / Game ID',
    phone: 'Phone number', server: 'Game server', terms: 'I agree to the Terms of Service and Privacy Policy', help: 'Support',
  },
  BN: {
    home: 'হোম', about: 'পরিচিতি', play: 'খেলুন', rules: 'নিয়ম', signin: 'সাইন ইন', signup: 'যোগ দিন', arena: 'এরিনায় যান',
    eyebrow: 'দক্ষিণ এশিয়ার এরিনা', lead: 'আপনার পরের ক্লাচের মূল্য আছে। মোবাইল টুর্নামেন্টে খেলুন, BAC কয়েন জিতুন, নিজের নাম তৈরি করুন।',
    download: 'APK ডাউনলোড', players: 'অনলাইনে খেলোয়াড়', matches: 'আজকের ম্যাচ', seats: 'আসন পূর্ণ', pulse: 'এরিনার স্পন্দন',
    joins: 'আজকের যোগদান', totalmatches: 'মোট ম্যাচ', ongoing: 'চলমান', winnings: 'মোট জয়',
    high: 'বড় পুরস্কার', live: 'লাইভ / চলমান', games: 'আপনার যুদ্ধক্ষেত্র বেছে নিন', gamesub: 'একটি এরিনা। আপনার স্কোয়াডের পরিচিত গেম।',
    aboutTitle: 'আগামী চ্যাম্পিয়নদের জন্য তৈরি।', aboutLead: 'BATTLE ASIA দক্ষিণ এশিয়ার খেলার ধরন—মোবাইলে, বন্ধুদের সঙ্গে, জয়ের লক্ষ্য নিয়ে—একে কেন্দ্র করে তৈরি একটি টুর্নামেন্ট এরিনা।',
    modes: 'আপনার ফরম্যাট বেছে নিন', faq: 'বিস্তারিত গুরুত্বপূর্ণ।', support: 'সাহায্য দরকার? আমরা আছি।', supportCopy: 'আমাদের প্লেয়ার সাপোর্ট টিম এক বার্তাই দূরে।',
    payments: 'পেমেন্ট', fair: 'ফেয়ার প্লে', rooms: 'রুম', account: 'অ্যাকাউন্ট', trust: 'নিরাপদ লগইন', fairplay: 'ফেয়ার প্লে', payouts: 'আসল পুরস্কার',
    open: 'টি ম্যাচ খোলা', soon: 'শীঘ্রই আসছে', promo: 'পরের ম্যাচটি হতে পারে আপনার', create: 'অ্যাকাউন্ট তৈরি', continue: 'চালিয়ে যান', verify: 'ইমেইল যাচাই',
    send: 'কোড পাঠান', resend: 'আবার কোড পাঠান', password: 'পাসওয়ার্ড', email: 'ইমেইল ঠিকানা', remember: 'মনে রাখুন', forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    createAccount: 'অ্যাকাউন্ট তৈরি', enterEmail: 'ইমেইল লিখুন', otpHelp: 'পাঠানো ছয় সংখ্যার কোড লিখুন', username: 'গেমের ইউজারনেম', gameId: 'PUBG / গেম আইডি',
    phone: 'ফোন নম্বর', server: 'গেম সার্ভার', terms: 'আমি সেবার শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত', help: 'সহায়তা',
  },
};

const games = [
  { name: 'PUBG Mobile', cls: 'pubg', tag: 'Most played', count: 18, image: '/images/game-pubg-hero.jpg' },
  { name: 'Free Fire', cls: 'fire', tag: '', count: 9, image: '/images/game-freefire-hero.jpg' },
  { name: 'Call of Duty', cls: 'cod', tag: '', count: 7, image: '/images/game-cod-hero.jpg' },
  { name: 'Mobile Legends', cls: 'mlbb', tag: '', count: 5, image: '/images/game-mlbb-hero.jpg' },
  { name: 'Valorant Mobile', cls: 'valorant', tag: 'COMING SOON', count: 0, image: '/images/game-valorant-hero.jpg' },
];
const matchSeed = [
  { name: 'Friday Night Drop', game: 'PUBG MOBILE · SQUAD', entry: 35, prize: '12,500', filled: 72, capacity: 100 },
  { name: 'Erangel After Dark', game: 'PUBG MOBILE · DUO', entry: 50, prize: '18,000', filled: 48, capacity: 64 },
  { name: 'Clutch Royale #42', game: 'FREE FIRE · SQUAD', entry: 20, prize: '6,400', filled: 58, capacity: 64 },
  { name: 'ACE Invitational', game: 'PUBG MOBILE · SOLO', entry: 100, prize: '50,000', filled: 100, capacity: 100 },
  { name: 'Midnight TDM', game: 'COD MOBILE · TDM', entry: 15, prize: '3,000', filled: 21, capacity: 40 },
];
const matchStatus = (filled: number, capacity: number) =>
  filled >= capacity ? 'Full' : filled / capacity >= 0.9 ? 'Almost full' : 'Open';
const profitSeed: [string, number][] = [['RafsanX',84250],['N4b1l',71620],['DARK•RIDER',63480],['ZayedOP',58920],['SiamPlays',49370],['xMahi',44180],['RDX•Rafi',38650],['ShadowBD',32410]];
const killSeed: [string, number][] = [['ViperBD',1284],['ToxicNabil',1156],['M4•HUNTER',1092],['RafsanX',987],['SiamPlays',932],['ZayedOP',876],['RDX•Rafi',809],['xMahi',774]];
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

type ClickFxPoint = { id: number; x: number; y: number };

const canUseGamingCursor = () =>
  !prefersReduced() && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function GamingCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [pressed, setPressed] = useState(false);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = canUseGamingCursor();
    if (!enabled.current) return;

    document.documentElement.classList.add('has-gaming-cursor');

    const interactiveSelector =
      'a, button, [role="button"], .join-btn, .match-tab, .topic-chip, .game-card, .oauth-btn, .drawer-card, label.checkline';

    const updateMode = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        setHover(false);
        setTextMode(false);
        return;
      }
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        setTextMode(true);
        setHover(false);
        return;
      }
      setTextMode(false);
      setHover(Boolean(target.closest(interactiveSelector)));
    };

    const onMove = (event: PointerEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
      setVisible(true);
      updateMode(event.target);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.documentElement.classList.remove('has-gaming-cursor');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  if (!canUseGamingCursor()) return null;

  return (
    <div
      className={`gaming-cursor ${visible ? 'is-visible' : ''} ${hover ? 'is-hover' : ''} ${textMode ? 'is-text' : ''} ${pressed ? 'is-pressed' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    >
      <span className="gaming-cursor-glow" />
      <span className="gaming-cursor-ring" />
      <span className="gaming-cursor-ring gaming-cursor-ring--inner" />
      <span className="gaming-cursor-tick gaming-cursor-tick--n" />
      <span className="gaming-cursor-tick gaming-cursor-tick--e" />
      <span className="gaming-cursor-tick gaming-cursor-tick--s" />
      <span className="gaming-cursor-tick gaming-cursor-tick--w" />
      <span className="gaming-cursor-dot" />
      <span className="gaming-cursor-beam" />
    </div>
  );
}

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

function App() {
  const [locale, setLocale] = useState<Locale>('EN');
  const [accent, setAccent] = useState('#d4e82a');
  const [modal, setModal] = useState<ModalName>(null);
  const [logged, setLogged] = useState(false);
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
  const [chatInput, setChatInput] = useState('');
  const [chatSent, setChatSent] = useState('');
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
    players: 12480,
    matches: 342,
    joins: 1284,
    totalMatches: 18642,
    winningsBac: 2_400_000,
    joinTrend: 12.8,
  });
  const [liveMatches, setLiveMatches] = useState(matchSeed);
  const [arenaSeatsFilled, setArenaSeatsFilled] = useState(7420);
  const ongoingLive = liveMatches.filter((m) => m.filled < m.capacity).length;
  const arenaSeatPct = Math.min(100, Math.round((arenaSeatsFilled / ARENA_SEAT_CAPACITY) * 100));
  const arenaSeatStatus = getArenaSeatStatus(arenaSeatPct);
  const arenaSeatRotate = arenaSeatPct * 3.6 - 90;
  const [profitBoard, setProfitBoard] = useState(() => profitSeed.map(([name, score]) => ({ name, score })));
  const [killBoard, setKillBoard] = useState(() => killSeed.map(([name, score]) => ({ name, score })));
  const [movedPlayer, setMovedPlayer] = useState('');
  const [trustMetrics, setTrustMetrics] = useState({
    verifiedBps: 992,
    bacPaid: 1_840_000,
    fairRooms: 126,
    activeSquads: 3840,
    supportSeconds: 228,
  });
  const t = text[locale];
  const activeMatches = useMemo(
    () => matchTab === 'high' ? liveMatches : liveMatches.filter((m) => m.filled < m.capacity),
    [matchTab, liveMatches]
  );
  const railRef = useRef<HTMLDivElement>(null);
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
    const items = liveMatches.map((match) => {
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
  }, [liveMatches, profitBoard, killBoard]);

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
    document.documentElement.lang = locale === 'BN' ? 'bn' : 'en';
  }, [locale]);

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
    const id = setInterval(() => {
      setLiveStats((prev) => ({
        players: Math.max(9000, prev.players + Math.round((Math.random() - 0.42) * 120)),
        matches: prev.matches + (Math.random() > 0.55 ? 1 : 0),
        joins: prev.joins + Math.round(Math.random() * 3),
        totalMatches: prev.totalMatches + (Math.random() > 0.62 ? 1 : 0),
        winningsBac: prev.winningsBac + Math.round(Math.random() * 1800 + 400),
        joinTrend: Math.min(18.4, Math.max(8.2, prev.joinTrend + (Math.random() - 0.48) * 0.35)),
      }));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTrustMetrics((prev) => ({
        verifiedBps: Math.min(999, Math.max(985, prev.verifiedBps + (Math.random() > 0.72 ? 1 : 0))),
        bacPaid: prev.bacPaid + Math.round(Math.random() * 2200 + 400),
        fairRooms: prev.fairRooms + (Math.random() > 0.58 ? 1 : 0),
        activeSquads: prev.activeSquads + Math.round(Math.random() * 14 + 2),
        supportSeconds: Math.max(186, Math.min(276, prev.supportSeconds + Math.round((Math.random() - 0.52) * 10))),
      }));
    }, 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setArenaSeatsFilled((filled) => {
        if (filled >= ARENA_SEAT_CAPACITY) return filled;
        if (Math.random() > 0.38) return filled;
        return Math.min(ARENA_SEAT_CAPACITY, filled + 2 + Math.floor(Math.random() * 9));
      });
    }, 3400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveMatches((prev) => prev.map((match) => {
        if (match.filled >= match.capacity) return match;
        if (Math.random() > 0.45) return match;
        return { ...match, filled: Math.min(match.capacity, match.filled + 1 + Math.floor(Math.random() * 2)) };
      }));
    }, 3600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const bump = (rows: { name: string; score: number }[], gain: number) => {
        const index = Math.floor(Math.random() * rows.length);
        const moved = rows[index].name;
        const next = rows
          .map((row, i) => i === index ? { ...row, score: row.score + gain } : row)
          .sort((a, b) => b.score - a.score);
        return { next, moved };
      };
      if (Math.random() > 0.5) {
        setProfitBoard((rows) => {
          const { next, moved } = bump(rows, 120 + Math.floor(Math.random() * 900));
          setMovedPlayer(moved);
          return next;
        });
      } else {
        setKillBoard((rows) => {
          const { next, moved } = bump(rows, 1 + Math.floor(Math.random() * 4));
          setMovedPlayer(moved);
          return next;
        });
      }
    }, 5200);
    return () => clearInterval(id);
  }, []);

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

  const onJoin = () => logged ? notify('Arena is outside this demo.') : openAuth('signup');
  const onMatch = () => logged ? notify('Arena is outside this demo.') : openAuth('signin');
  const onGame = (disabled: boolean) => disabled ? notify('Valorant Mobile is coming soon.') : onMatch();
  const anchor = (id: string) => {
    setMobileOpen(false);
    window.history.replaceState(null, '', `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSignin = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Enter your password to continue.'); return; }
    if (email.toLowerCase().includes('429')) { setError('Too many attempts. Try again in 00:28.'); return; }
    if (email.toLowerCase().includes('unverified')) { setModal('otp'); return; }
    setLogged(true); closeModal(); notify('Signed in to preview mode.');
  };
  const handleSignupStep = (event: FormEvent) => {
    event.preventDefault();
    if (signupStep === 1) {
      if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
      if (email.toLowerCase().includes('taken')) { setError('This email is already in use.'); return; }
      if (password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      setError(''); setSignupStep(2); return;
    }
    if (!username.trim() || !gameId.trim() || !phone.trim()) { setError('Complete your player details to continue.'); return; }
    if (!terms) { setError('Please accept the terms to create your account.'); return; }
    setError(''); setModal('otp');
  };
  const handleOtp = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError('Enter all six digits to verify.'); return; }
    if (otp.join('') !== '123456') { setError('That code did not match. Demo code: 123456.'); return; }
    setLogged(true);
    closeModal();
    notify('Email verified. Welcome to Battle Asia.');
  };
  const handleForgot = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setError(''); setModal('reset');
  };
  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError('Enter all six digits from your email.'); return; }
    if (otp.join('') !== '123456') { setError('That code did not match. Demo code: 123456.'); return; }
    if (password.length < 8 || password !== confirm) { setError('Use matching passwords with at least 8 characters.'); return; }
    resetAuthFields();
    setModal('signin');
    notify('Password reset. Sign in with your new password.');
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
    <div className="site-shell" style={{ '--accent-color': accent } as CSSProperties}>
      <GamingCursor />
      <GamingClickFx />
      <div className="progress-line" />
      <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); anchor('home'); }}><BrandLogo /><span>Battle Asia</span></a>
          <nav className="nav-links" aria-label="Main navigation">
            {[['home',t.home],['about',t.about],['play',t.play],['rules',t.rules]].map(([id,label]) => <a key={id} href={`#${id}`} className={activeLink === id ? 'active' : ''} onClick={(e) => { e.preventDefault(); anchor(id === 'about' ? 'about-us' : id); }}>{label}</a>)}
          </nav>
          <div className="nav-actions">
            {logged ? <><button className="btn btn-ghost" onClick={() => { setLogged(false); notify('Signed out of preview mode.'); }}>Sign out</button><button className="btn btn-primary" onClick={() => notify('Arena is outside this demo.')}>{t.arena} <ArrowRight size={14}/></button><PlayerAvatar name="RafsanX" className="leader-avatar player-avatar" /></> : <><button className="btn btn-ghost" onClick={() => openAuth('signin')}>{t.signin}</button><button className="btn btn-primary" onClick={onJoin}>{t.signup} <ArrowRight size={14}/></button></>}
          </div>
          <div className="header-tools">
            <div className="accent-picker" aria-label="Choose accent color">{['#d4e82a','#61d7bd','#f08c63'].map((color) => <button aria-label={`Set accent ${color}`} key={color} className={`accent-chip ${accent === color ? 'selected' : ''}`} style={{ background:color }} onClick={() => setAccent(color)} />)}</div>
            <select aria-label="Language" className="locale-select" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}><option>EN</option><option>BN</option></select>
          </div>
          <button className="mobile-trigger" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={22}/></button>
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
              <div className="eyebrow"><span className="eyebrow-dot"/>{t.eyebrow} <span>·</span> Bangladesh & Asia</div>
              <h1>Battle Asia</h1>
              <p className="hero-lead">{t.lead}</p>
              <div className="hero-ctas"><button className="btn btn-primary" onClick={onJoin}>{t.signup} <ArrowRight size={15}/></button><button className="btn btn-ghost" onClick={() => notify('APK download · v2.4.1 · 48 MB — demo only')}><ArrowDownRight size={15}/>{t.download} <span className="mono" style={{fontSize:9,opacity:.7}}>48 MB</span></button></div>
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
            <div className="pulse-head reveal"><div><div className="section-kicker">{t.pulse}</div><h2 className="section-title" style={{marginBottom:0}}>Numbers don’t lie.</h2></div><div className="pulse-live kpi-pulse-badge"><span className="kpi-pulse-badge-dot" aria-hidden="true" />Live arena pulse</div></div>
            <div className="kpi-grid reveal kpi-grid-live">
              <div className="kpi-ecg" aria-hidden="true"><svg viewBox="0 0 400 24" preserveAspectRatio="none"><path className="kpi-ecg-path" d="M0 12h40l8-9 8 18 8-18 8 9h40l6-5 6 10 6-10 6 5h40l10-8 10 16 10-16 10 8h40l8-6 8 12 8-12 8 6h40" /></svg></div>
              <KpiLiveCard variant="joins" label={t.joins} tick={liveStats.joins} value={<LiveNumber value={liveStats.joins} />} note={`+${liveStats.joinTrend.toFixed(1)}% this week`} />
              <KpiLiveCard variant="matches" label={t.totalmatches} tick={liveStats.totalMatches} value={<LiveNumber value={liveStats.totalMatches} />} note="Across five games" />
              <KpiLiveCard variant="ongoing" label={t.ongoing} tick={ongoingLive} live value={<span className="kpi-live-value"><LiveNumber value={ongoingLive} /></span>} note="Happening now" />
              <KpiLiveCard
                variant="winnings"
                label={t.winnings}
                tick={liveStats.winningsBac}
                coin
                value={<LiveNumber value={liveStats.winningsBac} format={(n) => `${(n / 1_000_000).toFixed(1)}M`} />}
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
              <div className="leader-data-note">Preview leaderboard · hardcoded sample results</div>
              {(() => {
                const metric = leaderboardTab==='profit' ? 'BAC' : 'KILLS';
                const ranked = leaders.map((row, index) => ({ ...row, rank: String(index + 1).padStart(2, '0') }));
                return <>
                  <div className="podium-stage" aria-hidden="true">
                    <div className="podium-aurora" />
                    <div className="podium-beam" />
                  </div>
                  <div className="podium podium-is-live" ref={podiumRef} aria-label={`${leaderboardTab==='profit'?'Top profit':'Top killers'} podium`}>
                    {[ranked[1], ranked[0], ranked[2]].map(({rank,name,score}) => {
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
            >{activeMatches.map((match) => {
              const status = matchStatus(match.filled, match.capacity);
              const full = status === 'Full';
              const almostFull = status === 'Almost full';
              const joinClass = full ? 'join-btn-view' : almostFull ? 'join-btn-urgent' : 'join-btn-live';
              return <article className={`match-card ${almostFull ? 'match-card-hot' : ''}`} key={match.name}><div className="match-card-top"><span className="game-tag">{match.game.split(' · ')[0]}</span><span className={`status ${full?'full':''}`}>{status}</span></div><h3>{match.name}</h3><div className="match-info"><span>Entry<strong><BacCoin size={14} />{match.entry} BAC</strong></span><span>Prize pool<strong><BacCoin size={14} />{match.prize} BAC</strong></span></div><div className="capacity"><span className="capacity-fill" style={{width:`${match.filled/match.capacity*100}%`}}/></div><div className="match-foot"><span><LiveNumber value={match.filled} />/{match.capacity} players</span><button type="button" className={`join-btn ${joinClass}`} onClick={onMatch}><span className="join-btn-shine" aria-hidden="true" />{!full && <span className="join-btn-dot" aria-hidden="true" />}<span className="join-btn-text">{full ? 'View event' : 'Join match'}</span><span className="join-arrow" aria-hidden="true">↗</span></button></div></article>;
            })}</div>
          </div>
        </section>

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

        <section id="play" className="section">
          <div className="wrap">
            <div className="reveal"><div className="section-kicker">Games</div><h2 className="section-title">{t.games}</h2><p className="section-copy">{t.gamesub}</p></div>
            <div className="games-grid reveal">{games.map((game) => <button key={game.name} type="button" className={`game-card ${game.cls} ${game.count===0?'disabled':''}`} onClick={() => onGame(game.count===0)} aria-label={`${game.name} ${game.count===0?'coming soon':`${game.count} open matches`}`} onMouseMove={(e) => { const r=e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx',`${e.clientX-r.left}px`);e.currentTarget.style.setProperty('--my',`${e.clientY-r.top}px`); if(matchMedia('(hover:hover)').matches){e.currentTarget.style.setProperty('--rx',`${((e.clientY-r.top)/r.height-.5)*-7}deg`);e.currentTarget.style.setProperty('--ry',`${((e.clientX-r.left)/r.width-.5)*7}deg`);} }} onMouseLeave={(e) => {e.currentTarget.style.setProperty('--rx','0deg');e.currentTarget.style.setProperty('--ry','0deg')}}><img src={game.image} alt="" className="game-card-art" loading="lazy" decoding="async" />{game.tag&&<span className="game-badge">{game.tag}</span>}<div className="game-card-copy"><h3>{game.name}</h3><p className={game.count ? '' : 'soon'}>{game.count ? `${game.count} ${t.open}` : t.soon}</p></div></button>)}</div>
          </div>
        </section>

        <section id="about-us" className="section about-section">
          <div className="wrap about-layout">
            <div className="about-copy reveal"><div className="section-kicker">About Battle Asia</div><h2 className="section-title">{t.aboutTitle}</h2><p>{t.aboutLead}</p><p>From your first room to the final circle, we make competition clear, fair and worth showing up for. Play PUBG Mobile first, then take your shot across a growing roster of mobile games.</p><div className="about-ctas"><button className="btn btn-primary" onClick={onJoin}>{t.create} <ArrowRight size={14}/></button><button className="btn btn-ghost" onClick={() => anchor('play')}>Explore games</button></div></div>
            <div className="about-trust-panel reveal">
              <div className="about-trust-head"><span className="kpi-pulse-badge-dot" aria-hidden="true" />Live platform proof</div>
              <div className="trust-ecg" aria-hidden="true"><svg viewBox="0 0 400 24" preserveAspectRatio="none"><path className="trust-ecg-path" d="M0 12h32l6-8 6 16 6-16 6 8h32l5-4 5 8 5-8 5 4h32l8-6 8 12 8-12 8 6h32l6-5 6 9 6-9 6 5h32" /></svg></div>
              <div className="trust-list trust-list-live">
                <TrustLiveCard variant="verified" icon="shield" title="Trust, built in" desc="Clear rules. Verified results." live tick={trustMetrics.verifiedBps} metric={<LiveNumber value={trustMetrics.verifiedBps} format={(n) => `${(n / 10).toFixed(1)}%`} />} note="Verified match rate" />
                <TrustLiveCard variant="payouts" icon="zap" title="Payouts that count" desc="BAC winnings after results." tick={trustMetrics.bacPaid} metric={<LiveNumber value={trustMetrics.bacPaid} format={(n) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : formatNumber(n))} />} note="BAC paid this season" />
                <TrustLiveCard variant="rooms" icon="crosshair" title="Fair rooms" desc="Competitive play, monitored." live tick={trustMetrics.fairRooms} metric={<LiveNumber value={trustMetrics.fairRooms} />} note="Monitored rooms today" />
                <TrustLiveCard variant="community" icon="users" title="A real community" desc="Squads from across the region." tick={trustMetrics.activeSquads} metric={<LiveNumber value={trustMetrics.activeSquads} />} note="Active squads online" />
                <TrustLiveCard variant="support" icon="help" title="Player-first support" desc="A person, not a bot." tick={trustMetrics.supportSeconds} metric={<LiveNumber value={trustMetrics.supportSeconds} format={(n) => `${(n / 60).toFixed(1)}m`} />} note="Median first reply" />
              </div>
            </div>
          </div>
        </section>

        <section id="how-to-play" className="section">
          <div className="wrap"><div className="reveal"><div className="section-kicker">How to play</div><h2 className="section-title">{t.modes}</h2><p className="section-copy">Different squads. Different stakes. Pick the way you play best.</p></div><div className="modes-grid reveal">{modeData.map(([num,name,desc],i)=><article className={`mode-card mode-${num}`} key={num}><div className="mode-art" role="img" aria-label={`${name} game mode artwork`}><span className="mode-num">{num}</span><span className="mode-art-label">Mode {num}</span></div><div className="mode-copy"><h3>{name}</h3><p>{desc}</p></div></article>)}</div></div>
        </section>

        <section id="rules" className="section faq-section">
          <div className="wrap"><div className="section-kicker">FAQ</div><h2 className="section-title">{t.faq}</h2><p className="section-copy">A good competition starts with knowing where you stand.</p>
            <div className="faq-layout"><aside className="faq-side"><div className="topic-chips">{['All','Payments','Fair play','Rooms','Account'].map((tag) => <button key={tag} className={`topic-chip ${faqFilter===tag?'active':''}`} onClick={() => {setFaqFilter(tag);setFaqOpen(0)}}>{tag==='Payments'?t.payments:tag==='Fair play'?t.fair:tag==='Rooms'?t.rooms:tag==='Account'?t.account:tag}</button>)}</div><p className="faq-note">Every match is different. The event page always has the final rules, schedule and prize details.</p></aside>
              <div className="faq-list">{filteredQuestions.map(([topic,q,a],i)=><article className={`faq-item ${faqOpen===i?'open':''}`} key={q}><button className="faq-question" aria-expanded={faqOpen===i} onClick={() => setFaqOpen(faqOpen===i?null:i)}>{q}<ChevronDown size={16}/></button><div className="faq-answer"><div className="faq-answer-inner"><p>{a}</p></div></div></article>)}</div>
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
            <div className="footer-col"><h4>Legal</h4><div className="footer-links"><a href="#terms" onClick={(e)=>{e.preventDefault();notify('Terms will be available with the full launch.')}}>Terms of service</a><a href="#privacy" onClick={(e)=>{e.preventDefault();notify('Privacy policy will be available with the full launch.')}}>Privacy policy</a></div></div>
            <div className="footer-col"><h4>Explore</h4><div className="footer-links"><a href="#play" onClick={(e)=>{e.preventDefault();anchor('play')}}>Games</a><a href="#how-to-play" onClick={(e)=>{e.preventDefault();anchor('how-to-play')}}>Tournament modes</a><a href="#home" onClick={(e)=>{e.preventDefault();anchor('home')}}>Back to top ↑</a></div></div>
          </div>
          <div className="payment-strip"><span>Payment methods</span><span className="pay-badge">bKash</span><span className="pay-badge">Nagad</span><span className="pay-badge">USDT</span></div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} Battle Asia</span><span>Preview · no real money</span></div>
        </div>
      </footer>

      <div className="float-actions">
        <div className={`social-pop ${socialOpen?'open':''}`}><button aria-label="Facebook" onClick={()=>notify('Facebook community link is coming soon.')}>f</button><button aria-label="Discord" onClick={()=>notify('Discord invite is coming soon.')}><MessageCircle size={15}/></button><button aria-label="YouTube" onClick={()=>notify('YouTube channel is coming soon.')}>▶</button></div>
        <button className="float-btn" aria-label="Social links" onClick={() => setSocialOpen(!socialOpen)}>{socialOpen?<X size={18}/>:<Sparkles size={17}/>}</button>
        <button className="float-btn chat" aria-label="Open support chat" onClick={() => setChatOpen(!chatOpen)}><MessageCircle size={18}/></button>
      </div>
      <div className={`chat-panel ${chatOpen?'open':''}`} aria-hidden={!chatOpen}><div className="chat-head"><div><strong>Player support</strong><small>Typically replies in a few minutes</small></div><button aria-label="Close chat" className="drawer-close" onClick={()=>setChatOpen(false)}><X size={16}/></button></div><div className="chat-body"><div className="chat-msg">Welcome to Battle Asia support. What can we help with?</div>{chatSent&&<><div className="chat-msg reply">{chatSent}</div><div className="chat-msg">Thanks — this is a demo chat. Reach us at support@battleasia.gg.</div></>}</div><form className="chat-form" onSubmit={(e)=>{e.preventDefault();if(chatInput.trim()){setChatSent(chatInput.trim());setChatInput('')}}}><input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Write a message..." aria-label="Chat message"/><button aria-label="Send message"><ArrowRight size={15}/></button></form></div>
      <label className="demo-toggle"><input type="checkbox" checked={logged} onChange={(e)=>{setLogged(e.target.checked);notify(e.target.checked?'Preview logged in enabled.':'Preview logged out.')}}/> Preview logged in</label>
      <div className="toast-stack" aria-live="polite">{toast&&<div className="toast">{toast}</div>}</div>

      <div className={`mobile-drawer ${mobileOpen?'open':''}`} aria-hidden={!mobileOpen}>
        <div className="drawer-head"><a className="brand" href="#home" onClick={(e)=>{e.preventDefault();anchor('home')}}><BrandLogo compact /><span>Battle Asia</span></a><button className="drawer-close" aria-label="Close menu" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
        <nav className="drawer-nav">{[['home',t.home],['about-us',t.about],['play',t.play],['rules',t.rules]].map(([id,label])=><a href={`#${id}`} key={id} onClick={(e)=>{e.preventDefault();anchor(id)}}>{label}</a>)}</nav>
        <div className="drawer-cards"><button className="drawer-card" onClick={()=>openAuth('signin')}>{t.signin}<small>Access your player profile</small></button><button className="drawer-card" onClick={()=>logged?notify('Arena is outside this demo.'):onJoin()}>{t.arena}<small>Join a live tournament</small></button></div>
        <button className="drawer-card drawer-apk" onClick={()=>notify('APK download · v2.4.1 · 48 MB — demo only')}>Download the APK <small>Version 2.4.1 · 48 MB</small></button>
        <div className="drawer-tools"><div className="accent-picker">{['#d4e82a','#61d7bd','#f08c63'].map((color)=><button key={color} aria-label={`Set accent ${color}`} className={`accent-chip ${accent===color?'selected':''}`} style={{background:color}} onClick={()=>setAccent(color)}/>)}</div><select aria-label="Language" className="locale-select" value={locale} onChange={(e)=>setLocale(e.target.value as Locale)}><option>EN</option><option>BN</option></select></div>
        <div className="drawer-foot"><button className="btn btn-ghost" onClick={()=>openAuth('signin')}>{t.signin}</button><button className="btn btn-primary" onClick={onJoin}>{t.signup}</button></div>
      </div>

      {modal&&<div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)closeModal()}}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-art"><AuthModalLogo showSignArrow={modal === 'signup'} signLabel={t.signup} /><div className="modal-bac-line"><BacCoin size={18} /><span>Victory pays real · BAC</span></div><div><div className="modal-promo">Your next match starts here</div><p>Find your room. Bring your squad.<br/>Play for something that counts.</p></div><div style={{color:'#a9ad98',fontSize:11}}>Bangladesh & Asia</div></div>
        <div className="modal-form"><button className="modal-close" aria-label="Close dialog" onClick={closeModal}><X size={17}/></button>
          {modal==='signin'&&<><h2 id="modal-title" className="modal-heading">Welcome back</h2><p className="modal-sub">Enter the arena where every match matters.</p><form className="form-fields" onSubmit={handleSignin}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="field"><label>{t.email}</label><input autoFocus type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/></div><div className="field"><label>{t.password}</label><div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password"/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div><div className="form-meta"><label className="checkline"><input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)}/>{t.remember}</label><button type="button" className="inline-link" onClick={()=>{setError('');setModal('forgot')}}>{t.forgot}</button></div><button className="btn btn-primary form-submit auth-cta-btn"><span>{t.signin}</span><AuthCtaArrow /></button><div className="oauth-row"><button type="button" className="oauth-btn oauth-btn--google" onClick={()=>notify('Google sign-in is demo-only.')}><span className="oauth-icon-wrap oauth-icon-wrap--google"><GoogleIcon /></span><span className="oauth-btn-label">Continue with Google</span></button><button type="button" className="oauth-btn oauth-btn--discord" onClick={()=>notify('Discord sign-in is demo-only.')}><span className="oauth-icon-wrap oauth-icon-wrap--discord"><DiscordIcon /></span><span className="oauth-btn-label">Continue with Discord</span></button></div></form><p className="auth-switch">New to the arena? <button className="inline-link" onClick={()=>{setSignupStep(1);setModal('signup')}}>{t.createAccount}</button></p></>}
          {modal==='signup'&&<><h2 id="modal-title" className="modal-heading">{t.createAccount}</h2><p className="modal-sub">A few details, then you’re on the roster.</p><div className="stepper"><i className="active"/><i className={signupStep===2?'active':''}/></div><form className="form-fields" onSubmit={handleSignupStep}>{error&&<div className="form-error" role="alert">{error}</div>}
            {signupStep===1?<><div className="field"><label>{t.email}</label><input autoFocus type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/><small style={{color:email.includes('@')?(email.includes('taken')?'#ef9b88':'#b7cf62'):'#777',fontSize:9,display:'block',marginTop:5}}>{email.includes('@')?(email.includes('taken')?'This email is already in use.':'✓ Email available'):'Availability checked as you type'}</small></div><div className="field"><label>{t.password}</label><div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div><div className="strength">{[0,1,2].map((v)=><i key={v} className={v<passwordStrength?'on':''}/>)}</div><small style={{color:'#787b83',fontSize:9}}>Use 8+ characters with a mix of letters and numbers.</small></div><div className="field"><label>Confirm password</label><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Repeat password"/>{confirm&&<small style={{color:confirm===password?'#b7cf62':'#e09382',fontSize:9}}>{confirm===password?'Passwords match':'Passwords do not match'}</small>}</div><button className="btn btn-primary form-submit auth-cta-btn"><span>{t.continue}</span><AuthCtaArrow /></button></>:<><div className="field"><label>{t.username}</label><input autoFocus value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Your player name"/></div><div className="field-row"><div className="field"><label>{t.gameId}</label><input value={gameId} onChange={(e)=>setGameId(e.target.value)} placeholder="Player ID"/></div><div className="field"><label>{t.phone}</label><input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+880 1XXX"/></div></div><div className="field"><label>{t.server}</label><select value={server} onChange={(e)=>setServer(e.target.value)}>{['Asia','Europe','South America','Middle East','KR / JP'].map((s)=><option key={s}>{s}</option>)}</select></div>{new URLSearchParams(window.location.search).get('ref')&&<div className="form-error" style={{background:'rgba(212,232,42,.08)',color:'#c6d17e',borderColor:'rgba(212,232,42,.2)'}}>Referral code {new URLSearchParams(window.location.search).get('ref')} applied.</div>}<label className="checkline"><input type="checkbox" checked={terms} onChange={(e)=>setTerms(e.target.checked)}/>{t.terms}</label><div className="field-row"><button type="button" className="btn btn-ghost" onClick={()=>{setSignupStep(1);setError('')}}><ArrowLeft size={14}/> Back</button><button className="btn btn-primary auth-cta-btn"><span>{t.createAccount}</span><AuthCtaArrow /></button></div></>}</form><p className="auth-switch">Already on the roster? <button type="button" className="inline-link" onClick={()=>openAuth('signin')}>{t.signin}</button></p></>}
          {modal==='otp'&&<><h2 id="modal-title" className="modal-heading">{t.verify}</h2><p className="modal-sub">{t.otpHelp} <strong style={{color:'#e1e2dd'}}>{email.replace(/^(.).+(@.+)$/,'$1***$2')||'j***@battleasia.gg'}</strong></p><form className="form-fields" onSubmit={handleOtp}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="otp-row">{otp.map((digit,i)=><input key={i} aria-label={`Verification digit ${i+1}`} inputMode="numeric" maxLength={6} value={digit} onChange={(e)=>onOtpInput(i,e.target.value,e.target)} onKeyDown={(e)=>onOtpKey(e,i)}/>)}</div><button className="btn btn-primary form-submit">{t.verify} <ArrowRight size={14}/></button><div className="form-meta"><span style={{color:'#858991',fontSize:10}}>Demo code: <b style={{color:'#ddd'}}>123456</b></span><button type="button" disabled={cooldown>0} className="inline-link" onClick={()=>{setCooldown(60);notify('A new demo code has been sent.')}}>{cooldown>0?`Resend in ${cooldown}s`:t.resend}</button></div></form></>}
          {modal==='forgot'&&<><h2 id="modal-title" className="modal-heading">Reset your password</h2><p className="modal-sub">We’ll send a reset code to your email address.</p><form className="form-fields" onSubmit={handleForgot}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="field"><label>{t.email}</label><input autoFocus type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/></div><button className="btn btn-primary form-submit">{t.send} <ArrowRight size={14}/></button><button type="button" className="inline-link" onClick={()=>setModal('signin')}>Back to sign in</button></form></>}
          {modal==='reset'&&<><h2 id="modal-title" className="modal-heading">Choose a new password</h2><p className="modal-sub">Enter the code sent to {email.replace(/^(.).+(@.+)$/,'$1***$2')} and set a new password.</p><form className="form-fields" onSubmit={handleReset}>{error&&<div className="form-error" role="alert">{error}</div>}<div className="otp-row">{otp.map((digit,i)=><input key={i} aria-label={`Reset code digit ${i+1}`} inputMode="numeric" maxLength={6} value={digit} onChange={(e)=>onOtpInput(i,e.target.value,e.target)} onKeyDown={(e)=>onOtpKey(e,i)}/>)}</div><div className="field"><label>New password</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters"/></div><div className="field"><label>Confirm password</label><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Repeat new password"/></div><button className="btn btn-primary form-submit">Reset password</button><div className="form-meta"><span/><button type="button" disabled={cooldown>0} className="inline-link" onClick={()=>setCooldown(60)}>{cooldown>0?`Resend in ${cooldown}s`:t.resend}</button></div></form></>}
          <div className="trust-row">{trustItems.map(([icon,label])=><span key={label}>{icon==='shield'?<ShieldCheck size={12}/>:icon==='crosshair'?<Crosshair size={12}/>:<Zap size={12}/>} {label}</span>)}</div>
        </div>
      </section></div>}
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={App}/><Route component={NotFound}/></Switch></RoutedErrorBoundary>;
}
function Root() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default Root;