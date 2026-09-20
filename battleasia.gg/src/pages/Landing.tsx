import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CountUpCoin, CountUpNumber } from '../components/CountUp';
import { HeroVideo } from '../components/HeroVideo';
import { EMPTY_PULSE, fetchPublicDashboard, mapPulse, openMatchesForGame, type PulseStats } from '../lib/dashboard';
import { ASSETS } from '../lib/assets';
import { useI18n } from '../lib/i18n';
import { LocaleSelect } from '../components/LocaleSelect';
import { UserAvatar } from '../components/UserAvatar';
import { fetchMe, isSignedIn, readSessionUser, clearSignedIn } from '../lib/auth';
import { ThemeDock } from '../components/ThemeDock';
import { coverForGame, fetchGames, gameKey, webpSrcSet } from '../lib/games';

const SiteFooter = lazy(() => import('../components/SiteFooter').then((m) => ({ default: m.SiteFooter })));
const DeferredSupportChat = lazy(() =>
  import('../components/SupportChat').then((m) => ({ default: m.DeferredSupportChat })),
);
const SocialFab = lazy(() => import('../components/SocialFab').then((m) => ({ default: m.SocialFab })));
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

const FALLBACK_GAMES: LandingGame[] = [
  { slug: 'pubg', id: 'pubg', src: '/covers/pubg.webp', popular: true, soon: false, matchName: 'PUBG Mobile' },
  { slug: 'freefire', id: 'freefire', src: '/covers/freefire.webp', popular: false, soon: false, matchName: 'Free Fire' },
  { slug: 'cod', id: 'cod', src: '/covers/cod.webp', popular: false, soon: false, matchName: 'Call of Duty Mobile' },
  { slug: 'mlbb', id: 'mlbb', src: '/covers/mlbb.webp', popular: false, soon: false, matchName: 'Mobile Legends' },
  { slug: 'valorant', id: 'valorant', src: '/covers/valorant.webp', popular: false, soon: true, matchName: 'Valorant Mobile' },
];

const MODES = [
  { id: 'solo', src: '/covers/modes/solo.webp' },
  { id: 'duo', src: '/covers/modes/duo.webp' },
  { id: 'squad', src: '/covers/modes/squad.webp' },
  { id: 'tdm', src: '/covers/modes/tdm.webp' },
] as const;

const RULES = [
  { q: 'faq.fair.q', a: 'faq.fair.a' },
  { q: 'faq.ops.q', a: 'faq.ops.a' },
  { q: 'faq.room.q', a: 'faq.room.a' },
  { q: 'faq.prizes.q', a: 'faq.prizes.a' },
  { q: 'faq.pay.q', a: 'faq.pay.a' },
  { q: 'faq.withdraw.q', a: 'faq.withdraw.a' },
  { q: 'faq.referral.q', a: 'faq.referral.a' },
  { q: 'faq.account.q', a: 'faq.account.a' },
  { q: 'faq.support.q', a: 'faq.support.a' },
  { q: 'faq.age.q', a: 'faq.age.a' },
] as const;

function gameHref(id: string) {
  const play = `/user/play/${id}`;
  if (isSignedIn()) return play;
  return `/auth/sign-in?returnTo=${encodeURIComponent(play)}`;
}

