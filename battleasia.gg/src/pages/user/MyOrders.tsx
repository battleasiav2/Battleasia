import { useEffect, useState } from 'react';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMyDeposits, openBacShop } from '../../lib/wallet';
import { useI18n } from '../../lib/i18n';

export function MyOrdersPage() {
  const { t } = useI18n();
  useHudPage();
  const [rows, setRows] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyDeposits()
      .then(setRows)
      .catch((err) => {
        setError(isApiError(err) ? err.message : t('orders.offline'));
        setRows([]);
      });
  }, []);

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('orders.eyebrow')}</p>
          <h1>{t('orders.title')}</h1>
          <p className="play-lead">{t('orders.lead')}</p>
        </div>
        <p className="play-count">
          <strong>{rows?.length ?? '—'}</strong>
          <small>{t('orders.count')}</small>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {rows === null ? (
        <div className="match-row skeleton" />
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{t('orders.empty')}</h2>
          <button type="button" className="btn btn-primary" onClick={() => openBacShop('entry')}>
            {t('wallet.buy')}
          </button>
        </div>
      ) : (
        <div className="play-stage">
        <div className="result-table wallet-table">
          <div className="result-head">
            <span>{t('orders.when')}</span>
            <span>{t('orders.trx')}</span>
            <span>{t('orders.status')}</span>
            <span>{t('orders.bac')}</span>
          </div>
          {rows.map((row) => (
            <div className="result-row" key={String(row._id || row.id)}>
              <span>{row.created_at ? new Date(String(row.created_at)).toLocaleString() : '—'}</span>
              <span>{String(row.transaction_id || '')}</span>
              <span>{String(row.status || '')}</span>
              <span>
                <CoinValue value={Number(row.coin_amount) || 0} />
              </span>
            </div>
          ))}
        </div>
        </div>
      )}
    </main>
  );
}
