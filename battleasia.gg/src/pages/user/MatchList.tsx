import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { MatchJoinDialog } from '../../components/MatchJoinDialog';
import { SpotBar } from '../../components/SpotBar';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { readSessionUser, isPremiumUser } from '../../lib/auth';
import { isDemoMatchId } from '../../lib/demoMatches';
import { httpCopy } from '../../lib/form';
import {
  checkJoin,
  coverForGame,
  estimateMatchWinningPool,
  fetchGames,
  fetchMatches,
  formatWhen,
  gameKey,
  isJoinable,
  joinMatch,
  spotsLeft,
  webpSrcSet,
  type MatchItem,
} from '../../lib/games';
import { useI18n } from '../../lib/i18n';

type ShellCtx = {
  setBalance: (n: number) => void;
  balance?: number;
};

type MatchFilter = 'all' | 'open' | 'highPrize' | 'lowPrize' | 'free';

const FILTERS: MatchFilter[] = ['all', 'open', 'highPrize', 'lowPrize', 'free'];

function applyMatchFilter(list: MatchItem[], filter: MatchFilter) {
  const withPrize = (m: MatchItem) => estimateMatchWinningPool(m);

  if (filter === 'open') {
    return list.filter(isJoinable);
  }
  if (filter === 'free') {
    return list.filter((m) => m.matchType === 'free' || !m.entryFee);
  }
  if (filter === 'highPrize') {
    return [...list]
      .filter((m) => withPrize(m) > 0)
      .sort((a, b) => withPrize(b) - withPrize(a) || spotsLeft(b) - spotsLeft(a));
  }
  if (filter === 'lowPrize') {
    return [...list]
      .filter((m) => withPrize(m) > 0)
      .sort((a, b) => withPrize(a) - withPrize(b) || spotsLeft(b) - spotsLeft(a));
  }
  return list;
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
  const [joining, setJoining] = useState(false);
  const selectedRef = useRef('');
  const balance = Number(outlet?.balance ?? readSessionUser()?.balance) || 0;

  const filtered = useMemo(() => applyMatchFilter(matches || [], filter), [matches, filter]);

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
        const first = list.find(isJoinable) || list[0];
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
      setConfirmMatch(match);
    },
    [balance, gameId, joining, navigate, t, toast],
  );

  const confirmJoin = useCallback(async () => {
    if (!confirmMatch || joining) return;
    const match = confirmMatch;
    const fee = Number(match.entryFee) || 0;

    if (fee > balance) {
      toast(t('match.insufficientBalance'));
      return;
    }

    if (isDemoMatchId(match.id)) {
      setConfirmMatch(null);
      toast(t('match.demoDisabled'));
      return;
    }

    setJoining(true);
    try {
      try {
        await checkJoin(match.id);
      } catch {
        /* join still attempts if check-join is missing */
      }
      const joinedRes = await joinMatch(match.id);
      if (joinedRes?.balance != null) setBalance?.(Number(joinedRes.balance) || 0);
      else if (fee > 0) setBalance?.(Math.max(balance - fee, 0));
      setMatches((prev) =>
        (prev || []).map((row) =>
          row.id === match.id
            ? {
                ...row,
                isJoined: true,
                participantsCount: (row.participantsCount || 0) + 1,
              }
            : row,
        ),
      );
      toast(t('match.joinedSuccessfully'));
      setConfirmMatch(null);
      navigate(`/user/play/${match.id}/detail?from=${encodeURIComponent(gameId)}#match-room`);
    } catch (err) {
      toast(isApiError(err) ? err.message : t('match.joinFail'));
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
            <div className="match-table" role="list">
              {filtered.map((match) => {
                const open = isJoinable(match);
                const full = spotsLeft(match) === 0;
                const used = match.participantsCount || 0;
                const cap = match.totalPlayer || 0;
                const prize = estimateMatchWinningPool(match);
                return (
                  <button
                    key={match.id}
                    type="button"
                    className={`match-row ${selected === match.id ? 'is-selected' : ''}`}
                    onClick={() => setSelected(match.id)}
                    onDoubleClick={() => navigate(`/user/play/${match.id}/detail?from=${gameId}`)}
                  >
                    <span className="match-banner" data-game={gameKey({ name: match.gameName, banner: match.banner })}>
                      <img
                        src={coverForGame({ name: match.gameName, banner: match.banner })}
                        srcSet={webpSrcSet(coverForGame({ name: match.gameName, banner: match.banner }), 220, 440)}
                        sizes="128px"
                        alt=""
                        width={220}
                        height={124}
                        onError={(e) => {
                          const img = e.currentTarget;
                          const local = coverForGame({ name: match.gameName });
                          if (img.src.includes(local)) {
                            img.style.display = 'none';
                            return;
                          }
                          img.srcset = '';
                          img.src = local;
                        }}
                      />
                    </span>
                    <span className="match-copy">
                      <strong>{match.matchName}</strong>
                      <small>
                        {match.teamType || 'Solo'} · {match.map || t('match.mapTbd')} · {formatWhen(match.matchSchedule)}
                      </small>
                    </span>
                    <span className="match-meta">
                      <span className="match-stat">
                        <small>{t('match.entry')}</small>
                        <strong>
                          {match.matchType === 'free' || !match.entryFee ? t('match.free') : <CoinValue value={match.entryFee} size={15} />}
                        </strong>
                      </span>
                      {prize > 0 ? (
                        <span className="match-stat">
                          <small>{t('match.prize')}</small>
                          <strong>
                            <CoinValue value={prize} size={15} />
                          </strong>
                        </span>
                      ) : null}
                      <span className="match-stat">
                        <small>{t('match.spots')}</small>
                        <strong>
                          {used}/{cap}
                        </strong>
                        <SpotBar used={used} total={cap} />
                      </span>
                      <span
                        className={`match-status ${
                          match.isJoined
                            ? 'is-joined'
                            : full
                              ? 'is-full'
                              : `is-${(match.status || 'active').toLowerCase()}`
                        }`}
                      >
                        {match.isJoined ? t('match.joined') : full ? t('match.full') : match.status}
                      </span>
                    </span>
                    {(match.status || '').toLowerCase() === 'complete' ? (
                      <Link
                        className="btn btn-primary"
                        to={`/user/play/${match.id}/result?from=${gameId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('match.view')}
                      </Link>
                    ) : match.isJoined ? (
                      <Link
                        className="btn btn-primary"
                        to={`/user/play/${match.id}/detail?from=${encodeURIComponent(gameId)}#match-room`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('match.lobby')}
                      </Link>
                    ) : open ? (
                      <span
                        className="btn btn-primary"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          requestJoin(match);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            requestJoin(match);
                          }
                        }}
                      >
                        {t('match.join')}
                      </span>
                    ) : (
                      <Link
                        className="btn btn-primary"
                        to={`/user/play/${match.id}/detail?from=${gameId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('match.view')}
                      </Link>
                    )}
                  </button>
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
        onClose={() => !joining && setConfirmMatch(null)}
        onConfirm={() => void confirmJoin()}
      />
    </main>
  );
}
