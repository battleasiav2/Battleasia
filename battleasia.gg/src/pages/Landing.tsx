import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CountUpNumber } from '../components/CountUp';
import { ZipHeroBg } from '../components/landing/ZipHeroBg';
import { EMPTY_PULSE, fetchPublicDashboard, mapPulse, openMatchesForGame, type PulseStats } from '../lib/dashboard';
import { useI18n } from '../lib/i18n';
import { ZipLocaleSelect } from '../components/landing/ZipLocaleSelect';
import { mediaUrl } from '../components/UserAvatar';
import { ZipMobileDrawer } from '../components/landing/ZipMobileDrawer';
import { ZipSocialFab } from '../components/landing/ZipSocialFab';
import { ZipAmount, ZipAvatar } from '../components/landing/ZipMedia';
import { clearSignedIn, fetchMe, isSignedIn, readSessionUser, logout, safeReturnTo } from '../lib/auth';
import { captureReferral } from '../lib/ref';
import { guestPlayHref, landingAuthHref, parseLandingAuthView, type LandingAuthView } from '../lib/landingAuth';
import { LandingAuthModals } from '../components/landing/LandingAuthModals';
import { ArenaSeatsRing } from '../components/landing/ArenaSeatsRing';
import { useLandingZipEffects } from '../components/landing/useLandingZipEffects';
import type { PulsePlayer } from '../lib/dashboard';
import { fetchGames, gameKey } from '../lib/games';
import { fetchAppDownload, formatApkSize, type AppDownloadInfo } from '../lib/app-download';

const FW_LOGO = '/assets/fw/logo-battleasia.png';
const FW_COIN = '/assets/fw/bac-coin.webp';

const SiteFooter = lazy(() => import('../components/SiteFooter').then((m) => ({ default: m.SiteFooter })));
const DeferredSupportChat = lazy(() =>
  import('../components/SupportChat').then((m) => ({ default: m.DeferredSupportChat })),
);
const MatchBattleRail = lazy(() => import('../components/MatchBattleRail').then((m) => ({ default: m.MatchBattleRail })));
const PulseLeaderboards = lazy(() =>
  import('../components/PulseLeaderboards').then((m) => ({ default: m.PulseLeaderboards })),
);
const SupportRelayCta = lazy(() => import('../components/SupportRelayCta').then((m) => ({ default: m.SupportRelayCta })));

type LandingGame = {
  slug: string;
  id: string;
  src: string;
  popular: boolean;
  soon: boolean;
  matchName: string;
};

const FW_GAME_COVERS: Record<string, string> = {
  pubg: '/assets/fw/game-pubg.jpg',
  freefire: '/assets/fw/game-freefire.jpg',
  cod: '/assets/fw/game-cod.jpg',
  mlbb: '/assets/fw/game-mlbb.jpg',
  valorant: '',
};

const FALLBACK_GAMES: LandingGame[] = [
  { slug: 'pubg', id: 'pubg', src: FW_GAME_COVERS.pubg, popular: true, soon: false, matchName: 'PUBG Mobile' },
  { slug: 'freefire', id: 'freefire', src: FW_GAME_COVERS.freefire, popular: false, soon: false, matchName: 'Free Fire' },
  { slug: 'cod', id: 'cod', src: FW_GAME_COVERS.cod, popular: false, soon: false, matchName: 'Call of Duty Mobile' },
  { slug: 'mlbb', id: 'mlbb', src: FW_GAME_COVERS.mlbb, popular: false, soon: false, matchName: 'Mobile Legends' },
  { slug: 'valorant', id: 'valorant', src: FW_GAME_COVERS.valorant, popular: false, soon: true, matchName: 'Valorant Mobile' },
];

const MODES = [
  { id: 'solo', src: '/covers/modes/solo.webp' },
  { id: 'duo', src: '/covers/modes/duo.webp' },
  { id: 'squad', src: '/covers/modes/squad.webp' },
  { id: 'tdm', src: '/covers/modes/tdm.webp' },
] as const;

type FaqTopic = 'all' | 'payments' | 'fairplay' | 'rooms' | 'account';

