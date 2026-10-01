import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type OAuthForm = {
  redirectBase: string;
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  discordEnabled: boolean;
  discordClientId: string;
  discordClientSecret: string;
  googleCallback: string;
  discordCallback: string;
};

const DEFAULT_FORM: OAuthForm = {
  redirectBase: '',
  googleEnabled: false,
  googleClientId: '',
  googleClientSecret: '',
  discordEnabled: false,
  discordClientId: '',
  discordClientSecret: '',
  googleCallback: '',
  discordCallback: '',
};

export function OAuthSettingsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [form, setForm] = useState<OAuthForm>(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api('/api/v2/app-settings/oauth-settings');
      const data = unwrapData<Partial<OAuthForm>>(payload) || {};
      setForm({ ...DEFAULT_FORM, ...data, googleEnabled: data.googleEnabled === true, discordEnabled: data.discordEnabled === true });
    } catch (err) {
      setError(isApiError(err) ? err.message : t('settings.loadFail'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof OAuthForm>(key: K, value: OAuthForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload = await api('/api/v2/app-settings/oauth-settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const data = unwrapData<Partial<OAuthForm>>(payload);
      if (data) {
        setForm((prev) => ({
          ...prev,
          ...data,
          googleClientSecret: data.googleClientSecret || prev.googleClientSecret,
          discordClientSecret: data.discordClientSecret || prev.discordClientSecret,
        }));
      }
      toast(t('oauth.saved'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('settings.fail'));
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast(t('oauth.copied'));
    } catch {
      toast(t('settings.fail'));
    }
  }

  const origin = form.redirectBase.replace(/\/$/, '');
  const googleCallback = origin ? `${origin}/api/v2/users/oauth/google/callback` : form.googleCallback;
  const discordCallback = origin ? `${origin}/api/v2/users/oauth/discord/callback` : form.discordCallback;

  return (
    <main className="admin-body">
      <h1>{t('page.oauth')}</h1>
      <p className="admin-lead">{t('oauth.lead')}</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="mail-settings match-form-grid dash-stage form-stage">
        <div className="prize-preview" style={{ marginBottom: 16 }}>
          <small>{t('oauth.tipTitle')}</small>
          <p>{t('oauth.tipBody')}</p>
        </div>

        <label className="field">
          {t('oauth.base')}
          <input
            value={form.redirectBase}
            disabled={loading}
            placeholder="https://battleasia.gg"
            onChange={(e) => update('redirectBase', e.target.value)}
          />
          <span className="field-hint">{t('oauth.baseHint')}</span>
        </label>

        <div className="prize-preview" style={{ marginTop: 18 }}>
          <small>Google</small>
          <div className="form-toggles" style={{ margin: '12px 0' }}>
            <label className="field-check">
              <input
                type="checkbox"
                checked={form.googleEnabled}
                disabled={loading}
                onChange={(e) => update('googleEnabled', e.target.checked)}
              />
              {t('oauth.googleOn')}
            </label>
          </div>
          <div className="mail-grid">
            <label className="field">
              {t('oauth.clientId')}
              <input value={form.googleClientId} disabled={loading} onChange={(e) => update('googleClientId', e.target.value)} />
            </label>
            <label className="field">
              {t('oauth.clientSecret')}
              <input
                type="password"
                value={form.googleClientSecret}
                disabled={loading}
                placeholder="********"
                onChange={(e) => update('googleClientSecret', e.target.value)}
              />
              <span className="field-hint">{t('oauth.secretHint')}</span>
            </label>
          </div>
          <CallbackRow label={t('oauth.callback')} value={googleCallback} onCopy={() => void copy(googleCallback)} copyLabel={t('oauth.copy')} />
        </div>

        <div className="prize-preview" style={{ marginTop: 18 }}>
          <small>Discord</small>
          <div className="form-toggles" style={{ margin: '12px 0' }}>
            <label className="field-check">
              <input
                type="checkbox"
                checked={form.discordEnabled}
                disabled={loading}
                onChange={(e) => update('discordEnabled', e.target.checked)}
              />
              {t('oauth.discordOn')}
            </label>
          </div>
          <div className="mail-grid">
            <label className="field">
              {t('oauth.clientId')}
              <input value={form.discordClientId} disabled={loading} onChange={(e) => update('discordClientId', e.target.value)} />
            </label>
            <label className="field">
              {t('oauth.clientSecret')}
              <input
                type="password"
                value={form.discordClientSecret}
                disabled={loading}
                placeholder="********"
                onChange={(e) => update('discordClientSecret', e.target.value)}
              />
              <span className="field-hint">{t('oauth.secretHint')}</span>
            </label>
          </div>
          <CallbackRow label={t('oauth.callback')} value={discordCallback} onCopy={() => void copy(discordCallback)} copyLabel={t('oauth.copy')} />
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" type="button" disabled={loading || busy} onClick={() => void save()}>
            {busy ? t('settings.saving') : t('oauth.save')}
          </button>
          <button className="btn btn-ghost" type="button" disabled={loading || busy} onClick={() => void load()}>
            {t('mail.reset')}
          </button>
        </div>
      </div>
    </main>
  );
}

function CallbackRow({
  label,
  value,
  onCopy,
  copyLabel,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copyLabel: string;
}) {
  return (
    <label className="field" style={{ marginTop: 12 }}>
      {label}
      <span className="form-actions" style={{ marginTop: 6 }}>
        <input readOnly value={value} />
        <button className="btn btn-ghost" type="button" disabled={!value} onClick={onCopy}>
          {copyLabel}
        </button>
      </span>
    </label>
  );
}