function Spark({ series }: { series: number[] }) {
  const vals = series.length > 1 ? series : [0, series[0] || 0];
  const max = Math.max(1, ...vals);
  const d = vals
    .map((v, i) => {
      const x = (i / Math.max(1, vals.length - 1)) * 72;
      const y = 26 - (v / max) * 22;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="spark" viewBox="0 0 72 28" width="72" height="28" aria-hidden>
      <path d={d} fill="none" />
    </svg>
  );
}

export function Landing({ openChat }: { openChat?: boolean }) {
  const { t } = useI18n();
  const location = useLocation();
  const [params] = useSearchParams();
  const mock = params.get('mock') === '1';
  const [stats, setStats] = useState<PulseStats>(EMPTY_PULSE);
  const [hist, setHist] = useState<Array<{ j: number; m: number; o: number; w: number }>>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [faq, setFaq] = useState<string>(RULES[0].q);
  const hash = location.hash || '#home';
  const [me, setMe] = useState(readSessionUser());
  const [inArena, setInArena] = useState(isSignedIn());
  const [arenaGames, setArenaGames] = useState<LandingGame[]>(FALLBACK_GAMES);
  const arenaTo = inArena ? '/user/play' : '/auth/sign-up';

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
                src: coverForGame(hit) || fg.src,
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
    setHist((rows) =>
      [...rows, { j: stats.todayJoins, m: stats.matches, o: stats.ongoing, w: stats.winnings }].slice(-16),
    );
  }, [stats.todayJoins, stats.matches, stats.ongoing, stats.winnings]);

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <div className={`landing${mock ? ' is-mock' : ''}`}>
      <div className="landing-shell">
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
        <header className={`topbar${navOpen ? ' is-open' : ''}`}>
          <a className="brand" href="#home">
            <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>2.0</span>
            </div>
          </a>
          <button
            className="nav-burger"
            type="button"
            aria-expanded={navOpen}
            aria-label={navOpen ? t('hud.closeMenu') : t('hud.openMenu')}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
          </button>
          {inArena ? (
            <Link className="hud-user hud-user-pin" to="/user/account/profile" title={me?.username || t('nav.account')} aria-label={t('nav.account')}>
              <UserAvatar src={me?.avatar} name={me?.username} size={36} />
            </Link>
          ) : null}
          <nav className="nav-center" aria-label={t('nav.primary')} onClick={() => setNavOpen(false)}>
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
          <div className="top-actions" onPointerDown={(e) => e.stopPropagation()}>
            <ThemeDock />
            {inArena ? (
              <>
                <Link className="btn btn-ghost" to="/user/play">
                  {t('nav.play')}
                </Link>
                <Link className="hud-user" to="/user/account/profile" title={me?.username || t('nav.account')} aria-label={t('nav.account')}>
                  <UserAvatar src={me?.avatar} name={me?.username} size={36} />
                </Link>
              </>
            ) : (
              <Link className="btn btn-ghost" to="/auth/sign-in">
                {t('cta.signin')}
              </Link>
            )}
            <Link className="btn btn-primary" to={arenaTo}>
              {t('cta.signup')}
            </Link>
            <LocaleSelect />
          </div>
        </header>

        <section className="hero" id="home">
          <HeroVideo className="hero-media" priority />
          <div className="hero-grid">
            <div className="hero-copy">
              <h1>
                BATTLE ASIA <span>2.0</span>
              </h1>
              <div className="eyebrow">{t('hero.eyebrow')}</div>
              <div className="hero-ctas">
                <Link className="btn btn-primary" to={arenaTo}>
                  {t('cta.signup')}
                </Link>
                <a className="btn btn-ghost" href="/api/uploads/app/BattleAsia.apk">
                  {t('cta.apk')}
                </a>
              </div>
              <div className="live-row">
                <span className="live-pill">
                  <span className="live-dot" /> {t('hero.live')}
                </span>
                <span>
                  <CountUpNumber value={stats.playersOnline} /> {t('hero.players')}
                </span>
                <span>
                  <CountUpNumber value={stats.matchesToday} /> {t('hero.matches')}
                </span>
              </div>
            </div>
            <aside className="hero-side">
              <div className="hero-live">
                <small>{t('hero.arena')}</small>
                <strong>{t('hero.stadium')}</strong>
                <div className="hero-live-stats">
                  <div>
                    <small>{t('hero.seats')}</small>
                    <b>
                      <CountUpNumber value={stats.stadiumLive} />
                    </b>
                  </div>
                  <div>
                    <small>{t('hero.capacity')}</small>
                    <b>
                      <CountUpNumber value={stats.inSeats || stats.stadiumLive} />
                    </b>
                  </div>
                </div>
                <Link className="btn btn-primary" to={arenaTo}>
                  {t('cta.signup')}
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="pulse" aria-label={t('pulse.liveLabel')}>
          <h2>
            <span className="pulse-ico" /> {t('pulse.title')}
          </h2>
          <div className="pulse-stat">
            {t('pulse.joins')} <b><CountUpNumber value={stats.todayJoins} /></b>
            <Spark series={hist.map((h) => h.j)} />
          </div>
          <div className="pulse-stat">
            {t('pulse.matches')} <b><CountUpNumber value={stats.matches} /></b>
            <Spark series={hist.map((h) => h.m)} />
          </div>
          <div className="pulse-stat">
            {t('pulse.ongoing')} <b><span className="online-dot" /> <CountUpNumber value={stats.ongoing} /></b>
            <Spark series={hist.map((h) => h.o)} />
          </div>
          <div className="pulse-stat">
            {t('pulse.winnings')}
            <b>
              <CountUpCoin value={stats.winnings} size={22} />
            </b>
            <Spark series={hist.map((h) => h.w)} />
          </div>
        </section>

        <Suspense fallback={null}>
          <PulseLeaderboards profit={stats.topProfit} killers={stats.topKillers} />
          <MatchBattleRail
            title={t('pulse.highPrizeBattles')}
            matches={stats.highPrizeMatches}
            signedIn={inArena}
            variant="prize"
          />
          <MatchBattleRail
            title={t('pulse.liveBattles')}
            matches={stats.ongoingMatches}
            signedIn={inArena}
            variant="ongoing"
          />
        </Suspense>
        <section className="games" id="play">
          <div className="section-head">
            <h2>{t('games.title')}</h2>
            <p>{t('games.lead')}</p>
          </div>
          <div className="hex-row">
            {arenaGames.map((game) =>
              game.soon ? (
                <div key={game.slug} className="hex disabled">
                  <div className="hex-frame">
                    <img
                      src={game.src}
                      srcSet={webpSrcSet(game.src, 360, 720)}
                      sizes="(max-width: 900px) 140px, 200px"
                      width={280}
                      height={280}
                      alt={t(`games.${game.slug}.title`)}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3>{t(`games.${game.slug}.title`)}</h3>
                  <span>{t('games.soon')}</span>
                </div>
              ) : (
                <Link key={game.slug} className="hex" to={gameHref(game.id)}>
                  <div className="hex-frame">
                    <img
                      src={game.src}
                      srcSet={webpSrcSet(game.src, 360, 720)}
                      sizes="(max-width: 900px) 140px, 200px"
                      width={280}
                      height={280}
                      alt={t(`games.${game.slug}.title`)}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3>{t(`games.${game.slug}.title`)}</h3>
                  <span>
                    {`${openMatchesForGame(game.matchName, stats.openByGame)} ${t('play.openMatches')}`}
                  </span>
                  {game.popular ? <div className="popular">{t('games.popular')}</div> : null}
                </Link>
              ),
            )}
          </div>
        </section>

        <section className="about" id="about-us">
          <div className="about-copy">
            <p className="eyebrow">{t('about.eyebrow')}</p>
            <div className="about-brand">
              <img src={ASSETS.logo} width={56} height={56} alt="" />
              <div className="brand-name">
                BATTLE ASIA <span>2.0</span>
              </div>
            </div>
            <h2>{t('about.title')}</h2>
            <p className="about-lead">{t('about.body')}</p>
            <p className="about-more">{t('about.body2')}</p>
            <div className="about-ctas">
              <Link className="btn btn-primary" to={arenaTo}>
                {t('cta.signup')}
              </Link>
              <a className="btn btn-ghost" href="#play">
                {t('nav.play')}
              </a>
            </div>
          </div>
          <ul className="about-points">
            <li>{t('about.p1')}</li>
            <li>{t('about.p2')}</li>
            <li>{t('about.p3')}</li>
            <li>{t('about.p4')}</li>
            <li>{t('about.p5')}</li>
          </ul>
        </section>

        <section className="modes" id="how-to-play">
          <div className="section-head">
            <h2>{t('modes.title')}</h2>
            <p>{t('modes.lead')}</p>
          </div>
          <div className="mode-grid">
            {MODES.map((mode) => (
              <article key={mode.id} className="mode-card">
                <img
                  src={mode.src}
                  srcSet={webpSrcSet(mode.src, 480, 960)}
                  sizes="(max-width: 900px) 92vw, 22vw"
                  width={320}
                  height={140}
                  alt={t(`modes.${mode.id}.title`)}
                  loading="lazy"
                  decoding="async"
                />
                <h3>{t(`modes.${mode.id}.title`)}</h3>
                <p>{t(`modes.${mode.id}.copy`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rules" id="rules">
          <div className="rules-layout">
            <div className="rules-intro">
              <p className="eyebrow">{t('faq.eyebrow')}</p>
              <h2>{t('faq.title')}</h2>
              <p className="rules-lead">{t('faq.lead')}</p>
              <p className="rules-note">{t('faq.note')}</p>
              <ul className="rules-chips" aria-label={t('faq.chipsLabel')}>
                <li>{t('faq.chip1')}</li>
                <li>{t('faq.chip2')}</li>
                <li>{t('faq.chip3')}</li>
                <li>{t('faq.chip4')}</li>
              </ul>
            </div>
            <div className="faq">
              {RULES.map((item) => {
                const open = faq === item.q;
                return (
                  <details key={item.q} name="ba-faq" open={open}>
                    <summary
                      onClick={(e) => {
                        e.preventDefault();
                        setFaq(open ? '' : item.q);
                      }}
                    >
                      <span>{t(item.q)}</span>
                      <span className="faq-mark" aria-hidden>
                        {open ? '−' : '+'}
                      </span>
                    </summary>
                    <p>{t(item.a)}</p>
                  </details>
                );
              })}
            </div>
          </div>
          <Suspense fallback={null}>
            <SupportRelayCta />
          </Suspense>
        </section>

        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <SocialFab />
        <DeferredSupportChat forceOpen={openChat} />
      </Suspense>
    </div>
  );
}
