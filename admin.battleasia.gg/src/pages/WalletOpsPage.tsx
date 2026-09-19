import { useEffect, useState } from 'react';
import { api, isApiError, unwrapList } from '../lib/api';
import { cell, pick, rowId } from '../lib/format';

export function WalletOpsPage() {
  const [channels, setChannels] = useState<Array<Record<string, unknown>>>([]);
  const [wallets, setWallets] = useState<Array<Record<string, unknown>>>([]);
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
      .catch((err) => setError(isApiError(err) ? err.message : 'Wallets offline'));
  }, []);

  return (
    <main className="admin-body">
      <h1>Payment wallets</h1>
      <p className="admin-lead">Channels and business wallets. CRUD lives on the same v4 admin APIs.</p>
      {error ? <p className="form-error">{error}</p> : null}
      <h2>Channels</h2>
      <Table rows={channels} cols={['channel_name', 'description']} />
      <h2>Business wallets</h2>
      <Table rows={wallets} cols={['wallet_address', 'currency_type']} />
    </main>
  );
}

function Table({ rows, cols }: { rows: Array<Record<string, unknown>>; cols: string[] }) {
  if (!rows.length) return <div className="admin-empty">No rows</div>;
  return (
    <div className="admin-table-wrap" style={{ marginBottom: 24 }}>
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
  );
}
