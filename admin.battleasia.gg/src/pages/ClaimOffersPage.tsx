import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, unwrapData, explainError } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

type Offer = {
  id: string;
  title: string;
  description: string;
  bacAmount: number;
  startsAt: string;
  endsAt: string | null;
  active: boolean;
  maxClaims: number;
  claimedCount: number;
};

type Form = {
  id: string;
  title: string;
  description: string;
  bacAmount: string;
  startsAt: string;
  endsAt: string;
  maxClaims: string;
  active: boolean;
};

const EMPTY: Form = {
  id: '',
  title: '',
  description: '',
  bacAmount: '10',
  startsAt: '',
  endsAt: '',
  maxClaims: '0',
  active: true,
};

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function ClaimOffersPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Offer[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api('/api/v3/engagement/offers');
      setRows(unwrapData<Offer[]>(payload) || []);
    } catch (err) {
      setError(explainError(err, t('settings.loadFail')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!can('engagement.edit')) return <Navigate to="/403" replace />;

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const startsAt = toIso(form.startsAt);
    if (!startsAt) {
      toast(t('offers.needStart'), 'err');
      return;
    }
    setBusy(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        bacAmount: Number(form.bacAmount),
        startsAt,
        endsAt: toIso(form.endsAt),
        maxClaims: Number(form.maxClaims) || 0,
        active: form.active,
      };
      if (form.id) {
        await api(`/api/v3/engagement/offers/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/api/v3/engagement/offers', { method: 'POST', body: JSON.stringify(body) });
      }
      setForm(EMPTY);
      toast(t('offers.save'), 'ok');
      await load();
    } catch (err) {
      toast(explainError(err, t('settings.fail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await api(`/api/v3/engagement/offers/${id}`, { method: 'DELETE' });
      if (form.id === id) setForm(EMPTY);
      toast(t('offers.deleted'), 'ok');
      await load();
    } catch (err) {
      toast(explainError(err, t('settings.fail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.engagement')}</p>
        <h1>{t('nav.claimOffers')}</h1>
        <p className="admin-lead">{t('offers.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage form-stage">
        <form className="admin-form" onSubmit={(event) => void save(event)}>
          <label className="field">
            {t('offers.title')}
            <input value={form.title} maxLength={80} required onChange={(e) => update('title', e.target.value)} />
          </label>
          <label className="field">
            {t('offers.note')}
            <input value={form.description} maxLength={240} onChange={(e) => update('description', e.target.value)} />
          </label>
          <label className="field">
            {t('offers.bac')}
            <input
              type="number"
              min={1}
              max={100000}
              required
              value={form.bacAmount}
              onChange={(e) => update('bacAmount', e.target.value)}
            />
          </label>
          <label className="field">
            {t('offers.starts')}
            <input type="datetime-local" required value={form.startsAt} onChange={(e) => update('startsAt', e.target.value)} />
          </label>
          <label className="field">
            {t('offers.ends')}
            <input type="datetime-local" value={form.endsAt} onChange={(e) => update('endsAt', e.target.value)} />
          </label>
          <label className="field">
            {t('offers.cap')}
            <input type="number" min={0} value={form.maxClaims} onChange={(e) => update('maxClaims', e.target.value)} />
          </label>
          <label className="field-check">
            <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} />
            {t('offers.active')}
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {form.id ? t('offers.save') : t('offers.create')}
          </button>
        </form>
      </div>
      {loading ? <p className="admin-lead">{t('list.loading')}…</p> : null}
      {!loading && rows.length === 0 ? <p className="admin-lead">{t('offers.empty')}</p> : null}
      <ul className="admin-list">
        {rows.map((row) => (
          <li key={row.id}>
            <strong>{row.title}</strong>
            <span>
              {row.bacAmount} BAC · {new Date(row.startsAt).toLocaleString()} · {row.claimedCount} {t('offers.claimed')}
              {row.active ? '' : ' · off'}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setForm({
                  id: row.id,
                  title: row.title,
                  description: row.description || '',
                  bacAmount: String(row.bacAmount),
                  startsAt: toLocalInput(row.startsAt),
                  endsAt: toLocalInput(row.endsAt),
                  maxClaims: String(row.maxClaims || 0),
                  active: row.active,
                })
              }
            >
              {t('offers.save')}
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void remove(row.id)}>
              {t('offers.delete')}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
