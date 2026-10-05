import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { fetchLeaderboard } from '../../lib/social';
import '../../styles/landing-5173.css';

type BoardRow = {
  id: string;
  rank: number;
  username: string;
  avatar?: string | null;
  totalScore: number;
  wins: number;
  kills: number;
  matches: number;
  level: number;
  badge: string;
};

function mapRow(row: Record<string, unknown>, i: number): BoardRow {
  return {
    id: String(row.id || row._id || i),
    rank: Number(row.rank ?? i + 1),
    username: String(row.username || 'Player'),
    avatar: (row.avatar as string | null | undefined) || null,
    totalScore: Number(row.totalScore ?? row.totalWinnings ?? 0),
    wins: Number(row.wins ?? row.totalWins ?? 0),
    kills: Number(row.totalKills ?? row.kills ?? 0),
    matches: Number(row.gamesPlayed ?? row.totalMatches ?? row.matches ?? 0),
    level: Number(row.level ?? 1),
    badge: String(row.badge || 'Rookie'),
  };
}

function BacMark({ size }: { size: number }) {
  return (
    <img
      src="/assets/bac-coin.webp"
      alt=""
      className="bac-coin-icon score-coin"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}

const PERIODS = ['all', 'weekly', 'monthly'] as const;

export function LeaderboardPage() {
  const { t } = useI18n();
  useHudPage();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('all');
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setRows(null);
    setError('');
    const load = () =>
      fetchLeaderboard(period)
        .then((list) => setRows(list.map(mapRow)))
        .catch((err) => {
          setError(isApiError(err) ? err.message : t('board.offline'));
          setRows([]);
        });
    load();
    const onAvatar = () => load();
    window.addEventListener('ba:avatar-updated', onAvatar);
    return () => window.removeEventListener('ba:avatar-updated', onAvatar);
  }, [period, t]);

  const ranked = useMemo(
    () =>
      (rows || []).map((row) => ({
        ...row,
        code: String(row.rank).padStart(2, '0'),
      })),
    [rows],
  );
  const podium = useMemo(() => {
    const first = ranked.find((r) => r.rank === 1) || ranked[0];
    const second = ranked.find((r) => r.rank === 2) || ranked[1];
    const third = ranked.find((r) => r.rank === 3) || ranked[2];
    return [second, first, third].filter((row): row is (typeof ranked)[number] => Boolean(row));
  }, [ranked]);
  const rest = ranked.slice(3);

  return (
    <main className="play-main board-page" id="result-table">
      <div className="ba5173">
        <div className="site-shell">
          <article className="leaderboard-feature reveal in-view" aria-labelledby="account-board-title">
            <div className="leader-feature-head">
              <div>
                <div className="section-kicker">Season board</div>
                <h1 id="account-board-title" className="leader-feature-title">
                  The ones to beat
                </h1>
              </div>
              <div className="leader-switch" role="tablist" aria-label={t('board.title')}>
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={period === p}
                    className={period === p ? 'active' : ''}
                    onClick={() => setPeriod(p)}
                  >
                    {t(`board.${p}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="leader-data-note">Live results from completed matches</div>

            {error ? <p className="form-error">{error}</p> : null}

            {rows === null ? (
              <div className="match-row skeleton" />
            ) : rows.length === 0 ? (
              <p className="section-copy">No ranked players yet.</p>
            ) : (
              <>
                <div className="podium-stage" aria-hidden="true">
                  <div className="podium-aurora" />
                  <div className="podium-beam" />
                </div>
                <div className="podium podium-is-live" aria-label={t('board.top3')}>
                  {podium.map((row) => {
                    const isChampion = row.code === '01';
                    return (
                      <Link
                        key={row.id}
                        className={`podium-place place-${row.code}`}
                        to={`/profile/${row.id}`}
                      >
                        <div className="podium-avatar-stack">
                          {isChampion ? (
                            <span className="podium-crown">
                              <Crown size={15} strokeWidth={2.2} />
                            </span>
                          ) : null}
                          {isChampion ? <span className="podium-orbit" /> : null}
                          <div className={`podium-medallion medallion-${row.code}`}>
                            <UserAvatar
                              className="podium-avatar"
                              src={row.avatar}
                              name={row.username}
                              size={isChampion ? 94 : 76}
                            />
                          </div>
                        </div>
                        <span className="podium-rank">{isChampion ? 'Champion' : `Rank ${row.rank}`}</span>
                        <strong className="podium-name">{row.username}</strong>
                        <span className="podium-score">
                          <BacMark size={14} />
                          {row.totalScore.toLocaleString()} <small>BAC</small>
                        </span>
                        <div className={`podium-block ${isChampion ? 'podium-block-live' : ''}`}>
                          {isChampion ? (
                            <>
                              <span className="podium-block-shimmer" />
                              <span className="podium-spark" style={{ '--spark-i': 0 } as CSSProperties} />
                              <span className="podium-spark" style={{ '--spark-i': 1 } as CSSProperties} />
                              <span className="podium-spark" style={{ '--spark-i': 2 } as CSSProperties} />
                              <span className="podium-spark" style={{ '--spark-i': 3 } as CSSProperties} />
                            </>
                          ) : null}
                          <span className="podium-block-num">{row.code}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {rest.length > 0 ? (
                  <div className="ranked-rest">
                    <div className="ranked-rest-label">
                      <span>The chasing pack</span>
                      <span>Rank / player / BAC</span>
                    </div>
                    {rest.map((row) => (
                      <Link key={row.id} className="compact-rank-row" to={`/profile/${row.id}`}>
                        <span className="compact-rank">{row.code}</span>
                        <UserAvatar className="compact-avatar player-avatar" src={row.avatar} name={row.username} size={28} />
                        <strong>{row.username}</strong>
                        <span className="compact-score">
                          <BacMark size={12} />
                          {row.totalScore.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
