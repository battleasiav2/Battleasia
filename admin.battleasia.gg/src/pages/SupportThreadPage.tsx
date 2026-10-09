import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { api, explainError, unwrapList } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

type Msg = {
  _id?: string;
  id?: string;
  body?: string;
  senderName?: string;
  isAdmin?: boolean;
  createdAt?: string;
  attachments?: string[];
};

type Ticket = {
  id?: string;
  _id?: string;
  subject?: string;
  category?: string;
  status?: string;
  username?: string;
  email?: string;
};

function whenLabel(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function SupportThreadPage() {
  const { toast } = useOutletContext<Ctx>();
  const { t } = useI18n();
  const { conversationId } = useParams();
  const [rows, setRows] = useState<Msg[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    if (!conversationId) return;
    api(`/api/v2/customer-support/conversation/${conversationId}/messages?limit=100`)
      .then((payload) => {
        setRows(unwrapList<Msg>(payload));
        setError('');
      })
      .catch((err) => setError(explainError(err, t('support.loadFail'))));
    api('/api/v2/customer-support/conversations?limit=80')
      .then((payload) => {
        const list = unwrapList<Ticket>(payload);
        setTicket(list.find((row) => String(row.id || row._id) === conversationId) || null);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, [conversationId]);

  const name = ticket?.username || ticket?.email || rows.find((row) => !row.isAdmin)?.senderName || t('support.player');
  const closed = (ticket?.status || '').toLowerCase() === 'closed';

  return (
    <main className="admin-body">
      <header className="support-thread-head">
        <Link className="btn btn-ghost" to="/customer-support/list">
          {t('support.back')}
        </Link>
        <div>
          <h1>{name}</h1>
          <p>
            {ticket?.subject || t('support.ticket')}
            {ticket?.category ? ` · ${ticket.category}` : ''}
            {ticket?.email ? ` · ${ticket.email}` : ''}
          </p>
        </div>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="support-thread">
        {rows.length === 0 ? (
          <div className="admin-empty">{t('support.noMessages')}</div>
        ) : (
          rows.map((row) => {
            const files = Array.isArray(row.attachments) ? row.attachments : [];
            return (
              <article key={String(row._id || row.id)} className={row.isAdmin ? 'is-staff' : 'is-player'}>
                <header>
                  <strong>{row.isAdmin ? t('support.staff') : row.senderName || name}</strong>
                  <time>{whenLabel(row.createdAt)}</time>
                </header>
                {row.body ? <p>{row.body}</p> : null}
                {files.length ? (
                  <div className="support-shots">
                    {files.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
      <form
        className="support-reply"
        onSubmit={async (event) => {
          event.preventDefault();
          const body = text.trim();
          if (!body || !conversationId || busy) return;
          setBusy(true);
          try {
            await api('/api/v2/customer-support/message', {
              method: 'POST',
              body: JSON.stringify({ conversationId, body }),
            });
            setText('');
            toast(t('support.sent'), 'ok');
            load();
          } catch (err) {
            toast(explainError(err, t('support.sendFail')), 'err');
          } finally {
            setBusy(false);
          }
        }}
      >
        <textarea
          value={text}
          placeholder={t('support.replyPh')}
          disabled={closed || busy}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="table-tools">
          <button className="btn btn-primary" type="submit" disabled={closed || busy || !text.trim()}>
            {t('support.send')}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            disabled={closed || busy}
            onClick={async () => {
              if (!window.confirm(t('support.closeAsk'))) return;
              try {
                await api(`/api/v2/customer-support/conversation/${conversationId}/close`, { method: 'PATCH' });
                toast(t('support.closedOk'), 'ok');
                load();
              } catch (err) {
                toast(explainError(err, t('support.closeFail')), 'err');
              }
            }}
          >
            {t('support.close')}
          </button>
        </div>
      </form>
    </main>
  );
}
