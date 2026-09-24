import { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapList } from '../lib/api';
import { can } from '../lib/auth';
import { cell, pick, rowId } from '../lib/format';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

type Draft = {
  title: string;
  message: string;
  category: string;
  type: string;
  premiumOnly: boolean;
};

const EMPTY: Draft = {
  title: '',
  message: '',
  category: 'General',
  type: 'general',
  premiumOnly: false,
};

const COLS = ['title', 'category', 'type', 'createdAt'];

export function NotificationsPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const payload = await api('/api/v3/notifications?limit=50');
      setRows(unwrapList<Record<string, unknown>>(payload));
    } catch (err) {
      setRows([]);
      setError(isApiError(err) ? err.message : t('list.loadFail'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!can('notifications.send')) return <Navigate to="/403" replace />;

  async function send() {
    const title = draft.title.trim();
    const message = draft.message.trim();
    if (!title || !message) {
      toast(t('notif.needFields'));
      return;
    }
    if (!window.confirm(t('notif.confirmAll'))) return;
    setBusy(true);
    try {
      await api('/api/v3/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title,
          message,
          category: draft.category.trim() || 'General',
          type: draft.type.trim() || 'general',
          premiumOnly: draft.premiumOnly,
          target: 'all',
        }),
      });
      toast(t('notif.sent'));
      setDraft(EMPTY);
      setOpen(false);
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('notif.fail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.community')}</p>
        <h1>{t('nav.notifications')}</h1>
        <p className="admin-lead">{t('notif.lead')}</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage list-stage">
        <div className="table-tools">
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            {t('notif.broadcast')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void load()}>
            {t('list.refresh')}
          </button>
        </div>
        {rows === null ? (
          <p className="admin-lead">{t('list.loading')}…</p>
        ) : rows.length === 0 ? (
          <div className="admin-empty">
            <h2>{t('notif.empty')}</h2>
            <p>{t('notif.emptyLead')}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {COLS.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={rowId(row)}>
                    {COLS.map((c) => (
                      <td key={c}>{cell(pick(row, c))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {open ? (
        <div className="play-sheet" role="dialog">
          <button className="play-sheet-bg" type="button" aria-label={t('chrome.close')} onClick={() => setOpen(false)} />
          <div className="play-sheet-card">
            <h2>{t('notif.broadcast')}</h2>
            <p className="admin-lead">{t('notif.broadcastLead')}</p>
            <label className="field">
              {t('notif.title')}
              <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            </label>
            <label className="field">
              {t('notif.message')}
              <textarea rows={4} value={draft.message} onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))} />
            </label>
            <label className="field">
              {t('notif.category')}
              <input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
            </label>
            <label className="field">
              {t('notif.type')}
              <input value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))} />
            </label>
            <label className="field-check">
              <input
                type="checkbox"
                checked={draft.premiumOnly}
                onChange={(e) => setDraft((d) => ({ ...d, premiumOnly: e.target.checked }))}
              />
              {t('notif.premiumOnly')}
            </label>
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>
                {t('pay.cancel')}
              </button>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void send()}>
                {busy ? t('notif.sending') : t('notif.sendAll')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
