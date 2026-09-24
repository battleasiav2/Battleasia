import { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapList } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type CoinRateRow = {
  id: string;
  region: string;
  currency: string;
  rate: number;
  isActive: boolean;
};

type Draft = {
  region: string;
  currency: string;
  rate: string;
  isActive: boolean;
};

const EMPTY: Draft = { region: '', currency: '', rate: '', isActive: true };

function asRow(raw: Record<string, unknown>): CoinRateRow {
  return {
    id: String(raw.id || raw._id || ''),
    region: String(raw.region || ''),
    currency: String(raw.currency || '').toUpperCase(),
    rate: Number(raw.rate) || 0,
    isActive: raw.isActive !== false,
  };
}

export function CoinRatesPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<CoinRateRow[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [edits, setEdits] = useState<Record<string, Draft>>({});

  const load = useCallback(async () => {
    setError('');
    try {
      const payload = await api('/api/v4/shop/coins');
      const list = unwrapList<Record<string, unknown>>(payload).map(asRow);
      list.sort((a, b) => {
        if (a.currency === 'BDT') return -1;
        if (b.currency === 'BDT') return 1;
        return a.region.localeCompare(b.region) || a.currency.localeCompare(b.currency);
      });
      setRows(list);
      const next: Record<string, Draft> = {};
      for (const row of list) {
        next[row.id] = {
          region: row.region,
          currency: row.currency,
          rate: String(row.rate),
          isActive: row.isActive,
        };
      }
      setEdits(next);
    } catch (err) {
      setRows([]);
      setError(isApiError(err) ? err.message : t('rates.loadFail'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!can('shop.view') && !can('shop.edit')) {
    return <Navigate to="/403" replace />;
  }

  const canEdit = can('shop.edit') || can('shop.view');

  async function saveRow(id: string) {
    const edit = edits[id];
    if (!edit) return;
    const isBdt = edit.currency.toUpperCase() === 'BDT';
    const rateNum = isBdt ? 1 : Number(edit.rate);
    if (!edit.region.trim() || !edit.currency.trim() || !Number.isFinite(rateNum) || rateNum < 0) {
      toast(t('rates.invalid'));
      return;
    }
    setBusyId(id);
    try {
      await api(`/api/v4/shop/coins/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          region: edit.region.trim().toLowerCase(),
          currency: edit.currency.trim().toUpperCase(),
          rate: rateNum,
          isActive: edit.isActive,
        }),
      });
      toast(t('rates.saved'));
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('rates.saveFail'));
    } finally {
      setBusyId('');
    }
  }

  async function createRow() {
    const isBdt = draft.currency.toUpperCase() === 'BDT';
    const rateNum = isBdt ? 1 : Number(draft.rate);
    if (!draft.region.trim() || !draft.currency.trim() || !Number.isFinite(rateNum) || rateNum < 0) {
      toast(t('rates.invalid'));
      return;
    }
    setCreating(true);
    try {
      await api('/api/v4/shop/coins', {
        method: 'POST',
        body: JSON.stringify({
          region: draft.region.trim().toLowerCase(),
          currency: draft.currency.trim().toUpperCase(),
          rate: rateNum,
          isActive: draft.isActive,
        }),
      });
      toast(t('rates.created'));
      setDraft(EMPTY);
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('rates.createFail'));
    } finally {
      setCreating(false);
    }
  }

  async function removeRow(id: string, currency: string) {
    if (currency.toUpperCase() === 'BDT') {
      toast(t('rates.keepBase'));
      return;
    }
    if (!window.confirm(t('rates.confirmDelete'))) return;
    setBusyId(id);
    try {
      await api(`/api/v4/shop/coins/${id}`, { method: 'DELETE' });
      toast(t('rates.deleted'));
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('rates.deleteFail'));
    } finally {
      setBusyId('');
    }
  }

  function patchEdit(id: string, patch: Partial<Draft>) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  return (
    <main className="admin-body">
      <h1>{t('nav.coinRates')}</h1>
      <p className="admin-lead">{t('rates.lead')}</p>

      <div className="prize-preview" style={{ marginBottom: 16 }}>
        <small>{t('rates.tipTitle')}</small>
        <p>{t('rates.tipBody')}</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="dash-stage form-stage" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ba-muted)' }}>
          {t('rates.addTitle')}
        </h2>
        <div className="admin-form-grid" style={{ alignItems: 'end' }}>
          <label className="field">
            {t('rates.region')}
            <input
              value={draft.region}
              placeholder="nepal"
              disabled={!canEdit || creating}
              onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
            />
          </label>
          <label className="field">
            {t('rates.currency')}
            <input
              value={draft.currency}
              placeholder="NPR"
              disabled={!canEdit || creating}
              onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))}
            />
          </label>
          <label className="field">
            {t('rates.rate')}
            <input
              type="number"
              step="any"
              min="0"
              value={draft.currency.toUpperCase() === 'BDT' ? '1' : draft.rate}
              disabled={!canEdit || creating || draft.currency.toUpperCase() === 'BDT'}
              onChange={(e) => setDraft((d) => ({ ...d, rate: e.target.value }))}
            />
          </label>
          <label className="field field-check">
            <input
              type="checkbox"
              checked={draft.isActive}
              disabled={!canEdit || creating}
              onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
            />
            {t('rates.active')}
          </label>
          <div className="form-actions span-all">
            <button className="btn btn-primary" type="button" disabled={!canEdit || creating} onClick={() => void createRow()}>
              {creating ? t('rates.saving') : t('rates.add')}
            </button>
          </div>
        </div>
      </div>

      {rows === null ? (
        <p className="admin-lead">{t('list.loading')}…</p>
      ) : (
        <div className="dash-stage list-stage">
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('rates.region')}</th>
                <th>{t('rates.currency')}</th>
                <th>{t('rates.rate')}</th>
                <th>{t('rates.active')}</th>
                <th>{t('rates.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const edit = edits[row.id] || {
                  region: row.region,
                  currency: row.currency,
                  rate: String(row.rate),
                  isActive: row.isActive,
                };
                const isBdt = edit.currency.toUpperCase() === 'BDT' || row.currency === 'BDT';
                return (
                  <tr key={row.id}>
                    <td>
                      <input
                        value={edit.region}
                        disabled={!canEdit || busyId === row.id}
                        onChange={(e) => patchEdit(row.id, { region: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={edit.currency}
                        disabled={!canEdit || busyId === row.id || isBdt}
                        onChange={(e) => patchEdit(row.id, { currency: e.target.value.toUpperCase() })}
                      />
                      {isBdt ? <small className="admin-muted"> · {t('rates.base')}</small> : null}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={isBdt ? '1' : edit.rate}
                        disabled={!canEdit || busyId === row.id || isBdt}
                        onChange={(e) => patchEdit(row.id, { rate: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={edit.isActive}
                        disabled={!canEdit || busyId === row.id}
                        onChange={(e) => patchEdit(row.id, { isActive: e.target.checked })}
                      />
                    </td>
                    <td className="match-actions">
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={!canEdit || busyId === row.id}
                        onClick={() => void saveRow(row.id)}
                      >
                        {busyId === row.id ? t('rates.saving') : t('rates.save')}
                      </button>
                      {!isBdt ? (
                        <button
                          className="btn btn-ghost"
                          type="button"
                          disabled={!canEdit || busyId === row.id}
                          onClick={() => void removeRow(row.id, row.currency)}
                        >
                          {t('rates.delete')}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </main>
  );
}
