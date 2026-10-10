import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { MatchJoinDialog } from '../../components/MatchJoinDialog';
import { RoomSeatsDialog } from '../../components/RoomSeatsDialog';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { readSessionUser, isPremiumUser } from '../../lib/auth';
import { isDemoMatchId } from '../../lib/demoMatches';
import { httpCopy } from '../../lib/form';
import {
  checkJoin,
  coverForMatch,
  estimateMatchWinningPool,
  mapCoverKey,
  fetchGames,
  fetchMatches,
  fetchRoom,
  formatWhen,
  gameKey,
  isJoinable,
  joinMatch,
  localCoverForGame,
  localMapCover,
  spotsLeft,
  webpSrcSet,
  type MatchItem,
} from '../../lib/games';
import { useI18n } from '../../lib/i18n';

type ShellCtx = {
  setBalance: (n: number) => void;
  balance?: number;
};

type MatchFilter = 'all' | 'joined' | 'open' | 'highPrize' | 'lowPrize' | 'free';

const FILTERS: MatchFilter[] = ['all', 'joined', 'open', 'highPrize', 'lowPrize', 'free'];

function pinJoinedFirst(list: MatchItem[]) {
  return [...list].sort((a, b) => Number(Boolean(b.isJoined)) - Number(Boolean(a.isJoined)));
}

function applyMatchFilter(list: MatchItem[], filter: MatchFilter) {
  const withPrize = (m: MatchItem) => estimateMatchWinningPool(m);

  if (filter === 'joined') {
    return pinJoinedFirst(list.filter((m) => m.isJoined));
  }
  if (filter === 'open') {
    return pinJoinedFirst(list.filter(isJoinable));
  }
  if (filter === 'free') {
    return pinJoinedFirst(list.filter((m) => m.matchType === 'free' || !m.entryFee));
  }
  if (filter === 'highPrize') {
    return pinJoinedFirst(
      [...list]
        .filter((m) => withPrize(m) > 0)
        .sort((a, b) => withPrize(b) - withPrize(a) || spotsLeft(b) - spotsLeft(a)),
    );
  }
  if (filter === 'lowPrize') {
    return pinJoinedFirst(
      [...list]
        .filter((m) => withPrize(m) > 0)
        .sort((a, b) => withPrize(a) - withPrize(b) || spotsLeft(b) - spotsLeft(a)),
    );
  }
  return pinJoinedFirst(list);
}

