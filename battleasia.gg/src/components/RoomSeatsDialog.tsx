import { useEffect, useState } from 'react';
import { fetchMatch, type MatchDetail, type MatchItem } from '../lib/games';
import { isApiError } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { RoomSeats } from './RoomSeats';

type Props = {
  match: MatchItem | null;
  onClose: () => void;
};

export function RoomSeatsDialog({ match, onClose }: Props) {
  const { t } = useI18n();
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!match) return;
    let cancel = false;
    setLoading(true);
    setError('');
    setDetail(null);
    fetchMatch(match.id)
      .then((data) => {
        if (!cancel) setDetail(data);
      })
      .catch((err) => {
        if (!cancel) setError(isApiError(err) ? err.message : t('match.seatsFail'));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [match]);

  useEffect(() => {
    if (!match) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [match, onClose]);

  if (!match) return null;

  const total = detail?.totalPlayer || match.totalPlayer || 0;
  const players = detail?.participants || [];
  const used = detail?.participantsCount ?? players.length ?? match.participantsCount ?? 0;

  return (
    <div className="play-sheet join-sheet" role="dialog" aria-labelledby="seats-title">
      <button className="play-sheet-bg" type="button" aria-label={t('match.close')} onClick={onClose} />
      <div className="play-sheet-card ba-seats-card">
        <div className="ba-join-top">
          <div>
            <h2 id="seats-title">{match.matchName}</h2>
            <p className="ba-seats-lead">
              {t('match.seatsLead').replace('{used}', String(used)).replace('{total}', String(total || used))}
            </p>
          </div>
          <button type="button" className="ba-join-x" onClick={onClose} aria-label={t('match.close')}>
            ×
          </button>
        </div>
        {error ? <p className="play-muted">{error}</p> : null}
        {loading && !detail ? <p className="play-muted">{t('match.seatsLoading')}</p> : null}
        <RoomSeats total={total} players={players} openLabel={t('match.seatOpen')} />
      </div>
    </div>
  );
}
