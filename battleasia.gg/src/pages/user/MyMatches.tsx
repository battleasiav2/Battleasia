import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMatchHistory } from '../../lib/social';
import { useI18n } from '../../lib/i18n';

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
  }, []);

  return (
    <main className="play-main">
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
        <div className="play-stage">
        <div className="result-table wallet-table">
          <div className="result-head">
            <span>{t('matches.match')}</span>
            <span>{t('matches.rank')}</span>
            <span>{t('matches.kills')}</span>
            <span>{t('matches.won')}</span>
          </div>
          {rows.map((row) => {
            const id = String(row.matchId || row.id);
            return (
              <Link className="result-row" key={id} to={`/user/play/${id}/result`}>
                <span>{String(row.matchName || '')}</span>
                <span>{String(row.rank ?? '—')}</span>
                <span>{String(row.kills ?? 0)}</span>
                <span>
                  <CoinValue value={Number(row.winnings || row.amountWon) || 0} />
                </span>
              </Link>
            );
          })}
        </div>
        </div>
      )}
    </main>
  );
}
