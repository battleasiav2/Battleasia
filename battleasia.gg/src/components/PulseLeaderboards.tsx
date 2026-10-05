import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import type { PulsePlayer } from '../lib/dashboard';
import { ZipAmount, ZipAvatar } from './landing/ZipMedia';

function LbRows({
  rows,
  metric,
}: {
  rows: PulsePlayer[];
  metric: 'winnings' | 'kills';
}) {
  const { t } = useI18n();
  if (!rows.length) {
    return <p className="text-muted text-muted--sm">{t('pulse.empty')}</p>;
  }
  return (
    <>
      {rows.slice(0, 8).map((p, i) => {
        const rank = i + 1;
        const value = metric === 'winnings' ? p.totalWinnings : p.totalKills;
        return (
          <Link key={p.userId || `${p.username}-${rank}`} className="lb-row reveal" to={p.userId ? `/profile/${p.userId}` : '/dashboard'}>
            <span className="lb-rank">{rank}</span>
            <ZipAvatar src={p.avatar} index={i} />
            <span>{p.username}</span>
            <span className="lb-score">
              {metric === 'winnings' ? (
                <ZipAmount value={Number(value) || 0} />
              ) : (
                <strong>{Number(value || 0).toLocaleString()}</strong>
              )}
            </span>
          </Link>
        );
      })}
    </>
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
    <div className="lb-grid reveal-group reveal-group-direct">
      <div className="lb-card card reveal">
        <h3>{t('pulse.topProfit')}</h3>
        <LbRows rows={profit} metric="winnings" />
      </div>
      <div className="lb-card card reveal">
        <h3>{t('pulse.topKillers')}</h3>
        <LbRows rows={killers} metric="kills" />
      </div>
    </div>
  );
}
