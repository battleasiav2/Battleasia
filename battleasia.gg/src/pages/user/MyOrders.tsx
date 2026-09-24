import { useEffect, useMemo, useState } from 'react';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMyDeposits, fetchMyWithdrawals, openBacShop } from '../../lib/wallet';
import { useI18n } from '../../lib/i18n';

type OrderTab = 'deposit' | 'withdraw';

function formatWhen(value?: unknown) {
  if (!value) return '—';
  return new Date(String(value)).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusTone(status?: string) {
  const s = String(status || '').toLowerCase();
  if (s === 'approved' || s === 'completed' || s === 'success' || s === 'paid') return 'ok';
  if (s === 'pending' || s === 'processing') return 'wait';
  if (s === 'rejected' || s === 'failed' || s === 'cancelled' || s === 'canceled') return 'bad';
  return 'muted';
}

export function MyOrdersPage() {
  const { t } = useI18n();
  useHudPage();
  const [tab, setTab] = useState<OrderTab>('deposit');
  const [deposits, setDeposits] = useState<Array<Record<string, unknown>> | null>(null);
  const [withdrawals, setWithdrawals] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchMyDeposits(), fetchMyWithdrawals()])
      .then(([d, w]) => {
        setDeposits(d);
        setWithdrawals(w);
      })
      .catch((err) => {
        setError(isApiError(err) ? err.message : t('orders.offline'));
        setDeposits([]);
        setWithdrawals([]);
      });
  }, [t]);

  const rows = tab === 'deposit' ? deposits : withdrawals;
  const count = useMemo(() => (deposits?.length || 0) + (withdrawals?.length || 0), [deposits, withdrawals]);

  return (
    <main className="play-main orders-hub">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('orders.eyebrow')}</p>
          <h1>{t('orders.title')}</h1>
          <p className="play-lead">{t('orders.lead')}</p>
        </div>
        <p className="play-count">
          <strong>{count || '—'}</strong>
          <small>{t('orders.count')}</small>
        </p>
      </header>

      <div className="hist-filters orders-tabs">
        <button type="button" className={tab === 'deposit' ? 'active' : ''} onClick={() => setTab('deposit')}>
          {t('orders.deposits')}
        </button>
        <button type="button" className={tab === 'withdraw' ? 'active' : ''} onClick={() => setTab('withdraw')}>
          {t('orders.withdrawals')}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {rows === null ? (
        <div className="match-row skeleton" />
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{tab === 'deposit' ? t('orders.empty') : t('orders.emptyOut')}</h2>
          <button type="button" className="btn btn-primary" onClick={() => openBacShop(tab === 'deposit' ? 'entry' : 'withdrawal')}>
            {tab === 'deposit' ? t('wallet.buy') : t('orders.goWithdraw')}
          </button>
        </div>
      ) : (
        <ul className="hist-feed orders-feed">
          {rows.map((row) => {
            const id = String(row._id || row.id);
            const status = String(row.status || '');
            const tone = statusTone(status);
            const amt = Number(row.coin_amount ?? row.amount) || 0;
            const when = row.created_at || row.createdAt;
            const meta = String(row.transaction_id || row.wallet_address || row.wallet_type || '');
            return (
              <li key={id} className="hist-item">
                <div className="hist-item-main">
                  <span className={`hist-status hist-status-${tone}`}>{status || '—'}</span>
                  <strong>
                    <CoinValue value={amt} />
                  </strong>
                  <small>
                    {formatWhen(when)}
                    {meta ? ` · ${meta}` : ''}
                  </small>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
