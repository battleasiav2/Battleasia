import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { UserAvatar } from './UserAvatar';
import { useI18n } from '../lib/i18n';
import type { PulsePlayer } from '../lib/dashboard';

function Score({
  metric,
  value,
}: {
  metric: 'winnings' | 'kills';
  value: number;
}) {
  if (metric === 'winnings') return <CoinValue value={value} size={16} />;
  return <strong>{Number(value || 0).toLocaleString()}</strong>;
}

function PodiumSpot({
  player,
  rank,
  metric,
}: {
  player?: PulsePlayer;
  rank: 1 | 2 | 3;
  metric: 'winnings' | 'kills';
}) {
  if (!player) return <div className={`arena-pod is-${rank} is-empty`} />;
  const value = metric === 'winnings' ? player.totalWinnings : player.totalKills;
  return (
    <Link className={`arena-pod is-${rank}`} to={`/profile/${player.userId}`}>
      <span className="arena-pod-hex">
        <UserAvatar src={player.avatar} name={player.username} size={rank === 1 ? 92 : 74} />
      </span>
      <b className="arena-pod-name">{player.username}</b>
      <span className="arena-pod-val">
        <Score metric={metric} value={value} />
      </span>
      <span className="arena-pod-stage">
        <span className="arena-pod-badge">{rank}</span>
        <span className="arena-pod-base" />
      </span>
    </Link>
  );
}

export function PulseLeaderboards({
  profit,
  killers,
}: {
  profit: PulsePlayer[];
  killers: PulsePlayer[];
}) {
  const { t } = useI18n();
  const [metric, setMetric] = useState<'winnings' | 'kills'>('winnings');
  const players = (metric === 'winnings' ? profit : killers).slice(0, 11);
  const rest = players.slice(3, 11);

  return (
    <section className="arena-board-card" aria-labelledby="arena-lb-title">
      <div className="arena-board-head">
        <h2 id="arena-lb-title">{t('pulse.boards')}</h2>
        <div className="arena-board-tabs" role="group" aria-label={t('pulse.boards')}>
          <button type="button" aria-pressed={metric === 'winnings'} onClick={() => setMetric('winnings')}>
            {t('pulse.winningsCol')}
          </button>
          <button type="button" aria-pressed={metric === 'kills'} onClick={() => setMetric('kills')}>
            {t('pulse.killsCol')}
          </button>
        </div>
      </div>
      <div className="arena-climb">
        <p className="arena-climb-kicker">{t('pulse.climb')}</p>
        <p>{metric === 'winnings' ? t('pulse.topProfit') : t('pulse.topKillers')}</p>
      </div>

      {players.length ? (
        <>
          <div className="arena-podium">
            <PodiumSpot player={players[1]} rank={2} metric={metric} />
            <PodiumSpot player={players[0]} rank={1} metric={metric} />
            <PodiumSpot player={players[2]} rank={3} metric={metric} />
          </div>

          {rest.length ? (
            <div className="arena-table">
              {rest.map((p, i) => {
                const rank = i + 4;
                const value = metric === 'winnings' ? p.totalWinnings : p.totalKills;
                return (
                  <Link key={p.userId || `${p.username}-${rank}`} className="arena-table-row" to={`/profile/${p.userId}`}>
                    <span className="arena-table-rank">{rank}</span>
                    <span className="arena-table-player">
                      <UserAvatar src={p.avatar} name={p.username} size={28} />
                      <b>{p.username}</b>
                    </span>
                    <span className="arena-table-wr">{p.winRate != null ? `${p.winRate}%` : '—'}</span>
                    <span className="arena-table-amt">
                      <Score metric={metric} value={value} />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </>
      ) : (
        <p className="arena-board-empty">{t('pulse.empty')}</p>
      )}
    </section>
  );
}
