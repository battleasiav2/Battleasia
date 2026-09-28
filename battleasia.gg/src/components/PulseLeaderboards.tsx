import { Link } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { UserAvatar } from './UserAvatar';
import { useI18n } from '../lib/i18n';
import type { PulsePlayer } from '../lib/dashboard';

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <svg className="pulse-board-medal gold" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          d="M4.5 16.5h15l-1.1-8.2-3.6 3L12 5.2 9.2 11.3 5.6 8.3 4.5 16.5Z"
        />
        <path fill="currentColor" d="M7 18.2h10v1.6H7z" />
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg className="pulse-board-medal silver" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <circle cx="12" cy="9" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" d="M9.2 12.6 8 19.5 12 17.2l4 2.3-1.2-6.9" />
      </svg>
    );
  }
  if (rank === 3) {
    return (
      <svg className="pulse-board-medal bronze" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path fill="currentColor" d="M8.2 12.2 6.4 20l5.6-2.4L17.6 20l-1.8-7.8H8.2Z" />
      </svg>
    );
  }
  return <span className="pulse-board-num">{rank}</span>;
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
                  <b>{p.username}</b>
                </Link>
                <span className="pulse-board-wr">
                  {p.winRate != null ? `${p.winRate}% ${t('pulse.wr')}` : '—'}
                </span>
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