export function MatchListPage() {
  const { t } = useI18n();
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const { toast, register } = useHud();
  const outlet = useOutletContext<ShellCtx>();
  const setBalance = outlet?.setBalance;
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [confirmMatch, setConfirmMatch] = useState<MatchItem | null>(null);
  const [seatsMatch, setSeatsMatch] = useState<MatchItem | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [roomCreds, setRoomCreds] = useState<Record<string, { roomId: string; password: string }>>({});
  const roomFetchStarted = useRef<Set<string>>(new Set());
  const selectedRef = useRef('');
  const balance = Number(outlet?.balance ?? readSessionUser()?.balance) || 0;

  const filtered = useMemo(() => applyMatchFilter(matches || [], filter), [matches, filter]);

  const copyRoomField = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || value === '—') return;
      try {
        await httpCopy(value);
        toast(t('match.roomCopied'));
      } catch {
        toast(t('play.copied'));
      }
    },
    [t, toast],
  );

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    let live = true;
    fetchGames()
      .then((list) => {
        if (!live) return;
        const hit = list.find(
          (g) => g.id === gameId || gameKey(g) === gameId || g.name.toLowerCase().replace(/\s+/g, '') === gameId.toLowerCase(),
        );
        if (hit?.name) setGameName(hit.name);
      })
      .catch(() => {});
    fetchMatches(gameId)
      .then((list) => {
        if (!live) return;
        setMatches(list);
        setGameName((prev) => prev || list[0]?.gameName || '');
        const first = list.find((m) => m.isJoined) || list.find(isJoinable) || list[0];
        if (first) setSelected(first.id);
      })
      .catch((err) => {
        if (!live) return;
        setMatches([]);
        setError(httpCopy(err, t, t('match.loadFail')));
      });
    return () => {
      live = false;
    };
  }, [gameId, t]);

  useEffect(() => {
    if (!matches?.length) return;
    let live = true;
    for (const match of matches) {
      if (!match.isJoined || isDemoMatchId(match.id)) continue;
      if (roomFetchStarted.current.has(match.id)) continue;
      roomFetchStarted.current.add(match.id);
      void fetchRoom(match.id)
        .then((creds) => {
          if (!live) return;
          setRoomCreds((prev) => ({
            ...prev,
            [match.id]: { roomId: creds.roomId || '', password: creds.password || '' },
          }));
        })
        .catch(() => {
          if (!live) return;
          setRoomCreds((prev) => ({
            ...prev,
            [match.id]: prev[match.id] || { roomId: '', password: '' },
          }));
        });
    }
    return () => {
      live = false;
    };
  }, [matches]);

  useEffect(() => {
    if (!filtered.length) return;
    if (!filtered.some((m) => m.id === selected)) {
      setSelected(filtered[0].id);
    }
  }, [filtered, selected]);

  const requestJoin = useCallback(
    (match: MatchItem) => {
      if (joining) return;
      if (match.isJoined) {
        navigate(`/user/play/${match.id}/detail?from=${gameId}`);
        return;
      }
      const otherLive = (matches || []).find(
        (m) => m.isJoined && m.id !== match.id && isJoinable(m),
      );
      if (otherLive) {
        toast(t('match.oneAtATime').replace('{name}', otherLive.matchName || 'your current match'));
        return;
      }
      if (!isJoinable(match)) {
        if (spotsLeft(match) <= 0) toast(t('match.matchFullToast'));
        else navigate(`/user/play/${match.id}/detail?from=${gameId}`);
        return;
      }
      if (match.premiumOnly && !isPremiumUser(readSessionUser())) {
        toast(t('match.premiumOnlyToast'));
        return;
      }
      const fee = Number(match.entryFee) || 0;
      if (fee > balance) {
        toast(t('match.insufficientBalance'));
        return;
      }
      const pubgId = (readSessionUser()?.pubgId || '').trim();
      if (!pubgId && !isDemoMatchId(match.id)) {
        toast(t('match.pubgIdRequired'));
        return;
      }
      setJoinError(isDemoMatchId(match.id) ? t('match.demoDisabled') : '');
      setConfirmMatch(match);
    },
    [balance, gameId, joining, matches, navigate, t, toast],
  );

  const confirmJoin = useCallback(async () => {
    if (!confirmMatch || joining) return;
    const match = confirmMatch;
    const fee = Number(match.entryFee) || 0;
    setJoinError('');

    if (fee > balance) {
      const msg = t('match.insufficientBalance');
      setJoinError(msg);
      toast(msg);
      return;
    }

    if (isDemoMatchId(match.id)) {
      const msg = t('match.demoDisabled');
      setJoinError(msg);
      toast(msg);
      return;
    }

    setJoining(true);
    try {
      try {
        const check = await checkJoin(match.id);
        if (check && check.canJoin === false) {
          const msg = (check.issues || []).filter(Boolean).join(' · ') || t('match.joinFail');
          setJoinError(msg);
          toast(msg);
          return;
        }
      } catch (err) {
        /* join still attempts if check-join is missing; keep signal if check fails hard */
        if (isApiError(err) && err.status !== 404) {
          const msg = httpCopy(err, t, t('match.joinFail'));
          setJoinError(msg);
          toast(msg);
          return;
        }
      }
      const joinedRes = await joinMatch(match.id);
      if (joinedRes?.balance != null) setBalance?.(Number(joinedRes.balance) || 0);
      else if (fee > 0) setBalance?.(Math.max(balance - fee, 0));
      if (joinedRes?.roomId != null || joinedRes?.password != null) {
        setRoomCreds((prev) => ({
          ...prev,
          [match.id]: {
            roomId: joinedRes.roomId || '',
            password: joinedRes.password || '',
          },
        }));
        roomFetchStarted.current.add(match.id);
      }
      setMatches((prev) =>
        (prev || []).map((row) =>
          row.id === match.id
            ? {
                ...row,
                isJoined: true,
                participantsCount: (row.participantsCount || 0) + 1,
                roomId: joinedRes?.roomId,
                password: joinedRes?.password,
              }
            : row,
        ),
      );
      toast(t('match.joinedSuccessfully'));
      setConfirmMatch(null);
      setJoinError('');
      navigate(`/user/play/${match.id}/detail?from=${encodeURIComponent(gameId)}#match-room`);
    } catch (err) {
      const msg = httpCopy(err, t, t('match.joinFail'));
      setJoinError(msg);
      toast(msg);
    } finally {
      setJoining(false);
    }
  }, [balance, confirmMatch, gameId, joining, navigate, setBalance, t, toast]);

  useEffect(() => {
    return register({
      quickJoin: () => {
        const list = filtered;
        const pick =
          list.find((m) => m.id === selectedRef.current && isJoinable(m)) || list.find(isJoinable);
        if (!pick) {
          toast(t('match.noOpen'));
          return;
        }
        requestJoin(pick);
      },
      copyRoom: () => toast(t('match.roomSoon')),
      ready: () => toast(t('match.joinFirst')),
      leave: () => toast(t('match.leaveHint')),
      matchDetails: () => {
        const id = selectedRef.current;
        if (!id) toast(t('match.selectFirst'));
        else navigate(`/user/play/${id}/detail?from=${gameId}`);
      },
      openChat: () => toast(t('match.chatHint')),
      share: async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch {
          window.getSelection()?.selectAllChildren(document.body);
        }
        toast(t('match.linkCopied'));
      },
      leaderboard: () => {
        const done = (matches || []).find((m) => (m.status || '').toLowerCase() === 'complete');
        if (!done) toast(t('match.noComplete'));
        else navigate(`/user/play/${done.id}/result?from=${gameId}`);
      },
    });
  }, [filtered, gameId, matches, navigate, register, requestJoin, t, toast]);

  const filterLabel: Record<MatchFilter, string> = {
    all: t('match.filterAll'),
    joined: t('match.filterJoined'),
    open: t('match.filterOpen'),
    highPrize: t('match.filterHighPrize'),
    lowPrize: t('match.filterLowPrize'),
    free: t('match.filterFree'),
  };

  return (
    <main className="play-main play-main-tight">
      <Link className="play-back" to="/user/play">
        ← {t('match.backGames')}
      </Link>
      <header className="play-head play-head-compact">
        <div>
          <h1>{t('match.listTitle').replace('{game}', gameName || t('nav.play'))}</h1>
        </div>
      </header>
      {matches === null ? (
        <div className="play-stage">
          <div className="match-table">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="match-row skeleton" key={i} />
            ))}
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="play-empty">
          <div className="play-empty-art" aria-hidden />
          <h2>{error || t('match.none')}</h2>
          <p>{t('match.noneLead')}</p>
          <Link className="btn btn-primary" to="/user/play">
            {t('match.chooseGame')}
          </Link>
        </div>
      ) : (
        <div className="play-stage">
          <div className="match-filters" role="tablist" aria-label={t('match.filters')}>
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={`chip ${filter === key ? 'on' : ''}`}
                onClick={() => setFilter(key)}
              >
                {filterLabel[key]}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="play-empty play-empty-inline">
              <h2>{t('match.filterEmpty')}</h2>
              <p>{t('match.filterEmptyLead')}</p>
              <button type="button" className="btn btn-ghost" onClick={() => setFilter('all')}>
                {t('match.filterAll')}
              </button>
            </div>
          ) : (
            <div className="ba-room-grid" role="list">
              {filtered.map((match) => {
                const open = isJoinable(match);
                const full = spotsLeft(match) === 0;
                const used = match.participantsCount || 0;
                const cap = match.totalPlayer || 0;
                const prize = estimateMatchWinningPool(match);
                const cover = coverForMatch(match);
                const mapKey = mapCoverKey(match.map);
                const spotPct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
                const lockedRoom = t('match.roomLockedValue');
                const creds = roomCreds[match.id];
                const roomIdDisplay = match.isJoined
                  ? creds?.roomId?.trim() || match.roomId?.trim() || '—'
                  : lockedRoom;
                const passDisplay = match.isJoined
                  ? creds?.password?.trim() || match.password?.trim() || '—'
                  : lockedRoom;
                const action = (match.status || '').toLowerCase() === 'complete' ? (
                  <Link
                    className="btn btn-primary ba-room-action"
                    to={`/user/play/${match.id}/result?from=${gameId}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('match.view')}
                  </Link>
                ) : match.isJoined ? (
                  <Link
                    className="btn btn-primary ba-room-action"
                    to={`/user/play/${match.id}/detail?from=${encodeURIComponent(gameId)}#match-room`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('match.lobby')}
                  </Link>
                ) : open ? (
                  <button
                    type="button"
                    className="btn btn-primary ba-room-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestJoin(match);
                    }}
                  >
                    {t('match.join')}
                  </button>
                ) : (
                  <Link
                    className="btn btn-primary ba-room-action"
                    to={`/user/play/${match.id}/detail?from=${gameId}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('match.view')}
                  </Link>
                );
                return (
                  <article
                    key={match.id}
                    role="listitem"
                    tabIndex={0}
                    className={`ba-room${selected === match.id ? ' is-selected' : ''}${match.isJoined ? ' is-joined' : ''}`}
                    onClick={() => {
                      setSelected(match.id);
                      setSeatsMatch(match);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setSelected(match.id);
                        setSeatsMatch(match);
                      }
                    }}
                  >
                    <div
                      className="ba-room-image"
                      data-map={mapKey ? mapKey.toLowerCase() : undefined}
                      data-game={mapKey ? undefined : gameKey({ name: match.gameName, banner: match.banner })}
                    >
                      <img
                        src={cover}
                        srcSet={webpSrcSet(cover, 640, 960)}
                        sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        alt=""
                        width={640}
                        height={216}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const img = e.currentTarget;
                          const mapArt = localMapCover(match.map);
                          if (mapArt && img.getAttribute('src') !== mapArt && !img.src.endsWith(mapArt)) {
                            img.removeAttribute('srcset');
                            img.src = mapArt;
                            return;
                          }
                          const local = localCoverForGame({ name: match.gameName });
                          if (img.getAttribute('src') === local || img.src.endsWith(local)) {
                            img.style.display = 'none';
                            return;
                          }
                          img.removeAttribute('srcset');
                          img.src = local;
                        }}
                      />
                      <span className={`ba-room-status${match.isJoined ? ' is-joined' : ''}${full ? ' is-full' : ''}`}>
                        {match.isJoined ? t('match.joined') : full ? t('match.full') : t('match.openEntry')}
                      </span>
                      <span className="ba-room-map">{match.map || t('match.mapTbd')}</span>
                      <span className="ba-room-mode">{(match.teamType || 'Solo').toUpperCase()}</span>
                    </div>
                    <div className="ba-room-body">
                      <h3>{match.matchName}</h3>
                      <div className="ba-room-time">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {formatWhen(match.matchSchedule)}
                      </div>
                      <div className="ba-room-stats">
                        <div>
                          <label>{t('match.entry')}</label>
                          <div className="ba-room-stat">
                            {match.matchType === 'free' || !match.entryFee ? t('match.free') : <CoinValue value={match.entryFee} size={15} />}
                          </div>
                        </div>
                        <div>
                          <label>{t('match.prize')}</label>
                          <div className="ba-room-stat is-prize">
                            {prize > 0 ? <CoinValue value={prize} size={15} /> : '—'}
                          </div>
                        </div>
                        <div>
                          <label>{t('match.spots')}</label>
                          <div className="ba-room-stat">
                            {used}
                            <span className="ba-room-total">/ {cap}</span>
                          </div>
                          <span className="ba-room-bar" aria-hidden>
                            <i style={{ width: `${spotPct}%` }} />
                          </span>
                        </div>
                      </div>
                      <div className="ba-room-stats ba-room-stats-room">
                        <div>
                          <label>{t('match.roomIdLabel')}</label>
                          <div className="ba-room-stat-row">
                            <div
                              className={`ba-room-stat${match.isJoined ? '' : ' is-locked'}`}
                              title={match.isJoined ? roomIdDisplay : t('match.roomHidden')}
                            >
                              {roomIdDisplay}
                            </div>
                            {match.isJoined && roomIdDisplay !== '—' ? (
                              <button
                                type="button"
                                className="ba-room-copy"
                                aria-label={t('match.copyId')}
                                title={t('match.copyId')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void copyRoomField(roomIdDisplay);
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                                  <path
                                    fill="currentColor"
                                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                                  />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <div>
                          <label>{t('match.passLabel')}</label>
                          <div className="ba-room-stat-row">
                            <div
                              className={`ba-room-stat${match.isJoined ? '' : ' is-locked'}`}
                              title={match.isJoined ? passDisplay : t('match.roomHidden')}
                            >
                              {passDisplay}
                            </div>
                            {match.isJoined && passDisplay !== '—' ? (
                              <button
                                type="button"
                                className="ba-room-copy"
                                aria-label={t('match.copyPass')}
                                title={t('match.copyPass')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void copyRoomField(passDisplay);
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                                  <path
                                    fill="currentColor"
                                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                                  />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {action}
                      <div className="ba-room-foot">
                        <span>{match.gameName || t('nav.play')}</span>
                        <span>#{match.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
      <MatchJoinDialog
        match={confirmMatch}
        balance={balance}
        joining={joining}
        error={joinError}
        onClose={() => {
          if (joining) return;
          setConfirmMatch(null);
          setJoinError('');
        }}
        onConfirm={() => void confirmJoin()}
      />
      <RoomSeatsDialog match={seatsMatch} onClose={() => setSeatsMatch(null)} />
    </main>
  );
}
