import { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { ReceiptLightbox } from '../components/ReceiptLightbox';
import { api, isApiError, newIdempotencyKey, unwrapData, unwrapList } from '../lib/api';
import { cell, downloadCsv, downloadExcel, pick, rangeFor, rowId, toCsv } from '../lib/format';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

const COLS = {
  deposit: ['status', 'username', 'coin_amount', 'payment_amount', 'transaction_id', 'created_at'],
  withdrawal: ['status', 'username', 'coin_amount', 'wallet_type', 'created_at'],
};

const CHIPS = ['all', 'today', '7d', 'month', 'custom'] as const;

export function PaymentsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const kind = useLocation().pathname.includes('withdrawal') ? 'withdrawal' : 'deposit';
  const base = kind === 'deposit' ? '/api/v4/payments/deposit-history' : '/api/v4/payments/withdrawal-history';
  const [rows, setRows] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; action: string; amount: number } | null>(null);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [lightbox, setLightbox] = useState<{ src: string; trx?: string; phone?: string } | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [threshold, setThreshold] = useState(1000);
  const kindLabel = t(`pay.${kind}`);

  function fill(key: string, vars: Record<string, string | number>) {
    return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), t(key));
  }

  function load() {
    const range = rangeFor(chip, { from, to });
    const params = new URLSearchParams({ limit: '50' });
    if (search.trim().length >= 2) params.set('search', search.trim());
    if (range.startDate) params.set('startDate', range.startDate);
    if (range.endDate) params.set('endDate', range.endDate);
    api(`${base}?${params}`)
      .then((payload) => setRows(unwrapList<Record<string, unknown>>(payload)))
      .catch((err) => {
        setRows([]);
        setError(isApiError(err) ? err.message : t('list.loadFail'));
      });
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 300);
    return () => window.clearTimeout(timer);
  }, [base, search, chip, from, to]);

  useEffect(() => {
    api('/api/v3/integrity/ops')
      .then((payload) => {
        const n = Number(unwrapData<{ highValueWithdrawBac?: number }>(payload)?.highValueWithdrawBac);
        if (Number.isFinite(n) && n > 0) setThreshold(n);
      })
      .catch(() => undefined);
  }, []);

  async function run(id: string, action: string) {
    const path = `${base}/${id}/${action}`;
    await api(path, {
      method: 'PATCH',
      body: JSON.stringify({ rejection_reason: reason, password }),
      idempotencyKey: newIdempotencyKey(),
    });
    toast(fill('pay.saved', { action: t(`pay.${action}`) }));
    setConfirm(null);
    setPassword('');
    load();
  }

  const cols = COLS[kind];

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.money')}</p>
        <h1>{kindLabel}</h1>
        <p className="admin-lead">{fill('pay.lead', { n: threshold })}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage list-stage">
      <div className="table-tools">
        <input value={search} placeholder={t('list.search')} onChange={(e) => setSearch(e.target.value)} />
        {CHIPS.map((id) => (
          <button key={id} type="button" className={`chip ${chip === id ? 'on' : ''}`} onClick={() => setChip(id)}>
            {t(`pay.chip.${id}`)}
          </button>
        ))}
        {chip === 'custom' ? (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label={t('list.from')} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label={t('list.to')} />
          </>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={() => rows && downloadCsv(`${kind}.csv`, toCsv(rows, cols))}>
          {t('list.csv')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => rows && downloadExcel(`${kind}.xls`, rows, cols)}>
          {t('list.excel')}
        </button>
      </div>
      {rows === null ? (
        <p className="admin-lead">{t('list.loading')}…</p>
      ) : rows.length === 0 ? (
        <div className="admin-empty">
          <h2>{fill('pay.empty', { kind: kindLabel })}</h2>
          <p>{t('pay.emptyLead')}</p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearch('');
              setChip('all');
              setFrom('');
              setTo('');
            }}
          >
            {t('list.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label={t('pay.selectAll')} onChange={(e) => setSelected(e.target.checked ? rows.map(rowId) : [])} />
                </th>
                {cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>{t('pay.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = rowId(row);
                const amount = Number(row.coin_amount || row.amount || 0);
                const shot = String(row.receipt || row.screenshot || row.image || '');
                return (
                  <tr key={id}>
                    <td>
                      <input type="checkbox" checked={selected.includes(id)} onChange={(e) => setSelected((cur) => (e.target.checked ? [...cur, id] : cur.filter((x) => x !== id)))} />
                    </td>
                    {cols.map((c) => (
                      <td key={c}>{cell(pick(row, c))}</td>
                    ))}
                    <td>
                      <button className="btn btn-ghost" type="button" onClick={() => setConfirm({ id, action: 'approve', amount })}>
                        {t('pay.approve')}
                      </button>
                      {kind === 'withdrawal' ? (
                        <button className="btn btn-ghost" type="button" onClick={() => setConfirm({ id, action: 'complete', amount })}>
                          {t('pay.complete')}
                        </button>
                      ) : null}
                      <button className="btn btn-danger" type="button" onClick={() => setConfirm({ id, action: 'reject', amount })}>
                        {t('pay.reject')}
                      </button>
                      {shot ? (
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() =>
                            setLightbox({
                              src: shot,
                              trx: String(row.transaction_id || row.trxId || ''),
                              phone: String(row.phone || row.sender_number || row.wallet_number || ''),
                            })
                          }
                        >
                          {t('pay.receipt')}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
      {selected.length ? (
        <div className="bulk-bar">
          <span>
            {selected.length} {t('list.selected')}
          </span>
          <input value={reason} placeholder={t('list.rejectPh')} onChange={(e) => setReason(e.target.value)} />
          {(rows || []).some((r) => selected.includes(rowId(r)) && Number(r.coin_amount || r.amount || 0) >= threshold) ? (
            <label className="field">
              {t('pay.password')}
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const high = (rows || []).some((r) => selected.includes(rowId(r)) && Number(r.coin_amount || r.amount || 0) >= threshold);
              if (high && !password) {
                toast(fill('pay.needPassword', { n: threshold }));
                return;
              }
              if (!window.confirm(fill('pay.confirmApprove', { n: selected.length, kind: kindLabel }))) return;
              void Promise.all(selected.map((id) => run(id, 'approve'))).catch((err) => toast(isApiError(err) ? err.message : t('pay.bulkFail')));
            }}
          >
            {t('pay.bulkApprove')}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (!reason.trim()) {
                toast(t('pay.needReason'));
                return;
              }
              if (!window.confirm(fill('pay.confirmReject', { n: selected.length }))) return;
              void Promise.all(selected.map((id) => run(id, 'reject'))).catch((err) => toast(isApiError(err) ? err.message : t('pay.bulkFail')));
            }}
          >
            {t('pay.bulkReject')}
          </button>
        </div>
      ) : null}
      {confirm ? (
        <div className="play-sheet" role="dialog">
          <button className="play-sheet-bg" type="button" aria-label={t('chrome.close')} onClick={() => setConfirm(null)} />
          <div className="play-sheet-card">
            <h2>{fill('pay.confirmTitle', { action: t(`pay.${confirm.action}`), n: confirm.amount })}</h2>
            {confirm.action === 'reject' ? (
              <label className="field">
                {t('pay.reason')}
                <input value={reason} onChange={(e) => setReason(e.target.value)} />
              </label>
            ) : null}
            {confirm.amount >= threshold ? (
              <label className="field">
                {t('pay.password')}
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            ) : null}
            <div className="table-tools">
              <button className="btn btn-ghost" type="button" onClick={() => setConfirm(null)}>
                {t('pay.cancel')}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  if (confirm.amount >= threshold && !password) {
                    toast(fill('pay.needPassword', { n: threshold }));
                    return;
                  }
                  void run(confirm.id, confirm.action).catch((err) => toast(isApiError(err) ? err.message : t('pay.failed')));
                }}
              >
                {fill('pay.confirmGo', { action: t(`pay.${confirm.action}`), n: confirm.amount })}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {lightbox ? (
        <ReceiptLightbox
          src={lightbox.src}
          trx={lightbox.trx}
          phone={lightbox.phone}
          onClose={() => setLightbox(null)}
          onCopy={(text) => {
            void navigator.clipboard.writeText(text);
            toast(t('pay.copied'));
          }}
        />
      ) : null}
    </main>
  );
}
