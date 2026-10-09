import { useEffect, useState } from 'react';
import { Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { api, unwrapData, explainError } from '../lib/api';
import { can } from '../lib/auth';
import { SETTINGS } from '../lib/catalog';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

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
      .catch((err) => setError(explainError(err, t('settings.loadFail'))));
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
    setError('');
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const body = spec.wrap ? { [spec.wrap]: parsed[spec.wrap] ?? parsed } : parsed;
      await api(spec.put, { method: 'PUT', body: JSON.stringify(body) });
      toast(t('settings.saved'), 'ok');
    } catch (err) {
      const msg = explainError(err, t('settings.fail'));
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
        <p className="admin-lead">{t('settings.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage form-stage">
        <form
          className="admin-form"
          style={{ maxWidth: 'none' }}
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <textarea className="json-box" value={raw} onChange={(e) => setRaw(e.target.value)} spellCheck={false} />
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
                      const msg = explainError(err, t('settings.fail'));
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
      </div>
    </main>
  );
}
