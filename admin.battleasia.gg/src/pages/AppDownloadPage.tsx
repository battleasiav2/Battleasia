import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type AppDownloadForm = {
  enabled: boolean;
  version: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  updatedAt: string;
};

const DEFAULT: AppDownloadForm = {
  enabled: true,
  version: '',
  downloadUrl: '/api/uploads/app/BattleAsia.apk',
  fileName: 'BattleAsia.apk',
  fileSize: 0,
  updatedAt: '',
};

function formatSize(bytes: number) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

export function AppDownloadPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [form, setForm] = useState<AppDownloadForm>(DEFAULT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api('/api/v2/app-settings/app-download');
      const data = unwrapData<Partial<AppDownloadForm>>(payload) || {};
      setForm({
        enabled: data.enabled !== false,
        version: data.version || '',
        downloadUrl: data.downloadUrl || DEFAULT.downloadUrl,
        fileName: data.fileName || DEFAULT.fileName,
        fileSize: Number(data.fileSize) || 0,
        updatedAt: data.updatedAt || '',
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

  async function save() {
    setBusy(true);
    try {
      const payload = await api('/api/v2/app-settings/app-download', {
        method: 'PUT',
        body: JSON.stringify({ enabled: form.enabled, version: form.version.trim() }),
      });
      const data = unwrapData<Partial<AppDownloadForm>>(payload);
      if (data) {
        setForm((prev) => ({
          ...prev,
          enabled: data.enabled !== false,
          version: data.version || prev.version,
          fileSize: Number(data.fileSize) || prev.fileSize,
          updatedAt: data.updatedAt || prev.updatedAt,
          downloadUrl: data.downloadUrl || prev.downloadUrl,
        }));
      }
      toast(t('apk.saved'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('settings.fail'));
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast(t('apk.needApk'));
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('apk', file);
      if (form.version.trim()) body.append('version', form.version.trim());
      const payload = await api('/api/v2/app-settings/app-download/upload', {
        method: 'POST',
        body,
      });
      const data = unwrapData<Partial<AppDownloadForm>>(payload);
      if (data) {
        setForm((prev) => ({
          ...prev,
          enabled: true,
          version: data.version || prev.version,
          fileSize: Number(data.fileSize) || prev.fileSize,
          updatedAt: data.updatedAt || new Date().toISOString(),
          downloadUrl: data.downloadUrl || prev.downloadUrl,
          fileName: data.fileName || prev.fileName,
        }));
      }
      toast(t('apk.uploaded'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('apk.uploadFail'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <main className="admin-body">
      <h1>{t('nav.appDownload')}</h1>
      <p className="admin-lead">{t('apk.lead')}</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="dash-stage form-stage match-form-grid">
        <div className="prize-preview" style={{ marginBottom: 16 }}>
          <small>{t('apk.tipTitle')}</small>
          <p>{t('apk.tipBody')}</p>
        </div>

        <div className="form-toggles" style={{ marginBottom: 14 }}>
          <label className="field-check">
            <input
              type="checkbox"
              checked={form.enabled}
              disabled={loading}
              onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            {t('apk.enabled')}
          </label>
        </div>

        <label className="field">
          {t('apk.version')}
          <input
            value={form.version}
            disabled={loading}
            placeholder="1.0.2"
            onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
          />
        </label>

        <div className="prize-preview">
          <small>{t('apk.current')}</small>
          <p>
            <strong>{form.fileName}</strong> · {formatSize(form.fileSize)}
            {form.updatedAt ? ` · ${new Date(form.updatedAt).toLocaleString()}` : ''}
          </p>
          {form.enabled && form.downloadUrl ? (
            <p>
              <a href={form.downloadUrl} download={form.fileName}>
                {form.downloadUrl}
              </a>
            </p>
          ) : (
            <p>{t('apk.disabledHint')}</p>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" disabled={busy || loading} onClick={() => void save()}>
            {busy ? t('mail.sending') : t('apk.save')}
          </button>
          <button type="button" className="btn btn-ghost" disabled={loading} onClick={() => void load()}>
            {t('mail.reset')}
          </button>
        </div>

        <div className="prize-preview" style={{ marginTop: 8 }}>
          <small>{t('apk.uploadTitle')}</small>
          <p>{t('apk.uploadHint')}</p>
          <label className="field" style={{ marginTop: 10 }}>
            <input
              ref={fileRef}
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              disabled={uploading || loading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
              }}
            />
          </label>
          {uploading ? <p className="field-hint">{t('apk.uploading')}</p> : null}
        </div>
      </div>
    </main>
  );
}
