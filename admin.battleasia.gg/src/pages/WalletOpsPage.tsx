import { useEffect, useState } from 'react';
import { api, unwrapData, unwrapList, explainError, uploadMultipart } from '../lib/api';
import { cell, pick, rowId } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { mediaUrl } from '../lib/media';
import { useOutletContext } from 'react-router-dom';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

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
  const [uploadPct, setUploadPct] = useState(0);

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
        setError(explainError(err, t('list.loadFail')));
      });
  }

  useEffect(() => {
    void load();
  }, [t]);

  async function uploadQr(id: string, file: File) {
    setUploading(id);
    setUploadPct(0);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const uploaded = await uploadMultipart('/api/v1/files/upload/shop', body, { onProgress: setUploadPct });
      const data = unwrapData<{ url?: string }>(uploaded);
      const url = String(data?.url || '');
      if (!url) throw new Error('No url');
      await api(`/api/v4/payments/business-wallets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ qr_code: url }),
      });
      toast(t('walletOps.qrOk'), 'ok');
      await load();
    } catch (err) {
      const msg = explainError(err, t('walletOps.qrFail'));
      setError(msg);
      toast(msg, 'err');
    } finally {
      setUploading('');
      setUploadPct(0);
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
                    <img src={mediaUrl(qr)} alt="" width={96} height={96} style={{ objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 6 }} />
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
                    {uploading === id ? (
                      <p className="field-hint" role="status">
                        {t('notice.uploading')} {uploadPct}%
                      </p>
                    ) : null}
                    {uploading === id ? (
                      <div style={{ maxWidth: 200, height: 4, marginTop: 6, borderRadius: 2, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadPct}%`, height: '100%', background: '#d4e82a' }} />
                      </div>
                    ) : null}
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
