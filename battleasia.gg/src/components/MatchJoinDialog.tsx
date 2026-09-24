import { CoinValue } from './CoinValue';
import { SpotBar } from './SpotBar';
import { isDemoMatchId } from '../lib/demoMatches';
import { coverForGame, formatWhen, localCoverForGame, spotsLeft, type MatchItem } from '../lib/games';
import { useI18n } from '../lib/i18n';

type Props = {
  match: MatchItem | null;
  balance: number;
  joining?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function MatchJoinDialog({ match, balance, joining, error, onClose, onConfirm }: Props) {
  const { t } = useI18n();
  if (!match) return null;

  const fee = Number(match.entryFee) || 0;
  const insufficient = fee > balance;
  const left = spotsLeft(match);
  const isFull = left <= 0;
  const used = match.participantsCount || 0;
  const cap = match.totalPlayer || 0;
  const gameRef = { name: match.gameName, banner: match.banner };
  const localCover = localCoverForGame(gameRef);
  const demo = isDemoMatchId(match.id);

  const rows = [
    { label: t('match.game'), value: match.gameName || '—' },
    { label: t('match.schedule'), value: formatWhen(match.matchSchedule) },
    { label: t('match.teamType'), value: match.teamType || '—' },
    { label: t('match.map'), value: match.map || t('match.mapTbd') },
    { label: t('match.typeLabel'), value: match.matchType || '—' },
  ];

  const signal =
    error ||
    (demo
      ? t('match.demoDisabled')
      : insufficient
        ? t('match.insufficientBalance')
        : isFull
          ? t('match.matchFullToast')
          : '');

  return (
    <div className="play-sheet join-sheet" role="dialog" aria-labelledby="join-title">
      <button className="play-sheet-bg" type="button" aria-label={t('match.close')} onClick={onClose} />
      <div className="play-sheet-card join-dialog">
        <header className="join-dialog-head">
          <div>
            <p className="eyebrow">{t('match.secureEntry')}</p>
            <h2 id="join-title">{t('match.confirmEntry')}</h2>
            <p className="play-muted">{t('match.joinMatchFor').replace('{{name}}', match.matchName)}</p>
          </div>
          <button type="button" className="join-dialog-x" onClick={onClose} aria-label={t('match.close')}>
            ×
          </button>
        </header>

        <div className="join-dialog-body">
          {signal ? (
            <p className="join-signal" role="alert">
              {signal}
            </p>
          ) : null}

          <div className="join-map-card">
            <img
              src={localCover}
              alt=""
              width={480}
              height={200}
              onError={(e) => {
                const img = e.currentTarget;
                const webp = coverForGame({ name: match.gameName });
                if (img.src.includes('.svg') && webp !== img.getAttribute('src')) {
                  img.src = webp;
                  return;
                }
                img.src = '/covers/arena.svg';
              }}
            />
            <div className="join-map-overlay">
              <small>{t('match.map')}</small>
              <strong>{match.map || t('match.mapTbd')}</strong>
            </div>
          </div>

          <div className="join-panel">
            <div className="join-detail-grid">
              {rows.map((row) => (
                <div key={row.label}>
                  <small>{row.label}</small>
                  <b>{row.value}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="join-panel join-spots">
            <div className="join-spots-top">
              <small>{t('match.spots')}</small>
              <strong>
                {used}/{cap}
              </strong>
            </div>
            <SpotBar used={used} total={cap} />
          </div>

          <div className="join-metrics">
            <div className="join-panel">
              <small>{t('match.entryFee')}</small>
              <strong>{fee <= 0 ? t('match.free') : <CoinValue value={fee} size={16} />}</strong>
            </div>
            <div className="join-panel">
              <small>{t('match.perKill')}</small>
              <strong>
                <CoinValue value={match.perKill || 0} size={16} />
              </strong>
            </div>
          </div>

          {match.prizeDescription ? (
            <div className="join-panel">
              <small>{t('match.prize')}</small>
              <p>{match.prizeDescription}</p>
            </div>
          ) : null}
        </div>

        <footer className="join-dialog-foot">
          <div className={`join-panel join-balance ${insufficient ? 'is-bad' : 'is-ok'}`}>
            <small>{t('match.yourBalance')}</small>
            <span>
              <CoinValue value={balance} size={16} />
              {insufficient ? <em>{t('match.insufficient')}</em> : null}
            </span>
          </div>
          <div className="join-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={joining}>
              {t('match.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              disabled={joining || insufficient || isFull || demo}
            >
              {joining
                ? t('match.joining')
                : isFull
                  ? t('match.matchFull')
                  : demo
                    ? t('match.demoShort')
                    : t('match.joinMatch')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
