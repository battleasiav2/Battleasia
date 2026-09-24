import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMatchHistory } from '../../lib/social';
import { useI18n } from '../../lib/i18n';

function formatWhen(value?: unknown) {
  if (!value) return '';
  return new Date(String(value)).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function MyMatchesPage() {
  const { t } = useI18n();
  useHudPage();
  const [rows, setRows] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatchHistory()
      .then((list) => setRows(list as Array<Record<string, unknown>>))
      .catch((err) => {
        setError(isApiError(err) ? err.message : t('matches.offline'));
        setRows([]);
      });
  }, [t]);

  return (
    <main className="play-main orders-hub">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('matches.eyebrow')}</p>
          <h1>{t('matches.title')}</h1>
          <p className="play-lead">{t('matches.emptyLead')}</p>
        </div>
        <p className="play-count">
          <strong>{rows?.length ?? '—'}</strong>
          <small>{t('matches.count')}</small>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {rows === null ? (
        <div className="match-row skeleton" />
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{t('matches.empty')}</h2>
          <p>{t('matches.emptyLead')}</p>
          <Link className="btn btn-primary" to="/user/play">
            {t('nav.play')}
          </Link>
        </div>
      ) : (
        <ul className="hist-feed orders-feed">
          {rows.map((row) => {
            const id = String(row.matchId || row.id);
            const won = Number(row.winnings || row.amountWon) || 0;
            const when = row.finishedAt || row.createdAt || row.updatedAt;
            return (
              <li key={id}>
                <Link className="hist-item hist-item-link" to={`/user/play/${id}/result`}>
                  <div className="hist-item-main">
                    <span className="hist-pill hist-pill-game">{t('matches.match')}</span>
                    <strong>{String(row.matchName || id)}</strong>
                    <small>
                      {t('matches.rank')} {String(row.rank ?? '—')} · {t('matches.kills')} {String(row.kills ?? 0)}
                      {when ? ` · ${formatWhen(when)}` : ''}
                    </small>
                  </div>
                  <div className={`hist-amt ${won > 0 ? 'is-in' : ''}`}>
                    <span>
                      <CoinValue value={won} />
                    </span>
                    <small>{t('matches.won')}</small>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
