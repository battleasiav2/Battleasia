import { useEffect, useState } from 'react';
import { api, isApiError, unwrapList } from '../lib/api';
import { cell, pick, rowId } from '../lib/format';
import { useI18n } from '../lib/i18n';

export function WalletOpsPage() {
  const { t } = useI18n();
  const [channels, setChannels] = useState<Array<Record<string, unknown>> | null>(null);
  const [wallets, setWallets] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api('/api/v4/payments/payment-channels?limit=50'),
      api('/api/v4/payments/business-wallets?limit=50'),
    ])
      .then(([c, w]) => {
        setChannels(unwrapList<Record<string, unknown>>(c));
        setWallets(unwrapList<Record<string, unknown>>(w));
      })
      .catch((err) => {
        setChannels([]);
        setWallets([]);
        setError(isApiError(err) ? err.message : t('list.loadFail'));
      });
  }, [t]);

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.money')}</p>
        <h1>{t('nav.wallets')}</h1>
        <p className="admin-lead">{t('walletOps.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}

      <section className="wallet-block">
        <h2>{t('walletOps.channels')}</h2>
        <Table rows={channels} cols={['channel_name', 'description']} loadingLabel={t('list.loading')} empty={t('list.empty')} />
      </section>

      <section className="wallet-block">
        <h2>{t('walletOps.business')}</h2>
        <Table
          rows={wallets}
          cols={['wallet_address', 'currency_type']}
          loadingLabel={t('list.loading')}
          empty={t('list.empty')}
        />
      </section>
    </main>
  );
}

function Table({
  rows,
  cols,
  loadingLabel,
  empty,
}: {
  rows: Array<Record<string, unknown>> | null;
  cols: string[];
  loadingLabel: string;
  empty: string;
}) {
  if (rows === null) return <p className="admin-lead">{loadingLabel}…</p>;
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <h2>{empty}</h2>
      </div>
    );
  }
  return (
    <div className="dash-stage list-stage">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowId(row) || JSON.stringify(row).slice(0, 24)}>
                {cols.map((c) => (
                  <td key={c}>{cell(pick(row, c))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
