import { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type SiteNoticeForm = {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  dismissible: boolean;
  version: number;
  updatedAt: string | null;
};

const EMPTY: SiteNoticeForm = {
  enabled: false,
  title: '',
  message: '',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '',
  dismissible: true,
  version: 1,
  updatedAt: null,
};

export function SiteNoticePage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [form, setForm] = useState<SiteNoticeForm>(EMPTY);
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api('/api/v2/app-settings/site-notice');
      const data = unwrapData<Partial<SiteNoticeForm>>(payload) || {};
      setForm({
        enabled: data.enabled === true,
        title: String(data.title || ''),
        message: String(data.message || ''),
        imageUrl: String(data.imageUrl || ''),
        ctaLabel: String(data.ctaLabel || ''),
        ctaUrl: String(data.ctaUrl || ''),
        dismissible: data.dismissible !== false,
        version: Number(data.version) || 1,
        updatedAt: data.updatedAt ? String(data.updatedAt) : null,
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

  if (!can('notifications.send') && !can('users.edit')) return <Navigate to="/403" replace />;

  function update<K extends keyof SiteNoticeForm>(key: K, value: SiteNoticeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const payload = await api('/api/v1/files/upload/notice', { method: 'POST', body });
      const data = unwrapData<{ url?: string }>(payload);
      const url = String(data?.url || '');
      if (!url) throw new Error('No url');
      update('imageUrl', url);
      toast(t('notice.imageOk'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('notice.imageFail'));
    } finally {
      setUploading(false);
    }
  }

  async function save(opts?: { bumpVersion?: boolean }) {
    if (!form.title.trim() && !form.message.trim() && form.enabled) {
      toast(t('notice.needContent'));
      return;
    }
    setBusy(true);
    try {
      const payload = await api('/api/v2/app-settings/site-notice', {
        method: 'PUT',
        body: JSON.stringify({
          enabled: form.enabled,
          title: form.title.trim(),
          message: form.message.trim(),
          imageUrl: form.imageUrl.trim(),
          ctaLabel: form.ctaLabel.trim(),
          ctaUrl: form.ctaUrl.trim(),
          dismissible: form.dismissible,
          bumpVersion: opts?.bumpVersion === true,
          sendEmail: sendEmail && form.enabled,
        }),
      });
      const data = unwrapData<Partial<SiteNoticeForm>>(payload);
      if (data) {
        setForm((prev) => ({
          ...prev,
          enabled: data.enabled === true,
          title: String(data.title || prev.title),
          message: String(data.message || prev.message),
          imageUrl: String(data.imageUrl || ''),
          ctaLabel: String(data.ctaLabel || ''),
          ctaUrl: String(data.ctaUrl || ''),
          dismissible: data.dismissible !== false,
          version: Number(data.version) || prev.version,
          updatedAt: data.updatedAt ? String(data.updatedAt) : prev.updatedAt,
        }));
      }
      const emailQueued = Boolean((payload as { emailQueued?: boolean })?.emailQueued);
      toast(emailQueued ? t('notice.savedMail') : t('notice.saved'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('settings.fail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.community')}</p>
        <h1>{t('nav.siteNotice')}</h1>
        <p className="admin-lead">{t('notice.lead')}</p>
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
            <div className="form-toggles">
              <label className="field-check">
                <input type="checkbox" checked={form.enabled} onChange={(e) => update('enabled', e.target.checked)} />
                {t('notice.enabled')}
              </label>
              <label className="field-check">
                <input
                  type="checkbox"
                  checked={form.dismissible}
                  onChange={(e) => update('dismissible', e.target.checked)}
                />
                {t('notice.dismissible')}
              </label>
              <label className="field-check">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                {t('notice.sendEmail')}
              </label>
            </div>
            <p className="form-meta">{t('notice.sendEmailHint')}</p>

            <label className="field">
              {t('notice.title')}
              <input value={form.title} onChange={(e) => update('title', e.target.value)} maxLength={120} />
            </label>

            <label className="field">
              {t('notice.message')}
              <textarea rows={6} value={form.message} onChange={(e) => update('message', e.target.value)} maxLength={2000} />
            </label>

            <label className="field">
              {t('notice.image')}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadImage(f);
                  e.target.value = '';
                }}
              />
              <span className="field-hint">{uploading ? t('notice.uploading') : t('notice.imageHint')}</span>
            </label>

            {form.imageUrl ? (
              <div className="notice-admin-preview">
                <img src={form.imageUrl} alt="" />
                <button type="button" className="btn btn-ghost" onClick={() => update('imageUrl', '')}>
                  {t('notice.removeImage')}
                </button>
              </div>
            ) : null}

            <div className="admin-form-grid">
              <label className="field">
                {t('notice.ctaLabel')}
                <input
                  value={form.ctaLabel}
                  onChange={(e) => update('ctaLabel', e.target.value)}
                  maxLength={40}
                  placeholder={t('notice.ctaLabelPh')}
                />
              </label>
              <label className="field">
                {t('notice.ctaUrl')}
                <input
                  value={form.ctaUrl}
                  onChange={(e) => update('ctaUrl', e.target.value)}
                  placeholder="/user/play or https://…"
                />
              </label>
            </div>

            <p className="form-meta">
              {t('notice.version')}: v{form.version}
              {form.updatedAt ? ` · ${new Date(form.updatedAt).toLocaleString()}` : ''}
            </p>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? t('settings.saving') : t('settings.save')}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={busy || !form.enabled}
                onClick={() => void save({ bumpVersion: true })}
              >
                {t('notice.republish')}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
