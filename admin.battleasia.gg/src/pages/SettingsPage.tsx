import { useEffect, useState } from 'react';
import { Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { api, unwrapData, explainError } from '../lib/api';
import { can } from '../lib/auth';
import { SETTINGS } from '../lib/catalog';
import { useI18n } from '../lib/i18n';
import {
  AdminSettingsFormFields,
  buildSettingsPutBody,
  normalizeSettingsLoad,
  type SettingsFormState,
} from './adminSettingsForms';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

export function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const location = useLocation();
  const spec = SETTINGS[location.pathname];
  const [formState, setFormState] = useState<SettingsFormState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState('');

  useEffect(() => {
    if (!spec?.form) return;
    setLoading(true);
    setError('');
    api(spec.get)
      .then((payload) => {
        const data = unwrapData<unknown>(payload);
        setFormState(normalizeSettingsLoad(spec.form!, data ?? payload));
      })
      .catch((err) => setError(explainError(err, t('settings.loadFail'))))
      .finally(() => setLoading(false));
  }, [spec, t]);

  if (!spec) {
    return (
      <main className="admin-body">
        <h1>{t('integrity.notFound')}</h1>
      </main>
    );
  }
  if (spec.perm && !can(spec.perm)) return <Navigate to="/403" replace />;

  if (!spec.form) {
    return (
      <main className="admin-body">
        <h1>{t(spec.title)}</h1>
        <p className="admin-lead">{t('integrity.notFound')}</p>
      </main>
    );
  }

  async function save() {
    if (!spec.put || !spec.form) return;
    setBusy(true);
    setError('');
    try {
      const body = buildSettingsPutBody(spec.form, formState);
      await api(spec.put, { method: 'PUT', body: JSON.stringify(body) });
      toast(t('settings.saved'), 'ok');
    } catch (err) {
      const msg = explainError(err, t('settings.saveFail'));
      setError(msg);
      toast(msg, 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.system')}</p>
        <h1>{t(spec.title)}</h1>
        <p className="admin-lead">{t('settings.formLead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage form-stage">
        {loading ? (
          <p className="admin-lead">{t('list.loading')}…</p>
        ) : (
          <form
            className="admin-form"
            style={{ maxWidth: 720 }}
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <AdminSettingsFormFields
              form={spec.form}
              state={formState}
              disabled={busy}
              onChange={setFormState}
            />
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={busy || !spec.put}>
                {busy ? t('settings.saving') : t('settings.save')}
              </button>
              {spec.testPath ? (
                <>
                  <input
                    value={testTo}
                    placeholder={t('settings.testEmail')}
                    onChange={(e) => setTestTo(e.target.value)}
                    style={{
                      minWidth: 0,
                      flex: '1 1 180px',
                      minHeight: 40,
                      borderRadius: 12,
                      border: '1px solid var(--ba-hair)',
                      background: 'var(--ba-input)',
                      color: 'var(--ba-text)',
                      padding: '0 12px',
                    }}
                  />
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={async () => {
                      try {
                        await api(spec.testPath!, { method: 'POST', body: JSON.stringify({ to: testTo.trim() }) });
                        toast(t('mail.testOk'), 'ok');
                      } catch (err) {
                        const msg = explainError(err, t('settings.saveFail'));
                        setError(msg);
                        toast(msg, 'err');
                      }
                    }}
                  >
                    {t('mail.sendTest')}
                  </button>
                </>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
