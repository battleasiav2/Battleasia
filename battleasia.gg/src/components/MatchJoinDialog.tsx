import { CoinValue } from './CoinValue';
import { isDemoMatchId } from '../lib/demoMatches';
import { formatWhen, spotsLeft, type MatchItem } from '../lib/games';
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

  const rows = [
    ...grid,
    {
      label: t('match.spots'),
      value: `${used}/${cap}`,
    },
  ];

  return (
    <div className="play-sheet join-sheet" role="dialog" aria-labelledby="join-title">
      <button className="play-sheet-bg" type="button" aria-label={t('match.close')} onClick={onClose} />
      <div className="play-sheet-card ba-join">
        <div className="ba-join-top">
          <h2 id="join-title">{t('match.joinMatch')}</h2>
          <button type="button" className="ba-join-x" onClick={onClose} aria-label={t('match.close')}>
            ×
          </button>
        </div>
        <p className="ba-join-eye">
          {match.map || t('match.mapTbd')} · {match.teamType || 'Solo'} · {match.gameName || t('nav.play')}
        </p>
        <h3>{match.matchName}</h3>
        {signal ? (
          <p className="join-signal" role="alert">
            {signal}
          </p>
        ) : (
          <p className="ba-join-lead">{t('match.joinMatchFor').replace('{{name}}', match.matchName)}</p>
        )}
        {rows.map((cell) => (
          <div key={cell.label} className="ba-join-row">
            <span>{cell.label}</span>
            <strong>{cell.value}</strong>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-primary ba-room-action"
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
        <button type="button" className="btn btn-ghost ba-join-cancel" onClick={onClose} disabled={joining}>
          {t('match.cancel')}
        </button>
      </div>
    </div>
  );
}