const RULES: { q: string; a: string; topic: FaqTopic }[] = [
  { q: 'faq.fair.q', a: 'faq.fair.a', topic: 'fairplay' },
  { q: 'faq.ops.q', a: 'faq.ops.a', topic: 'rooms' },
  { q: 'faq.room.q', a: 'faq.room.a', topic: 'rooms' },
  { q: 'faq.prizes.q', a: 'faq.prizes.a', topic: 'payments' },
  { q: 'faq.pay.q', a: 'faq.pay.a', topic: 'payments' },
  { q: 'faq.withdraw.q', a: 'faq.withdraw.a', topic: 'payments' },
  { q: 'faq.referral.q', a: 'faq.referral.a', topic: 'account' },
  { q: 'faq.account.q', a: 'faq.account.a', topic: 'account' },
  { q: 'faq.support.q', a: 'faq.support.a', topic: 'account' },
  { q: 'faq.age.q', a: 'faq.age.a', topic: 'account' },
];

const CHAMPION_FALLBACK: PulsePlayer = {
  userId: '',
  username: 'ShadowNova',
  avatar: null,
  totalWinnings: 0,
  totalKills: 0,
  winRate: null,
};

function gameHref(id: string) {
  const play = `/user/play/${id}`;
  if (isSignedIn()) return play;
  return guestPlayHref(play);
}

