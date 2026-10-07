import { useEffect, useState } from 'react';
import { api, isApiError, unwrapData, unwrapList } from '../lib/api';
import { cell, pick, rowId } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { useOutletContext } from 'react-router-dom';

type Ctx = { toast: (m: string) => void };

function isCryptoWallet(row: Record<string, unknown>) {
  const currency = String(row.currency_type || '').toLowerCase();
  const channel = row.channel_id;
  const name =
    channel && typeof channel === 'object'
      ? String((channel as { channel_name?: string }).channel_name || '')
      : '';
  const blob = `${currency} ${name}`.toLowerCase();
  return blob.includes('usdt') || blob.includes('tether') || blob.includes('crypto');
}

export function WalletOpsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [channels, setChannels] = useState<Array<Record<string, unknown>> | null>(null);
  const [wallets, setWallets] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState('');

  function load() {
    return Promise.all([
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
  }

  useEffect(() => {
    void load();
  }, [t]);

  async function uploadQr(id: string, file: File) {
    setUploading(id);
    try {
      const body = new FormData();
      body.append('file', file);
      const uploaded = await api('/api/v1/files/upload/shop', { method: 'POST', body });
      const data = unwrapData<{ url?: string }>(uploaded);
      const url = String(data?.url || '');
      if (!url) throw new Error('No url');
      await api(`/api/v4/payments/business-wallets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ qr_code: url }),
      });
      toast(t('walletOps.qrOk'));
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('walletOps.qrFail'));
    } finally {
      setUploading('');
    }
  }

  const cryptoWallets = (wallets || []).filter(isCryptoWallet);

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.money')}</p>
        <h1>{t('nav.wallets')}</h1>
        <p className="admin-lead">{t('walletOps.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}

      <section className="wallet-block">
        <h2>{t('walletOps.qr')}</h2>
        <p className="admin-lead">{t('walletOps.qrLead')}</p>
        {wallets === null ? (
          <p className="admin-lead">{t('list.loading')}…</p>
        ) : cryptoWallets.length === 0 ? (
          <p className="admin-lead">{t('walletOps.qrEmpty')}</p>
        ) : (
          <div className="dash-stage form-stage" style={{ display: 'grid', gap: 12 }}>
            {cryptoWallets.map((row) => {
              const id = rowId(row);
              const qr = String(row.qr_code || '');
              return (
                <div key={id} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {qr ? (
                    <img src={qr} alt="" width={96} height={96} style={{ objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 6 }} />
                  ) : (
                    <span className="admin-muted">—</span>
                  )}
                  <div>
                    <strong>{String(row.currency_type || 'USDT')}</strong>
                    <p className="admin-lead" style={{ margin: '4px 0 8px' }}>{String(row.wallet_address || '')}</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploading === id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && id) void uploadQr(id, file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
