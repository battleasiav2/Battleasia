import { useEffect, useState } from 'react';
import { Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { can } from '../lib/auth';
import { SETTINGS } from '../lib/catalog';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

export function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const location = useLocation();
  const spec = SETTINGS[location.pathname];
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState('');

  useEffect(() => {
    if (!spec) return;
    api(spec.get)
      .then((payload) => {
        const data = unwrapData<unknown>(payload);
        setRaw(JSON.stringify(data ?? payload, null, 2));
      })
      .catch((err) => setError(isApiError(err) ? err.message : t('settings.loadFail')));
  }, [spec, t]);

  if (!spec) {
    return (
      <main className="admin-body">
        <h1>{t('integrity.notFound')}</h1>
      </main>
    );
  }
  if (spec.perm && !can(spec.perm)) return <Navigate to="/403" replace />;

  async function save() {
    if (!spec.put) return;
    setBusy(true);
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const body = spec.wrap ? { [spec.wrap]: parsed[spec.wrap] ?? parsed } : parsed;
      await api(spec.put, { method: 'PUT', body: JSON.stringify(body) });
      toast('Saved');
    } catch (err) {
      toast(isApiError(err) ? err.message : t('settings.fail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <h1>{t(spec.title)}</h1>
      <p className="admin-lead">{t('settings.lead')}</p>
      {error ? <p className="form-error">{error}</p> : null}
      <textarea className="json-box" value={raw} onChange={(e) => setRaw(e.target.value)} />
      <div className="table-tools" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" type="button" disabled={busy || !spec.put} onClick={() => void save()}>
          {busy ? t('settings.saving') : t('settings.save')}
        </button>
        {spec.testPath ? (
          <>
            <input value={testTo} placeholder={t('settings.testEmail')} onChange={(e) => setTestTo(e.target.value)} />
            <button
              className="btn btn-ghost"
              type="button"
              onClick={async () => {
                try {
                  await api(spec.testPath!, { method: 'POST', body: JSON.stringify({ to: testTo.trim() }) });
                  toast('Test mail sent');
                } catch (err) {
                  toast(isApiError(err) ? err.message : 'Test failed');
                }
              }}
            >
              Send test
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
}
