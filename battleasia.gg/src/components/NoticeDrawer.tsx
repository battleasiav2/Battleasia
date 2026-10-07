import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchNotifications, markAllRead, markRead, type AlertRow } from '../lib/social';
import { isApiError } from '../lib/api';
import { useI18n } from '../lib/i18n';

function plain(value?: string) {
  if (!value) return '';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCount: (count: number) => void;
};

export function NoticeDrawer({ open, onClose, onCount }: Props) {
  const { t } = useI18n();
  const [rows, setRows] = useState<AlertRow[] | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setRows(null);
    fetchNotifications()
      .then((list) => {
        if (!live) return;
        setRows(list);
        onCount(list.filter((row) => row.isUnRead).length);
      })
      .catch(() => {
        if (live) setRows([]);
      });
    return () => {
      live = false;
    };
  }, [open, onCount]);

  if (!open || typeof document === 'undefined') return null;

  const unread = rows?.filter((row) => row.isUnRead).length ?? 0;

  function whenLabel(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  return createPortal(
    <div className="note-drawer" role="dialog" aria-modal="true" aria-label={t('note.title')}>
      <button className="note-drawer-bg" type="button" aria-label={t('hud.closeMenu')} onClick={onClose} />
      <aside className="note-drawer-panel">
        <header className="note-drawer-head">
          <h2>{t('note.title')}</h2>
          <button className="note-drawer-x" type="button" aria-label={t('hud.closeMenu')} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="note-drawer-tools">
          <button
            className="note-drawer-mark"
            type="button"
            disabled={!unread}
            onClick={async () => {
              try {
                await markAllRead();
                const list = await fetchNotifications();
                setRows(list);
                onCount(list.filter((row) => row.isUnRead).length);
              } catch (err) {
                if (!isApiError(err)) return;
              }
            }}
          >
            {t('note.markAll')}
          </button>
        </div>
        <div className="note-drawer-list">
          {rows === null ? (
            <p className="note-drawer-empty">{t('note.lead')}</p>
          ) : rows.length === 0 ? (
            <p className="note-drawer-empty">{t('note.empty')}</p>
          ) : (
            rows.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`note-item ${row.isUnRead ? 'is-unread' : ''}`}
                onClick={async () => {
                  if (!row.isUnRead) return;
                  await markRead(row.id);
                  setRows((prev) => {
                    const next = prev?.map((item) => (item.id === row.id ? { ...item, isUnRead: false } : item)) || null;
                    if (next) onCount(next.filter((item) => item.isUnRead).length);
                    return next;
                  });
                }}
              >
                <span className="note-item-top">
                  <b>{plain(row.subject || row.title) || t('note.title')}</b>
                </span>
                {plain(row.message) ? <small>{plain(row.message)}</small> : null}
                {row.createdAt ? <small>{whenLabel(row.createdAt)}</small> : null}
              </button>
            ))
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
