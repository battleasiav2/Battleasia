import { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type PremiumForm = {
  premiumDuration: number;
  premiumPrice: number;
};

export function PremiumSettingsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [form, setForm] = useState<PremiumForm>({ premiumDuration: 30, premiumPrice: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api('/api/v3/users/premium/details');
      const data = unwrapData<{ premium?: Partial<PremiumForm> } & Partial<PremiumForm>>(payload);
      const premium = data?.premium ?? data ?? {};
      setForm({
        premiumDuration: Number(premium.premiumDuration) || 30,
        premiumPrice: Number(premium.premiumPrice) || 0,
      });
    } catch (err) {
      setError(isApiError(err) ? err.message : t('settings.loadFail'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!can('users.view') && !can('users.edit')) return <Navigate to="/403" replace />;

  async function save() {
    if (!can('users.edit')) {
      toast(t('premium.noEdit'));
      return;
    }
    const duration = Number(form.premiumDuration);
    const price = Number(form.premiumPrice);
    if (!Number.isFinite(duration) || duration < 1) {
      toast(t('premium.badDuration'));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast(t('premium.badPrice'));
      return;
    }
    setBusy(true);
    try {
      await api('/api/v3/users/premium/update', {
        method: 'PUT',
        body: JSON.stringify({ premiumDuration: duration, premiumPrice: price }),
      });
      toast(t('premium.saved'));
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('settings.fail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.users')}</p>
        <h1>{t('nav.premium')}</h1>
        <p className="admin-lead">{t('premium.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {loading ? (
        <p className="admin-lead">{t('list.loading')}…</p>
      ) : (
        <div className="dash-stage form-stage">
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="admin-form-grid">
              <label className="field">
                {t('premium.duration')}
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.premiumDuration}
                  onChange={(e) => setForm((prev) => ({ ...prev, premiumDuration: Number(e.target.value) }))}
                />
                <span className="field-hint">{t('premium.durationHint')}</span>
              </label>
              <label className="field">
                {t('premium.price')}
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.premiumPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, premiumPrice: Number(e.target.value) }))}
                />
                <span className="field-hint">{t('premium.priceHint')}</span>
              </label>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={busy || !can('users.edit')}>
                {busy ? t('settings.saving') : t('settings.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
