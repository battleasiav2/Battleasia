import { useEffect, useState } from 'react';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchNotifications, markAllRead, markRead, type AlertRow } from '../../lib/social';
import { getAuthedSocket } from '../../lib/socket';
import { useI18n } from '../../lib/i18n';

function plain(value?: string) {
  if (!value) return '';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function publishCount(rows: AlertRow[]) {
  window.dispatchEvent(new CustomEvent('ba-alerts', { detail: rows.filter((n) => n.isUnRead).length }));
}

export function NotificationsPage() {
  const { t } = useI18n();
  const { toast } = useHudPage();
  const [rows, setRows] = useState<AlertRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications()
      .then((list) => {
        setRows(list);
        publishCount(list);
      })
      .catch((err) => {
        setError(isApiError(err) ? err.message : t('note.offline'));
        setRows([]);
      });
  }, [t]);

  useEffect(() => {
    let off: (() => void) | undefined;
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      const onNote = (data: AlertRow) => {
        setRows((prev) => {
          const next = [{ ...data, id: data.id || String(Date.now()), isUnRead: true }, ...(prev || [])];
          publishCount(next);
          return next;
        });
      };
      sock.on('new-notification', onNote);
      off = () => sock.off('new-notification', onNote);
    });
    return () => off?.();
  }, []);

  const unread = rows?.filter((n) => n.isUnRead).length ?? 0;

  function whenLabel(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('note.eyebrow')}</p>
          <h1>{t('note.title')}</h1>
          <p className="play-lead">{t('note.lead')}</p>
        </div>
        <p className="play-count">
          <strong>{rows === null ? '—' : unread}</strong>
          <small>{t('note.unread')}</small>
        </p>
      </header>
      <div className="match-actions">
        <button
          className="btn btn-ghost"
          type="button"
          disabled={!unread}
          onClick={async () => {
            try {
              await markAllRead();
              const list = await fetchNotifications();
              setRows(list);
              publishCount(list);
              toast(t('note.allRead'));
            } catch (err) {
              toast(isApiError(err) ? err.message : t('note.markFail'));
            }
          }}
        >
          {t('note.markAll')}
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {rows === null ? (
        <div className="play-stage">
          <div className="match-row skeleton" />
        </div>
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{t('note.empty')}</h2>
          <p>{t('note.emptyLead')}</p>
        </div>
      ) : (
        <div className="play-stage">
          <div className="note-list">
            {rows.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`note-item ${n.isUnRead ? 'is-unread' : ''}`}
                onClick={async () => {
                  if (!n.isUnRead) return;
                  await markRead(n.id);
                  setRows((prev) => {
                    const next = prev?.map((r) => (r.id === n.id ? { ...r, isUnRead: false } : r)) || null;
                    if (next) publishCount(next);
                    return next;
                  });
                }}
              >
                <span className="note-item-top">
                  <b>{plain(n.subject || n.title) || t('note.title')}</b>
                  {n.isUnRead ? <span className="xfer-dir out">{t('note.unread')}</span> : null}
                </span>
                {plain(n.message) ? <small>{plain(n.message)}</small> : null}
                {n.createdAt ? <small>{whenLabel(n.createdAt)}</small> : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
