import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type MailSettingsForm = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
};

const DEFAULT_FORM: MailSettingsForm = {
  enabled: false,
  smtpHost: 'smtp.hostinger.com',
  smtpPort: 465,
  secure: true,
  smtpUser: '',
  smtpPass: '',
  fromName: 'BattleAsia',
  fromEmail: '',
};

export function MailSettingsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [form, setForm] = useState<MailSettingsForm>(DEFAULT_FORM);
  const [testTo, setTestTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api('/api/v2/app-settings/mail-settings');
      const data = unwrapData<Partial<MailSettingsForm>>(payload) || {};
      setForm({
        enabled: data.enabled === true,
        smtpHost: data.smtpHost || 'smtp.hostinger.com',
        smtpPort: Number(data.smtpPort) || 465,
        secure: data.secure === true || Number(data.smtpPort) === 465,
        smtpUser: data.smtpUser || '',
        smtpPass: data.smtpPass || '',
        fromName: data.fromName || 'BattleAsia',
        fromEmail: data.fromEmail || '',
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

  function update<K extends keyof MailSettingsForm>(key: K, value: MailSettingsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload = await api('/api/v2/app-settings/mail-settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const data = unwrapData<Partial<MailSettingsForm>>(payload);
      if (data) {
        setForm((prev) => ({
          ...prev,
          ...data,
          smtpPass: data.smtpPass || prev.smtpPass,
        }));
      }
      toast(t('mail.saved'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('settings.fail'));
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    if (!testTo.trim()) {
      toast(t('mail.testRequired'));
      return;
    }
    setTesting(true);
    try {
      await api('/api/v2/app-settings/mail-settings/test', {
        method: 'POST',
        body: JSON.stringify({ to: testTo.trim() }),
      });
      toast(t('mail.testOk'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('mail.testFail'));
    } finally {
      setTesting(false);
    }
  }

  return (
    <main className="admin-body">
      <h1>{t('page.mail')}</h1>
      <p className="admin-lead">{t('mail.lead')}</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="mail-settings match-form-grid dash-stage form-stage">
        <div className="prize-preview" style={{ marginBottom: 16 }}>
          <small>{t('mail.tipTitle')}</small>
          <p>{t('mail.tipBody')}</p>
        </div>

        <div className="form-toggles" style={{ marginBottom: 14 }}>
          <label className="field-check">
            <input
              type="checkbox"
              checked={form.enabled}
              disabled={loading}
              onChange={(e) => update('enabled', e.target.checked)}
            />
            {t('mail.enabled')}
          </label>
        </div>

        <div className="mail-grid">
          <label className="field">
            {t('mail.host')}
            <input
              value={form.smtpHost}
              disabled={loading}
              placeholder="smtp.hostinger.com"
              onChange={(e) => update('smtpHost', e.target.value)}
            />
          </label>
          <label className="field">
            {t('mail.port')}
            <input
              type="number"
              value={form.smtpPort}
              disabled={loading}
              onChange={(e) => {
                const port = Number(e.target.value) || 465;
                setForm((prev) => ({
                  ...prev,
                  smtpPort: port,
                  secure: port === 465 ? true : port === 587 ? false : prev.secure,
                }));
              }}
            />
          </label>
          <label className="field field-check span-all">
            <input
              type="checkbox"
              checked={form.secure}
              disabled={loading}
              onChange={(e) => update('secure', e.target.checked)}
            />
            {t('mail.secure')}
          </label>
          <label className="field">
            {t('mail.user')}
            <input
              value={form.smtpUser}
              disabled={loading}
              placeholder="no-reply@battleasia.gg"
              onChange={(e) => update('smtpUser', e.target.value)}
            />
          </label>
          <label className="field">
            {t('mail.pass')}
            <input
              type="password"
              value={form.smtpPass}
              disabled={loading}
              placeholder="********"
              onChange={(e) => update('smtpPass', e.target.value)}
            />
            <span className="field-hint">{t('mail.passHint')}</span>
          </label>
          <label className="field">
            {t('mail.fromName')}
            <input
              value={form.fromName}
              disabled={loading}
              onChange={(e) => update('fromName', e.target.value)}
            />
          </label>
          <label className="field">
            {t('mail.fromEmail')}
            <input
              type="email"
              value={form.fromEmail}
              disabled={loading}
              placeholder="no-reply@battleasia.gg"
              onChange={(e) => update('fromEmail', e.target.value)}
            />
          </label>
        </div>

        <div className="form-actions" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" type="button" disabled={loading || busy} onClick={() => void save()}>
            {busy ? t('settings.saving') : t('mail.save')}
          </button>
          <button className="btn btn-ghost" type="button" disabled={loading || busy} onClick={() => void load()}>
            {t('mail.reset')}
          </button>
        </div>

        <div className="prize-preview" style={{ marginTop: 20 }}>
          <small>{t('mail.testTitle')}</small>
          <div className="form-actions" style={{ marginTop: 10 }}>
            <input
              value={testTo}
              placeholder={t('settings.testEmail')}
              onChange={(e) => setTestTo(e.target.value)}
              style={{
                minWidth: 0,
                flex: '1 1 200px',
                minHeight: 40,
                borderRadius: 12,
                border: '1px solid var(--ba-hair)',
                background: 'var(--ba-input)',
                color: 'var(--ba-text)',
                padding: '0 12px',
              }}
            />
            <button className="btn btn-ghost" type="button" disabled={testing || loading} onClick={() => void sendTest()}>
              {testing ? t('mail.sending') : t('mail.sendTest')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
