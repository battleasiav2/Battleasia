import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isApiError } from '../../lib/api';
import { openMatchesForGame } from '../../lib/dashboard';
import {
  coverForGame,
  fetchGames,
  fetchMatches,
  gameKey,
  isJoinable,
  webpSrcSet,
  type GameItem,
} from '../../lib/games';
import { useI18n } from '../../lib/i18n';
import { useHud } from '../../contexts/HudContext';
import { FALLBACK_SITE_SOCIALS, fetchSiteSocialLinks, findSocialHref } from '../../lib/siteSocials';
import { safeHref } from '../../lib/safeHref';

async function countOpenByGame(games: GameItem[]) {
  const out: Record<string, number> = {};
  await Promise.all(
    games.map(async (game) => {
      if (game.comingSoon) {
        out[game.id] = 0;
        out[game.name] = 0;
        return;
      }
      try {
        const matches = await fetchMatches(game.id);
        const open = matches.filter(isJoinable).length;
        out[game.id] = open;
        out[game.name] = open;
      } catch {
        out[game.id] = 0;
        out[game.name] = 0;
      }
    }),
  );
  return out;
}

export function PlayPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const [games, setGames] = useState<GameItem[] | null>(null);
  const [openByGame, setOpenByGame] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [watchLiveHref, setWatchLiveHref] = useState(
    findSocialHref(FALLBACK_SITE_SOCIALS, 'youtube', 'https://youtube.com/@battleasia')
  );

  useEffect(() => {
    return register({
      quickJoin: () => toast(t('play.pickFirst')),
      copyRoom: () => toast(t('play.roomSoon')),
      ready: () => toast(t('play.joinLobby')),
      leave: () => toast(t('play.notInMatch')),
      matchDetails: () => toast(t('play.openMatch')),
      openChat: () => toast(t('play.joinChat')),
      share: async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('play.copied'));
      },
      leaderboard: () => toast(t('play.results')),
    });
  }, [register, toast, t]);

  useEffect(() => {
    const fallback = findSocialHref(FALLBACK_SITE_SOCIALS, 'youtube', 'https://youtube.com/@battleasia');
    fetchSiteSocialLinks().then((links) => {
      setWatchLiveHref(findSocialHref(links, 'youtube', fallback));
    });
  }, []);

  useEffect(() => {
    let live = true;
    fetchGames()
      .then(async (list) => {
        if (!live) return;
        setGames(list);
        const counts = await countOpenByGame(list);
        if (live) setOpenByGame(counts);
      })
      .catch((err) => {
        if (!live) return;
        setGames([]);
        setError(isApiError(err) ? err.message : t('play.loadFail'));
      });
    return () => {
      live = false;
    };
  }, [t]);

  const liveCount = games?.filter((game) => !game.comingSoon).length ?? 0;

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('nav.play')}</p>
          <h1>{t('play.title')}</h1>
          <p className="play-lead">{t('play.lead')}</p>
        </div>
        <div className="play-head-actions">
          <a className="watch-live-btn" href={safeHref(watchLiveHref) || watchLiveHref} target="_blank" rel="noopener noreferrer">
            <span className="watch-live-pulse" aria-hidden />
            <span className="watch-live-ico" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.2 3.5-6.2 3.5Z"
                />
              </svg>
            </span>
            <span className="watch-live-label">{t('play.watchLive')}</span>
          </a>
          {games && games.length > 0 ? (
            <p className="play-count">
              <span className="play-count-dot" aria-hidden />
              <strong>{liveCount}</strong>
              <small>{t('play.liveTitles')}</small>
            </p>
          ) : null}
        </div>
      </header>
      {games === null ? (
        <div className="play-stage">
          <div className="play-grid play-grid-rail">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="play-card skeleton" key={i} />
            ))}
          </div>
        </div>
      ) : games.length === 0 ? (
        <div className="play-empty">
          <div className="play-empty-art" aria-hidden />
          <h2>{error || t('play.empty')}</h2>
          <p>{t('play.quietLead')}</p>
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
            {t('play.reload')}
          </button>
        </div>
      ) : (
        <div className="play-stage">
          <div className="play-grid play-grid-rail">
            {games.map((game) => {
              const open =
                openByGame[game.id] ?? openMatchesForGame(game.name, openByGame);
              return (
                <Link
                  key={game.id}
                  className={`play-card ${game.comingSoon ? 'is-soon' : ''}`}
                  to={game.comingSoon ? '#' : `/user/play/${game.id}`}
                  onClick={(e) => {
                    if (game.comingSoon) {
                      e.preventDefault();
                      toast(t('play.soon'));
                    }
                  }}
                >
                  <div className="play-card-art" data-game={gameKey(game)} style={{ aspectRatio: '16 / 10' }}>
                    <img
                      src={coverForGame(game)}
                      srcSet={webpSrcSet(coverForGame(game), 360, 720)}
                      sizes="(max-width: 1100px) 50vw, 22vw"
                      alt=""
                      width={640}
                      height={400}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.endsWith('.png')) {
                          img.src = img.src.replace(/\.png(?:\?.*)?$/, '.svg');
                          return;
                        }
                        img.style.display = 'none';
                        img.parentElement?.classList.add('is-fallback');
                      }}
                    />
                    <span className="play-card-veil" aria-hidden />
                    <span className="play-card-mark">{game.name.slice(0, 2).toUpperCase()}</span>
                    {game.comingSoon ? null : <span className="play-card-live">{t('play.liveBadge')}</span>}
                  </div>
                  <div className="play-card-meta">
                    <strong>{game.name}</strong>
                    <small>
                      {game.comingSoon
                        ? t('play.soon')
                        : `${open} ${open === 1 ? t('play.openMatchOne') : t('play.openMatches')}`}
                    </small>
                    {game.comingSoon ? null : <span className="play-card-go">{t('play.enter')}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