export function Landing({ openChat }: { openChat?: boolean }) {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mock = params.get('mock') === '1';
  const [stats, setStats] = useState<PulseStats>(EMPTY_PULSE);
  const [navOpen, setNavOpen] = useState(false);
  const [faq, setFaq] = useState<string>(RULES[0].q);
  const [faqTopic, setFaqTopic] = useState<FaqTopic>('all');
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingZipEffects(rootRef);
  const hash = location.hash || '#home';
  const [me, setMe] = useState(readSessionUser());
  const [inArena, setInArena] = useState(isSignedIn());
  const [arenaGames, setArenaGames] = useState<LandingGame[]>(FALLBACK_GAMES);
  const [apk, setApk] = useState<AppDownloadInfo | null>(null);
  const arenaTo = inArena ? '/user/play' : landingAuthHref('signup', { returnTo: '/user/play' }, location.pathname);
  const authView = parseLandingAuthView(params.get('auth'));
  const authReturnTo = safeReturnTo(params.get('returnTo'));
  const authEmail = (params.get('email') || '').trim();
  const authOauth = params.get('oauth');
  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    captureReferral();
  }, []);

  const clearAuthModal = useCallback(() => {
    const q = new URLSearchParams(params);
    q.delete('auth');
    q.delete('email');
    q.delete('oauth');
    q.delete('returnTo');
    const search = q.toString();
    navigate({ pathname: location.pathname, hash: location.hash, search: search ? `?${search}` : '' }, { replace: true });
  }, [navigate, params, location.pathname, location.hash]);

  const setAuthModal = useCallback(
    (view: LandingAuthView, patch?: { email?: string; returnTo?: string }) => {
      const q = new URLSearchParams(params);
      q.set('auth', view);
      if (patch?.email) q.set('email', patch.email);
      else if (view !== 'reset' && view !== 'otp') q.delete('email');
      if (patch?.returnTo) q.set('returnTo', safeReturnTo(patch.returnTo));
      q.delete('oauth');
      navigate({ pathname: location.pathname, hash: location.hash, search: `?${q.toString()}` }, { replace: true });
    },
    [navigate, params, location.pathname, location.hash],
  );

  const seatCap = stats.inSeats || 1200;
  const seatLive = stats.stadiumLive || stats.playersOnline || 0;
  const champion = stats.topProfit[0] ?? CHAMPION_FALLBACK;
  const faqItems = useMemo(
    () => (faqTopic === 'all' ? RULES : RULES.filter((r) => r.topic === faqTopic)),
    [faqTopic],
  );

  const onAuthSignedIn = useCallback(
    (to: string) => {
      setMe(readSessionUser());
      setInArena(true);
      void fetchMe()
        .then((u) => setMe(u))
        .catch(() => {});
      navigate(to, { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    let live = true;
    fetchAppDownload().then((info) => {
      if (live) setApk(info);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [hash]);

  useEffect(() => {
    let live = true;
    const load = () => {
      fetchGames()
        .then((list) => {
          if (!live || !list.length) return;
          setArenaGames(
            FALLBACK_GAMES.map((fg) => {
              const hit = list.find((g) => gameKey(g) === fg.slug);
              if (!hit) return fg;
              return {
                ...fg,
                id: hit.id,
                soon: Boolean(hit.comingSoon),
                matchName: hit.name || fg.matchName,
                src: FW_GAME_COVERS[fg.slug] || fg.src,
              };
            }),
          );
        })
        .catch(() => {
          /* keep slug fallbacks — resolveGameId still maps them on Play */
        });
    };
    const id = window.setTimeout(load, 800);
    return () => {
      live = false;
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!inArena) return;
    fetchMe()
      .then((user) => {
        setMe(user);
        setInArena(true);
      })
      .catch(() => {
        clearSignedIn();
        setMe(null);
        setInArena(false);
      });
  }, [inArena]);

  useEffect(() => {
    let alive = true;
    const apply = (next: PulseStats) => {
      if (alive) setStats(next);
    };
    const refresh = () => fetchPublicDashboard().then(apply);
    refresh();
    const poll = window.setInterval(refresh, 45000);
    const onAvatar = (ev: Event) => {
      const avatar = (ev as CustomEvent<{ avatar?: string }>).detail?.avatar;
      if (avatar) setMe((prev) => (prev ? { ...prev, avatar } : prev));
      refresh();
    };
    window.addEventListener('ba:avatar-updated', onAvatar);
    const bootSock = window.setTimeout(() => {
      void import('../lib/socket').then(({ getAuthedSocket }) =>
        getAuthedSocket().then((sock) => {
          sock?.on('dashboard-stats-updated', (raw: unknown) => apply(mapPulse(raw)));
          sock?.on('match-created', refresh);
          sock?.on('match-updated', refresh);
        }),
      );
    }, 4000);
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearTimeout(bootSock);
      window.removeEventListener('ba:avatar-updated', onAvatar);
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.landing-fw .scroll-progress');
    if (!bar) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = `${pct}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={rootRef} className={`landing-fw grain${mock ? ' is-mock' : ''}`}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />
        {mock ? (
          <div className="mock-overlay" aria-hidden>
            <img src="/assets/hero/hero-poster.webp" alt="" width={1600} height={900} loading="lazy" decoding="async" />
          </div>
        ) : null}
        {mock ? (
          <label className="mock-bar">
            QA mock
            <input
              type="range"
              min={10}
              max={80}
              defaultValue={40}
              onChange={(e) => {
                document.documentElement.style.setProperty('--ba-mock-opacity', `${Number(e.target.value) / 100}`);
              }}
            />
          </label>
        ) : null}
        <header className="site-header">
          <div className="header-inner">
          <a className="logo" href="#home">
            <img src={FW_LOGO} width={88} height={88} alt="BattleAsia" className="logo-img" />
            <span className="logo-text">{t('site.name')}</span>
          </a>
          <nav className="nav-desktop" aria-label={t('nav.primary')} onClick={() => setNavOpen(false)}>
            <a className={hash === '#home' || hash === '' ? 'active' : ''} href="#home">
              {t('nav.home')}
            </a>
            <a className={hash === '#about-us' ? 'active' : ''} href="#about-us">
              {t('nav.about')}
            </a>
            <a className={hash === '#play' ? 'active' : ''} href="#play">
              {t('nav.play')}
            </a>
            <a className={hash === '#rules' ? 'active' : ''} href="#rules">
              {t('nav.rules')}
            </a>
          </nav>
          <div className="header-actions" onPointerDown={(e) => e.stopPropagation()}>
            <div className="settings-row">
              <ZipLocaleSelect />
            </div>
            {inArena ? (
              <div className="user-btns">
                <div className="user-chip">
                  <ZipAvatar src={me?.avatar} size={32} />
                  <span className="user-name">{me?.username || t('nav.account')}</span>
                </div>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    void logout().then(() => {
                      setMe(null);
                      setInArena(false);
                    });
                  }}
                >
                  {t('cta.signout')}
                </button>
                <Link className="btn btn-primary" to="/user/play">
                  {t('cta.enterArena')}
                </Link>
              </div>
            ) : (
              <div className="guest-btns">
                <Link className="btn btn-ghost" to={landingAuthHref('signin', {}, location.pathname)}>
                  {t('cta.signin')}
                </Link>
                <Link className="btn btn-primary" to={arenaTo}>
                  {t('cta.signupJoin')}
                </Link>
              </div>
            )}
            <button
              className="burger"
              type="button"
              aria-expanded={navOpen}
              aria-label={navOpen ? t('hud.closeMenu') : t('hud.openMenu')}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
          </div>
        </header>
        <ZipMobileDrawer
          open={navOpen}
          onClose={closeNav}
          logo={FW_LOGO}
          siteName={t('site.name')}
          links={[
            { href: '#home', label: t('nav.home') },
            { href: '#about-us', label: t('nav.about') },
            { href: '#play', label: t('nav.play') },
            { href: '#rules', label: t('nav.rules') },
          ]}
          inArena={inArena}
          arenaTo={arenaTo}
          signInTo={landingAuthHref('signin', {}, location.pathname)}
          apk={apk}
          onSignOut={() => {
            void logout().then(() => {
              setMe(null);
              setInArena(false);
            });
          }}
        />

        <main>
        <section className="hero" id="home">
          <ZipHeroBg />
          <div className="hero-video-shine" aria-hidden="true" />
          <div className="hero-mesh" aria-hidden="true" />
          <img
            className="hero-float hero-float-1"
            src="/assets/fw/game-pubg.jpg"
            alt=""
            width={280}
            height={175}
            loading="lazy"
            decoding="async"
          />
          <img
            className="hero-float hero-float-2"
            src="/assets/fw/game-cod.jpg"
            alt=""
            width={240}
            height={150}
            loading="lazy"
            decoding="async"
          />
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="eyebrow hero-seq">
                <img src={FW_COIN} alt="" className="bac-coin bac-coin--xs" width={18} height={18} />
                <span>{t('hero.eyebrow')}</span>
              </span>
              <h1 className="hero-title" aria-label="Battle Asia">
                <span className="word"><span className="word-inner">Battle</span></span>
                <span className="word"><span className="word-inner">Asia</span></span>
              </h1>
              <p className="lead hero-seq">{t('hero.lead')}</p>
              <div className="hero-cta hero-seq">
                <Link className="btn btn-primary btn-magnetic" to={arenaTo}>
                  {t('cta.signupJoin')}
                </Link>
                {apk && !apk.enabled ? (
                  <span className="btn btn-ghost" aria-disabled="true">
                    {t('cta.apkOff')}
                  </span>
                ) : (
                  <a
                    className="btn btn-ghost"
                    href={apk?.downloadUrl || '/api/uploads/app/BattleAsia.apk'}
                    download={apk?.fileName || 'BattleAsia.apk'}
                  >
                    {apk?.version
                      ? t('cta.apkVer').replace('{0}', apk.version)
                      : t('cta.apk')}
                    {apk?.fileSize ? (
                      <span className="apk-size"> · {formatApkSize(apk.fileSize)}</span>
                    ) : null}
                  </a>
                )}
              </div>
              <div className="live-row hero-seq">
                <span className="live-pill">{t('hero.live')}</span>
                <div className="stat-pill">
                  <strong>
                    <CountUpNumber value={stats.playersOnline} />
                  </strong>
                  <span>{t('hero.players')}</span>
                </div>
                <div className="stat-pill">
                  <strong>
                    <CountUpNumber value={stats.matchesToday} />
                  </strong>
                  <span>{t('hero.matches')}</span>
                </div>
              </div>
            </div>
            <aside className="hero-side hero-seq">
              <div className="arena-card glass card">
                <h3>{t('hero.arenaSeats')}</h3>
                <div className="ring-wrap">
                  <ArenaSeatsRing live={seatLive} cap={seatCap} />
                  <div>
                    <strong id="arena-count" className="arena-stat">
                      <CountUpNumber value={seatLive} /> / <CountUpNumber value={seatCap} />
                    </strong>
                    <p className="text-muted text-muted--sm">{t('hero.arenaSeats')}</p>
                  </div>
                </div>
                <Link className="btn btn-primary btn-block" to={arenaTo}>
                  {t('hero.signUpFree')}
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="section section--alt" id="pulse" aria-labelledby="pulse-title">
          <div className="container">
            <div className="section-head reveal-group reveal-group-direct">
              <div className="pulse-title-row reveal">
                <span className="pulse-live-dot" aria-hidden="true" />
                <h2 id="pulse-title">{t('pulse.title')}</h2>
              </div>
              <p className="lead reveal">{t('pulse.lead')}</p>
            </div>
            <div className="kpi-grid reveal-group reveal-group-direct">
              <div className="kpi-tile card reveal">
                <div className="label">{t('pulse.joins')}</div>
                <div className="value">
                  <CountUpNumber value={stats.todayJoins} />
                </div>
              </div>
              <div className="kpi-tile card reveal">
                <div className="label">{t('pulse.matches')}</div>
                <div className="value">
                  <CountUpNumber value={stats.matches} />
                </div>
              </div>
              <div className="kpi-tile card reveal">
                <div className="label">{t('pulse.ongoing')}</div>
                <div className="value">
                  <CountUpNumber value={stats.ongoing} />
                  <span className="dot-live" aria-hidden />
                </div>
              </div>
              <div className="kpi-tile card reveal">
                <div className="label">{t('pulse.winnings')}</div>
                <div className="value">
                  <ZipAmount value={stats.winnings} size="md" />
                </div>
              </div>
            </div>
            <Suspense fallback={null}>
              <PulseLeaderboards profit={stats.topProfit} killers={stats.topKillers} />
            </Suspense>
          </div>
        </section>

        <section className="section" id="champion" aria-labelledby="champion-title">
          <div className="container">
            <article className="champion-card card glass reveal">
              <div className="champion-visual">
                <img
                  className="champion-photo"
                  src={mediaUrl(champion.avatar) || '/assets/fw/players/player-shadownova.jpg'}
                  alt=""
                  width={320}
                  height={320}
                  loading="lazy"
                  decoding="async"
                />
                <img src={FW_COIN} alt="" className="champion-coin" width={56} height={56} />
              </div>
              <div className="champion-copy">
                <span className="eyebrow">{t('champion.eyebrow')}</span>
                <h2 id="champion-title">{t('champion.title')}</h2>
                <p className="champion-name">{champion.username}</p>
                <blockquote className="text-muted">{t('champion.quote')}</blockquote>
                <dl className="champion-stats">
                  <div>
                    <dt>{t('champion.mainGame')}</dt>
                    <dd className="champion-game">{t('champion.gameDefault')}</dd>
                  </div>
                  <div>
                    <dt>{t('champion.wins')}</dt>
                    <dd className="champion-wins">{champion.totalKills || '—'}</dd>
                  </div>
                  <div>
                    <dt>{t('champion.payout')}</dt>
                    <dd className="champion-payout">
                      <ZipAmount value={champion.totalWinnings} />
                    </dd>
                  </div>
                </dl>
                <Link className="btn btn-primary" to={arenaTo}>
                  {t('cta.signupJoin')}
                </Link>
              </div>
            </article>
          </div>
        </section>

        <Suspense fallback={null}>
          <MatchBattleRail
            prizeMatches={stats.highPrizeMatches}
            liveMatches={stats.ongoingMatches}
            signedIn={inArena}
          />
        </Suspense>
        <section id="play" className="section section--alt">
          <div className="container">
            <div className="section-head reveal-group reveal-group-direct">
              <h2 className="reveal">{t('games.title')}</h2>
              <p className="lead reveal">{t('games.lead')}</p>
            </div>
            <div className="games-grid reveal-group reveal-group-direct">
              {arenaGames.map((game) => {
                const open = openMatchesForGame(game.matchName, stats.openByGame);
                const badge = game.popular ? (
                  <span className="badge">{t('games.popular')}</span>
                ) : game.soon ? (
                  <span className="badge badge-soon">{t('games.soon')}</span>
                ) : null;
                const overlay = (
                  <div className="game-overlay">
                    <h3>{t(`games.${game.slug}.title`)}</h3>
                    <p>{game.soon ? t('games.soon') : `${open} ${t('play.openMatches')}`}</p>
                  </div>
                );
                const img = game.src ? (
                  <img src={game.src} width={400} height={275} alt="" loading="lazy" decoding="async" />
                ) : (
                  <div className="game-placeholder" />
                );
                if (game.soon) {
                  return (
                    <article key={game.slug} className="game-tile reveal is-disabled" aria-disabled>
                      {badge}
                      {img}
                      {overlay}
                    </article>
                  );
                }
                return (
                  <Link key={game.slug} className="game-tile reveal" to={gameHref(game.id)}>
                    {badge}
                    {img}
                    {overlay}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about-us" className="section">
          <div className="container about-grid">
            <div className="reveal">
              <span className="eyebrow">{t('about.eyebrow')}</span>
              <img src={FW_LOGO} alt="" className="logo-img logo-img--lg mb-md" width={160} height={160} />
              <h2>{t('about.title')}</h2>
              <p className="lead">{t('about.body')}</p>
              <p className="text-muted mb-md">{t('about.body2')}</p>
              <div className="btn-row">
                <Link className="btn btn-primary" to={arenaTo}>
                  {t('cta.signupJoin')}
                </Link>
                <a href="#play" className="btn btn-ghost">
                  {t('nav.play')}
                </a>
              </div>
            </div>
            <div className="about-bullets reveal-group reveal-group-direct">
              {[t('about.p1'), t('about.p2'), t('about.p3'), t('about.p4'), t('about.p5')].map((line) => (
                <div key={line} className="about-bullet reveal">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-to-play" className="section">
          <div className="container">
            <div className="section-head reveal-group reveal-group-direct">
              <h2 className="reveal">{t('modes.title')}</h2>
              <p className="lead reveal">{t('modes.lead')}</p>
            </div>
            <div className="modes-grid reveal-group reveal-group-direct">
              {MODES.map((mode, i) => (
                <article key={mode.id} className="mode-card card reveal">
                  <div className="mode-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className={`mode-img mode-img--${i + 1}`} role="img" aria-label={t(`modes.${mode.id}.title`)} />
                  <div className="mode-body">
                    <h3>{t(`modes.${mode.id}.title`)}</h3>
                    <p>{t(`modes.${mode.id}.copy`)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="rules" className="section section--alt">
          <div className="container">
            <div className="section-head reveal-group reveal-group-direct">
              <span className="eyebrow reveal">{t('faq.eyebrow')}</span>
              <h2 className="reveal">{t('faq.title')}</h2>
              <p className="lead reveal">{t('faq.lead')}</p>
            </div>
            <div className="faq-stack reveal-group">
              <p className="reveal text-muted mb-md">{t('faq.note')}</p>
              <div className="faq-chips reveal">
                {(
                  [
                    ['all', 'faq.topicAll'],
                    ['payments', 'faq.topicPayments'],
                    ['fairplay', 'faq.topicFair'],
                    ['rooms', 'faq.topicRooms'],
                    ['account', 'faq.topicAccount'],
                  ] as const
                ).map(([id, key]) => (
                  <button
                    key={id}
                    type="button"
                    className={`faq-chip${faqTopic === id ? ' is-active' : ''}`}
                    onClick={() => setFaqTopic(id)}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
              <div className="faq-list reveal">
                {faqItems.map((item) => {
                  const open = faq === item.q;
                  return (
                    <div key={item.q} className={`faq-item${open ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="faq-q"
                        aria-expanded={open}
                        onClick={() => setFaq(open ? '' : item.q)}
                      >
                        <span>{t(item.q)}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <div className="faq-a">
                        <div className="faq-a-inner">{t(item.a)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Suspense fallback={null}>
                <SupportRelayCta />
              </Suspense>
            </div>
          </div>
        </section>
        </main>

        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      <ZipSocialFab />
      <Suspense fallback={null}>
        <DeferredSupportChat forceOpen={openChat} />
      </Suspense>
      <LandingAuthModals
        view={authView}
        returnTo={authReturnTo}
        email={authEmail}
        oauth={authOauth}
        onClose={clearAuthModal}
        onViewChange={setAuthModal}
        onSignedIn={onAuthSignedIn}
      />
    </div>
  );
}
