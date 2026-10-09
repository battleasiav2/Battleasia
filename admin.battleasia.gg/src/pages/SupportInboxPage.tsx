import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, explainError, unwrapList } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { getAdminSocket } from '../lib/socket';

type Ticket = {
  id?: string;
  _id?: string;
  subject?: string;
  category?: string;
  status?: string;
  username?: string;
  email?: string;
  previewBody?: string;
  unreadCount?: number;
  lastFrom?: string;
  lastMessageAt?: string;
  attachmentCount?: number;
};

function whenLabel(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function initial(name: string) {
  const ch = name.trim().charAt(0);
  return (ch || '?').toUpperCase();
}

export function SupportInboxPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'seen'>('all');

  function load() {
    api('/api/v2/customer-support/conversations?limit=80')
      .then((payload) => {
        setRows(unwrapList<Ticket>(payload));
        setError('');
      })
      .catch((err) => setError(explainError(err, t('support.loadFail'))));
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    let off: (() => void) | undefined;
    getAdminSocket().then((sock) => {
      if (!sock) return;
      const refresh = () => load();
      sock.on('new-support', refresh);
      sock.on('support-unread-count', refresh);
      off = () => {
        sock.off('new-support', refresh);
        sock.off('support-unread-count', refresh);
      };
    });
    return () => {
      window.clearInterval(timer);
      off?.();
    };
  }, [t]);

  const waiting = useMemo(() => rows.reduce((sum, row) => sum + (Number(row.unreadCount) || 0), 0), [rows]);
  const shown = rows.filter((row) => {
    const unread = Number(row.unreadCount) || 0;
    if (filter === 'new') return unread > 0;
    if (filter === 'seen') return row.lastFrom === 'admin' && unread === 0;
    return true;
  });

  return (
    <main className="admin-body">
      <header className="support-inbox-head">
        <div>
          <h1>{t('support.inbox')}</h1>
          <p>{t('support.inboxLead')}</p>
        </div>
        <div className={`support-inbox-total${waiting ? ' is-live' : ''}`} aria-live="polite">
          <b>{waiting}</b>
          <span>{t('support.new')}</span>
        </div>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="support-filters" role="tablist">
        {(['all', 'new', 'seen'] as const).map((key) => (
          <button key={key} type="button" className={filter === key ? 'is-on' : ''} onClick={() => setFilter(key)}>
            {t(`support.filter.${key}`)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="admin-empty">{t('support.empty')}</div>
      ) : (
        <ul className="support-inbox">
          {shown.map((row) => {
            const id = String(row.id || row._id || '');
            const unread = Number(row.unreadCount) || 0;
            const seen = row.lastFrom === 'admin' && unread === 0;
            const name = row.username || row.email || t('support.player');
            return (
              <li key={id}>
                <Link className={`support-row${unread ? ' is-new' : ''}${seen ? ' is-seen' : ''}`} to={`/customer-support/${id}`}>
                  <span className="support-avatar" aria-hidden="true">
                    {initial(name)}
                  </span>
                  <span className="support-row-main">
                    <span className="support-row-top">
                      <strong>{name}</strong>
                      <time>{whenLabel(row.lastMessageAt)}</time>
                    </span>
                    <span className="support-row-subject">{row.subject || t('support.ticket')}</span>
                    <span className="support-row-preview">{row.previewBody || '—'}</span>
                    <span className="support-row-meta">
                      {(row.category || 'other').toUpperCase()}
                      {row.status ? ` · ${row.status}` : ''}
                      {row.email && row.username ? ` · ${row.email}` : ''}
                    </span>
                  </span>
                  {unread ? <em className="support-pill is-new">{unread}</em> : null}
                  {seen ? <em className="support-pill is-seen">{t('support.seen')}</em> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
