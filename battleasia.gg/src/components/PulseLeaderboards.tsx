import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { UserAvatar } from './UserAvatar';
import { useI18n } from '../lib/i18n';
import type { PulsePlayer } from '../lib/dashboard';

export function PulseLeaderboards({
  profit,
  killers,
}: {
  profit: PulsePlayer[];
  killers: PulsePlayer[];
}) {
  const { t } = useI18n();
  const [metric, setMetric] = useState<'winnings' | 'kills'>('winnings');
  const players = (metric === 'winnings' ? profit : killers).slice(0, 5);

  return (
    <section className="arena-board-card" aria-labelledby="arena-lb-title">
      <div className="arena-board-head">
        <h2 id="arena-lb-title">{t('pulse.boards')}</h2>
        <div className="arena-board-tabs" role="group" aria-label={t('pulse.boards')}>
          <button
            type="button"
            aria-pressed={metric === 'winnings'}
            onClick={() => setMetric('winnings')}
          >
            {t('pulse.winningsCol')}
          </button>
          <button
            type="button"
            aria-pressed={metric === 'kills'}
            onClick={() => setMetric('kills')}
          >
            {t('pulse.killsCol')}
          </button>
        </div>
      </div>

      {players.length ? (
        <ol className="arena-board-list">
          {players.map((p, i) => {
            const rank = i + 1;
            const value = metric === 'winnings' ? p.totalWinnings : p.totalKills;
            const rkClass = rank === 1 ? 'g1' : rank === 2 ? 'g2' : rank === 3 ? 'g3' : '';
            return (
              <li key={p.userId || `${p.username}-${rank}`} className="arena-board-row">
                <span className={`arena-rk ${rkClass}`}>{rank}</span>
                <Link className="arena-board-av" to={`/profile/${p.userId}`} aria-label={p.username}>
                  <UserAvatar src={p.avatar} name={p.username} size={38} />
                </Link>
                <div className="arena-board-info">
                  <Link className="arena-board-nm" to={`/profile/${p.userId}`}>
                    {p.username}
                  </Link>
                  <div className="arena-board-wr">
                    {p.winRate != null ? `${p.winRate}% ${t('pulse.wr') || 'WR'}` : '—'}
                  </div>
                </div>
                <div className="arena-board-amt">
                  {metric === 'winnings' ? (
                    <CoinValue value={value} size={18} />
                  ) : (
                    <strong>{Number(value || 0).toLocaleString()}</strong>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="arena-board-empty">{t('pulse.empty')}</p>
      )}

      <Link className="arena-board-more" to="/user/account/leader-board">
        {t('pulse.viewLeaderboard')} →
      </Link>
    </section>
  );
}
