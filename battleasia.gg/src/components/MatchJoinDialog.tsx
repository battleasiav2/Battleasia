import { CoinValue } from './CoinValue';
import { SpotBar } from './SpotBar';
import { isDemoMatchId } from '../lib/demoMatches';
import { coverForMatch, formatWhen, localCoverForGame, spotsLeft, type MatchItem } from '../lib/games';
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
  const joinCover = coverForMatch(match);
  const gameRef = { name: match.gameName, banner: match.banner };
  const localCover = localCoverForGame(gameRef);
  const demo = isDemoMatchId(match.id);

  const grid = [
    { label: t('match.game'), value: match.gameName || '—' },
    { label: t('match.schedule'), value: formatWhen(match.matchSchedule) },
    { label: t('match.teamType'), value: match.teamType || '—' },
    { label: t('match.map'), value: match.map || t('match.mapTbd') },
    { label: t('match.typeLabel'), value: match.matchType || '—' },
    {
      label: t('match.entryFee'),
      value: fee <= 0 ? t('match.free') : <CoinValue value={fee} size={16} />,
    },
    {
      label: t('match.perKill'),
      value: <CoinValue value={match.perKill || 0} size={16} />,
    },
    {
      label: t('match.yourBalance'),
      value: (
        <>
          <CoinValue value={balance} size={16} />
          {insufficient ? <em className="join-balance-warn">{t('match.insufficient')}</em> : null}
        </>
      ),
    },
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
      <div className="play-sheet-card join-dialog join-dialog-room">
        <div className="join-hero">
          <img
            src={joinCover}
            alt=""
            width={480}
            height={220}
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.getAttribute('src') !== localCover) {
                img.src = localCover;
                return;
              }
              img.src = '/covers/arena.svg';
            }}
          />
          <div className="join-hero-scrim" aria-hidden />
          <button type="button" className="join-dialog-x" onClick={onClose} aria-label={t('match.close')}>
            ×
          </button>
          <div className="join-hero-copy">
            <p className="join-hero-eyebrow">{t('match.secureEntry')}</p>
            <h2 id="join-title">{match.matchName}</h2>
            <span className="join-hero-pill">
              {used}/{cap} {t('match.spots')}
            </span>
          </div>
        </div>

        <div className="join-dialog-body">
          {signal ? (
            <p className="join-signal" role="alert">
              {signal}
            </p>
          ) : null}

          <p className="join-lead play-muted">{t('match.joinMatchFor').replace('{{name}}', match.matchName)}</p>

          <div className="join-spec-grid">
            {grid.map((cell) => (
              <div key={cell.label} className="join-spec-cell">
                <small>{cell.label}</small>
                <strong>{cell.value}</strong>
              </div>
            ))}
          </div>

          <div className="join-spots-row">
            <SpotBar used={used} total={cap} />
          </div>

          {match.prizeDescription ? (
            <div className="join-prize-block">
              <small>{t('match.prize')}</small>
              <p>{match.prizeDescription}</p>
            </div>
          ) : null}
        </div>

        <footer className="join-dialog-foot join-dialog-foot-stack">
          <button
            type="button"
            className="btn btn-primary join-cta"
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
          <button type="button" className="btn btn-ghost join-cta-secondary" onClick={onClose} disabled={joining}>
            {t('match.cancel')}
          </button>
        </footer>
      </div>
    </div>
  );
}
