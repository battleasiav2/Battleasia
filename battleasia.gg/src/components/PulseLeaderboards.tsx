import { Link } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { UserAvatar } from './UserAvatar';
import { useI18n } from '../lib/i18n';
import type { PulsePlayer } from '../lib/dashboard';

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <svg className="pulse-board-medal gold" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2.5 14.2 8l5.8.5-4.4 3.7 1.4 5.6L12 14.8 6.9 17.8l1.4-5.6L4 8.5 9.8 8 12 2.5Z"
        />
      </svg>
    );
  }
  if (rank === 2 || rank === 3) {
    return (
      <svg
        className={`pulse-board-medal ${rank === 2 ? 'silver' : 'bronze'}`}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden
      >
        <circle cx="12" cy="11" r="6.2" fill="currentColor" />
        <path d="M9 17.5 8 21l4-1.6L16 21l-1-3.5" fill="currentColor" opacity="0.85" />
      </svg>
    );
  }
  return <span className="pulse-board-num">{String(rank).padStart(2, '0')}</span>;
}

function BoardCard({
  title,
  metricLabel,
  players,
  metric,
  tone,
}: {
  title: string;
  metricLabel: string;
  players: PulsePlayer[];
  metric: 'winnings' | 'kills';
  tone: 'profit' | 'kills';
}) {
  const { t } = useI18n();
  const boardHref = '/user/account/leader-board';

  return (
    <article className={`pulse-board pulse-board--${tone}`}>
      <header className="pulse-board-head">
        <div className="pulse-board-title">
          <span className="pulse-board-eyebrow">{tone === 'profit' ? t('pulse.winningsCol') : t('pulse.killsCol')}</span>
          <h3>{title}</h3>
        </div>
        <span className="pulse-board-live">
          <i /> {t('pulse.live')}
        </span>
      </header>
      <div className="pulse-board-cols" aria-hidden>
        <span>{t('pulse.rank')}</span>
        <span>{t('pulse.player')}</span>
        <span>{metricLabel}</span>
      </div>
      {players.length ? (
        <ol className="pulse-board-list">
          {players.slice(0, 5).map((p, i) => {
            const rank = i + 1;
            const value = metric === 'winnings' ? p.totalWinnings : p.totalKills;
            return (
              <li key={p.userId || `${p.username}-${rank}`} className={rank <= 3 ? `is-top is-top-${rank}` : undefined}>
                <div className="pulse-board-rank">
                  <RankMark rank={rank} />
                </div>
                <Link className="pulse-board-player" to={`/profile/${p.userId}`}>
                  <UserAvatar src={p.avatar} name={p.username} size={36} />
                  <span>
                    <b>{p.username}</b>
                    <small>
                      {p.winRate != null ? `${p.winRate}% ${t('pulse.wr')}` : '—'}
                    </small>
                  </span>
                </Link>
                <div className="pulse-board-metric">
                  {metric === 'winnings' ? (
                    <CoinValue value={value} size={18} />
                  ) : (
                    <b className="pulse-board-kills">{Number(value || 0).toLocaleString()}</b>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="pulse-board-empty">{t('pulse.empty')}</p>
      )}
      <Link className="pulse-board-more" to={boardHref}>
        {t('pulse.viewLeaderboard')} →
      </Link>
    </article>
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
  return (
    <section className="pulse-boards" aria-label={t('pulse.boards')}>
      <BoardCard
        title={t('pulse.topProfit')}
        metricLabel={t('pulse.winningsCol')}
        players={profit}
        metric="winnings"
        tone="profit"
      />
      <BoardCard
        title={t('pulse.topKillers')}
        metricLabel={t('pulse.killsCol')}
        players={killers}
        metric="kills"
        tone="kills"
      />
    </section>
  );
}
