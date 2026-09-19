import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { UserAvatar } from '../../components/UserAvatar';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { fetchLeaderboard } from '../../lib/social';

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

function CrownIcon() {
  return (
    <svg className="board-crown" width="28" height="22" viewBox="0 0 28 22" aria-hidden>
      <path
        d="M3 18.5h22l-1.2-9.2-5.3 4.1L14 3.5l-4.5 9.9-5.3-4.1L3 18.5Z"
        fill="url(#ba-crown)"
        stroke="#9dff4a"
        strokeWidth="1.2"
      />
      <defs>
        <linearGradient id="ba-crown" x1="3" y1="3" x2="25" y2="20">
          <stop stopColor="#c8ff6a" />
          <stop offset="1" stopColor="#7cff2a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LeaderboardPage() {
  const { t } = useI18n();
  useHudPage();
  const [period, setPeriod] = useState('all');
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

  const top3 = useMemo(() => (rows || []).slice(0, 3), [rows]);
  const rest = useMemo(() => (rows || []).slice(3), [rows]);
  const podiumOrder = useMemo(() => {
    const first = top3.find((r) => r.rank === 1) || top3[0];
    const second = top3.find((r) => r.rank === 2) || top3[1];
    const third = top3.find((r) => r.rank === 3) || top3[2];
    return [
      { place: 2 as const, row: second },
      { place: 1 as const, row: first },
      { place: 3 as const, row: third },
    ].filter((x) => x.row);
  }, [top3]);

  return (
    <main className="play-main board-page" id="result-table">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('board.eyebrow')}</p>
          <h1>{t('board.title')}</h1>
          <p className="play-lead">{t('board.emptyLead')}</p>
        </div>
        <p className="play-count">
          <strong>{rows?.length ?? '—'}</strong>
          <small>{t('board.count')}</small>
        </p>
      </header>

      <div className="money-tabs">
        {(['all', 'weekly', 'monthly'] as const).map((p) => (
          <button key={p} type="button" className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
            {t(`board.${p}`)}
          </button>
        ))}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {rows === null ? (
        <div className="match-row skeleton" />
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{t('board.empty')}</h2>
          <p>{t('board.emptyLead')}</p>
          <Link className="btn btn-primary" to="/user/play">
            {t('nav.play')}
          </Link>
        </div>
      ) : (
        <>
          {podiumOrder.length > 0 ? (
            <div className="board-podium" aria-label={t('board.top3')}>
              {podiumOrder.map(({ place, row }) => (
                <Link
                  key={row!.id}
                  className={`board-podium-card is-${place}`}
                  to={`/profile/${row!.id}`}
                >
                  <div className="board-podium-avatar-wrap">
                    {place === 1 ? <CrownIcon /> : null}
                    <UserAvatar className="board-podium-avatar" src={row!.avatar} name={row!.username} size={place === 1 ? 88 : 72} />
                    <span className="board-podium-chip">#{place}</span>
                  </div>
                  <strong className="board-podium-name">{row!.username}</strong>
                  <span className="board-podium-score">
                    <CoinValue value={row!.totalScore} size={18} />
                  </span>
                  <small className="board-podium-label">{t('board.points')}</small>
                  <div className="board-podium-block" aria-hidden>
                    <span>{place}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {rest.length > 0 ? (
            <div className="board-table-wrap play-stage">
              <div className="board-table" role="table" aria-label={t('board.title')}>
                <div className="board-table-head" role="row">
                  <span role="columnheader">{t('board.rank')}</span>
                  <span role="columnheader">{t('board.player')}</span>
                  <span role="columnheader">{t('board.wins')}</span>
                  <span role="columnheader">{t('board.kills')}</span>
                  <span role="columnheader">{t('board.matches')}</span>
                </div>
                {rest.map((row) => (
                  <Link
                    key={row.id}
                    className="board-table-row"
                    role="row"
                    to={`/profile/${row.id}`}
                  >
                    <span className="board-rank" role="cell">
                      {String(row.rank).padStart(2, '0')}
                    </span>
                    <span className="board-player" role="cell">
                      <UserAvatar src={row.avatar} name={row.username} size={40} />
                      <span>
                        <strong>{row.username}</strong>
                        <small>
                          {t('board.level')} {row.level} · {row.badge}
                        </small>
                      </span>
                    </span>
                    <span className="board-stat" role="cell">
                      {row.wins}
                    </span>
                    <span className="board-stat" role="cell">
                      {row.kills}
                    </span>
                    <span className="board-stat" role="cell">
                      {row.matches}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
