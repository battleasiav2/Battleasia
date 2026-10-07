import { useCallback, useMemo, useState, useEffect } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData, unwrapList } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type Pack = {
  id: string;
  amount: number;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  isActive: boolean;
};

type Draft = {
  amount: string;
  discount: string;
  image: string;
  isActive: boolean;
};

const EMPTY: Draft = { amount: '', discount: '', image: '', isActive: true };

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function quote(amountRaw: string, discountRaw: string) {
  const amount = Number(amountRaw);
  const discount = discountRaw.trim() === '' ? 0 : Number(discountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(discount) || discount < 0 || discount > 90) return null;
  const original = Math.round(amount * 0.05 * 100) / 100;
  const price = Math.round(original * (1 - discount / 100) * 100) / 100;
  return { original, price, discount };
}

function asPack(raw: Record<string, unknown>): Pack {
  return {
    id: String(raw.id || raw._id || ''),
    amount: Number(raw.amount) || 0,
    price: Number(raw.price) || 0,
    originalPrice: Number(raw.originalPrice) || 0,
    discountPercent: Number(raw.discountPercent) || 0,
    image: String(raw.image || ''),
    isActive: raw.isActive !== false,
  };
}

export function BacShopPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Pack[] | null>(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState('');
  const [busyId, setBusyId] = useState('');
  const [edits, setEdits] = useState<Record<string, Draft>>({});

  const preview = useMemo(() => quote(draft.amount, draft.discount), [draft.amount, draft.discount]);

  const load = useCallback(async () => {
    setError('');
    try {
      const payload = await api('/api/v4/shop/items?includeInactive=true&limit=100');
      const list = unwrapList<Record<string, unknown>>(payload).map(asPack);
      list.sort((a, b) => a.amount - b.amount);
      setRows(list);
      const next: Record<string, Draft> = {};
      for (const row of list) {
        next[row.id] = {
          amount: String(row.amount),
          discount: String(row.discountPercent || 0),
          image: row.image,
          isActive: row.isActive,
        };
      }
      setEdits(next);
    } catch (err) {
      setRows([]);
      setError(isApiError(err) ? err.message : t('bacShop.loadFail'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!can('shop.view') && !can('shop.edit')) {
    return <Navigate to="/403" replace />;
  }

  const canEdit = can('shop.edit') || can('shop.view');

  async function uploadImage(file: File, target: 'draft' | string) {
    setUploading(target);
    try {
      const body = new FormData();
      body.append('file', file);
      const payload = await api('/api/v1/files/upload/shop', { method: 'POST', body });
      const data = unwrapData<{ url?: string }>(payload);
      const url = String(data?.url || '');
      if (!url) throw new Error('No url');
      if (target === 'draft') setDraft((d) => ({ ...d, image: url }));
      else setEdits((prev) => ({ ...prev, [target]: { ...prev[target], image: url } }));
      toast(t('bacShop.imageOk'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('bacShop.imageFail'));
    } finally {
      setUploading('');
    }
  }

  async function createPack() {
    const amount = Number(draft.amount);
    const discount = draft.discount.trim() === '' ? 0 : Number(draft.discount);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(discount) || discount < 0 || discount > 90) {
      toast(t('bacShop.invalid'));
      return;
    }
    setCreating(true);
    try {
      await api('/api/v4/shop/items', {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.round(amount),
          discountPercent: discount,
          image: draft.image,
          isActive: draft.isActive,
        }),
      });
      toast(t('bacShop.created'));
      setDraft(EMPTY);
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('bacShop.createFail'));
    } finally {
      setCreating(false);
    }
  }

  async function saveRow(id: string) {
    const edit = edits[id];
    if (!edit) return;
    const amount = Number(edit.amount);
    const discount = edit.discount.trim() === '' ? 0 : Number(edit.discount);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(discount) || discount < 0 || discount > 90) {
      toast(t('bacShop.invalid'));
      return;
    }
    setBusyId(id);
    try {
      await api(`/api/v4/shop/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          amount: Math.round(amount),
          discountPercent: discount,
          image: edit.image,
          isActive: edit.isActive,
        }),
      });
      toast(t('bacShop.saved'));
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('bacShop.saveFail'));
    } finally {
      setBusyId('');
    }
  }

  async function removeRow(id: string) {
    if (!window.confirm(t('bacShop.confirmDelete'))) return;
    setBusyId(id);
    try {
      await api(`/api/v4/shop/items/${id}`, { method: 'DELETE' });
      toast(t('bacShop.deleted'));
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('bacShop.deleteFail'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('chrome.shop')}</p>
        <h1>{t('nav.bacShop')}</h1>
        <p className="admin-lead">{t('bacShop.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="dash-stage form-stage" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ba-muted)' }}>
          {t('bacShop.addTitle')}
        </h2>
        <div className="admin-form-grid" style={{ alignItems: 'end' }}>
          <label className="field">
            {t('bacShop.amount')}
            <input
              type="number"
              min="1"
              step="1"
              value={draft.amount}
              placeholder="100"
              disabled={!canEdit || creating}
              onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
            />
          </label>
          <label className="field">
            {t('bacShop.discount')}
            <input
              type="number"
              min="0"
              max="90"
              step="0.1"
              value={draft.discount}
              placeholder="10"
              disabled={!canEdit || creating}
              onChange={(e) => setDraft((d) => ({ ...d, discount: e.target.value }))}
            />
          </label>
          <label className="field">
            {t('bacShop.image')}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={!canEdit || creating || uploading === 'draft'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file, 'draft');
                e.target.value = '';
              }}
            />
          </label>
          <label className="field field-check">
            <input
              type="checkbox"
              checked={draft.isActive}
              disabled={!canEdit || creating}
              onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
            />
            {t('bacShop.active')}
          </label>
          <div className="form-actions span-all" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {draft.image ? (
              <img src={draft.image} alt="" width={56} height={56} style={{ objectFit: 'contain', borderRadius: 8 }} />
            ) : null}
            <p className="admin-lead" style={{ margin: 0 }}>
              {preview
                ? `${t('bacShop.pay')} ${money(preview.price)} · ${t('bacShop.list')} ${money(preview.original)}`
                : t('bacShop.priceHint')}
            </p>
            <button className="btn btn-primary" type="button" disabled={!canEdit || creating} onClick={() => void createPack()}>
              {creating ? t('bacShop.saving') : t('bacShop.create')}
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
                  <th>{t('bacShop.image')}</th>
                  <th>{t('bacShop.amount')}</th>
                  <th>{t('bacShop.discount')}</th>
                  <th>{t('bacShop.price')}</th>
                  <th>{t('bacShop.active')}</th>
                  <th>{t('bacShop.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>{t('list.empty')}</td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const edit = edits[row.id] || {
                      amount: String(row.amount),
                      discount: String(row.discountPercent),
                      image: row.image,
                      isActive: row.isActive,
                    };
                    const rowQuote = quote(edit.amount, edit.discount);
                    return (
                      <tr key={row.id}>
                        <td>
                          {edit.image ? (
                            <img src={edit.image} alt="" width={40} height={40} style={{ objectFit: 'contain' }} />
                          ) : (
                            <span className="admin-muted">—</span>
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            disabled={!canEdit || busyId === row.id || uploading === row.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadImage(file, row.id);
                              e.target.value = '';
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={edit.amount}
                            disabled={!canEdit || busyId === row.id}
                            onChange={(e) =>
                              setEdits((prev) => ({ ...prev, [row.id]: { ...edit, amount: e.target.value } }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            step="0.1"
                            value={edit.discount}
                            disabled={!canEdit || busyId === row.id}
                            onChange={(e) =>
                              setEdits((prev) => ({ ...prev, [row.id]: { ...edit, discount: e.target.value } }))
                            }
                          />
                        </td>
                        <td>{rowQuote ? money(rowQuote.price) : '—'}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={edit.isActive}
                            disabled={!canEdit || busyId === row.id}
                            onChange={(e) =>
                              setEdits((prev) => ({ ...prev, [row.id]: { ...edit, isActive: e.target.checked } }))
                            }
                          />
                        </td>
                        <td className="match-actions">
                          <button
                            className="btn btn-primary"
                            type="button"
                            disabled={!canEdit || busyId === row.id}
                            onClick={() => void saveRow(row.id)}
                          >
                            {t('bacShop.save')}
                          </button>
                          <button
                            className="btn btn-ghost"
                            type="button"
                            disabled={!canEdit || busyId === row.id}
                            onClick={() => void removeRow(row.id)}
                          >
                            {t('bacShop.delete')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
