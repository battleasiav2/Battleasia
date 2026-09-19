import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { RankBadge } from '../../components/RankBadge';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { readSessionUser } from '../../lib/auth';
import { fetchMatchResult, formatWhen, type MatchResult } from '../../lib/games';
import { fetchP1Flags } from '../../lib/p1';
import { createPost } from '../../lib/social';
import { useI18n } from '../../lib/i18n';
import { tierFromRank } from '../../lib/tier';

const WinBurst = lazy(() => import('../../components/WinBurst').then((m) => ({ default: m.WinBurst })));

export function MatchResultPage() {
  const { t } = useI18n();
  const { matchId = '' } = useParams();
  const { toast, register } = useHud();
  const [data, setData] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');
  const [canShare, setCanShare] = useState(false);
  const me = readSessionUser();

  useEffect(() => {
    fetchP1Flags().then((f) => setCanShare(f.igHighlights || f.igVictoryAutoPost));
  }, []);

  useEffect(() => {
    let live = true;
    fetchMatchResult(matchId)
      .then((row) => {
        if (live) setData(row);
      })
      .catch((err) => {
        if (!live) return;
        setError(isApiError(err) ? err.message : t('result.notPosted'));
      });
    return () => {
      live = false;
    };
  }, [matchId, t]);

  useEffect(() => {
    return register({
      quickJoin: () => toast(t('result.closed')),
      copyRoom: () => toast(t('match.roomSoon')),
      ready: () => toast(t('result.finished')),
      leave: () => toast(t('result.finished')),
      matchDetails: () => {
        window.location.assign(`/user/play/${matchId}/detail`);
      },
      openChat: () => toast(t('result.chatClosed')),
      share: async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('match.linkCopied'));
      },
      leaderboard: () => {
        document.getElementById('result-table')?.scrollIntoView({ block: 'start' });
      },
    });
  }, [matchId, register, t, toast]);

  if (error) {
    return (
      <main className="play-main">
        <div className="play-empty">
          <h2>{error}</h2>
          <Link className="btn btn-primary" to={`/user/play/${matchId}/detail`}>
            {t('match.lobby')}
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="play-main">
        <div className="match-row skeleton" />
      </main>
    );
  }

  const rows = [...(data.participants || [])].sort((a, b) => (a.placement || 99) - (b.placement || 99));
  const mine = rows.find((r) => r.username === me?.username || (me?.id && r.id === me.id));
  const prizeOf = (row: (typeof rows)[number]) =>
    (Number(row.winPrize) || 0) + (Number(row.bonus) || 0) + (Number(row.placePoint) || 0) + (Number(row.refund) || 0);
  const won = Boolean(
    mine && (mine.status === 'winner' || mine.placement === 1 || prizeOf(mine) > 0),
  );

  return (
    <main className="play-main">
      <Link className="play-back" to={`/user/play/${matchId}/detail`}>
        ← {t('result.back')}
      </Link>
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('result.eyebrow')}</p>
          <h1>{data.matchName}</h1>
          <p className="play-lead">
            {data.gameName} · {data.map} · {formatWhen(data.matchSchedule)}
          </p>
        </div>
        <p className="play-count">
          <strong>{mine?.placement ?? '—'}</strong>
          <small>{t('result.place')}</small>
        </p>
      </header>
      {won ? (
        <Suspense fallback={null}>
          <WinBurst on />
        </Suspense>
      ) : null}
      {canShare ? (
        <button
          className="btn btn-primary"
          type="button"
          onClick={async () => {
            const prize = mine ? prizeOf(mine) : 0;
            try {
              await createPost(`Won ${prize} BAC 🏆 from “${data.matchName}”. #victory`, {
                postType: 'match_result',
                entityId: matchId,
                gameTag: (data.gameName || '').toLowerCase().replace(/\s+/g, ''),
                title: `Won ${prize} BAC`,
              });
              toast(t('result.shared'));
            } catch (err) {
              toast(isApiError(err) ? err.message : t('result.shareFail'));
            }
          }}
        >
          {t('result.share')}
        </button>
      ) : null}
      <div className="play-stage">
      <div className="result-table" id="result-table">
        <div className="result-head">
          <span>#</span>
          <span>{t('result.player')}</span>
          <span>{t('result.kills')}</span>
          <span>{t('result.prize')}</span>
        </div>
        {rows.length === 0 ? (
          <div className="play-empty">
            <h2>{t('result.pending')}</h2>
            <p>{t('result.pendingLead')}</p>
          </div>
        ) : (
          rows.map((row) => (
            <div
              className={`result-row is-in ${row.status === 'winner' ? 'is-winner' : row.status === 'lose' ? 'is-lose' : ''}`}
              key={row.id}
              style={{ animationDelay: `${(row.placement || 9) * 40}ms` }}
            >
              <span>{row.placement ?? '—'}</span>
              <span>
                {row.username}
                {row.placement ? <RankBadge tier={tierFromRank(row.placement)} /> : null}
                <small className={`result-status is-${(row.status || 'lose').toLowerCase()}`}>
                  {' '}
                  {row.status === 'winner' ? t('result.winner') : row.status === 'lose' ? t('result.lose') : row.status}
                </small>
              </span>
              <span>{row.kills ?? 0}</span>
              <span>
                <CoinValue value={prizeOf(row)} />
              </span>
            </div>
          ))
        )}
      </div>
      </div>
    </main>
  );
}
