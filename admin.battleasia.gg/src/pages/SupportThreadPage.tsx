import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { api, explainError, unwrapData, unwrapList, uploadMultipart } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { mediaUrl } from '../lib/media';
import { getAdminSocket } from '../lib/socket';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

type Msg = {
  _id?: string;
  id?: string;
  body?: string;
  senderName?: string;
  isAdmin?: boolean;
  createdAt?: string;
  attachments?: Array<string | { url?: string }>;
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

type PendingShot = { id: string; file: File; url: string };

const MAX_IMAGES = 8;

function whenLabel(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function msgId(row: Msg) {
  return String(row._id || row.id || '');
}

function attachmentUrls(raw: Msg['attachments']) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === 'string' ? item : String(item?.url || '')))
    .filter(Boolean);
}

function appendMsg(prev: Msg[], row: Msg) {
  const id = msgId(row);
  if (!id || prev.some((item) => msgId(item) === id)) return prev;
  return [...prev, row];
}

async function uploadSupportImages(files: File[]) {
  const urls: string[] = [];
  for (const file of files.slice(0, MAX_IMAGES)) {
    const form = new FormData();
    form.append('file', file);
    const payload = await uploadMultipart('/api/v1/files/upload/support', form);
    const data = unwrapData<{ url?: string }>(payload);
    if (data.url) urls.push(data.url);
  }
  return urls;
}

export function SupportThreadPage() {
  const { toast } = useOutletContext<Ctx>();
  const { t } = useI18n();
  const { conversationId } = useParams();
  const [rows, setRows] = useState<Msg[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [text, setText] = useState('');
  const [pending, setPending] = useState<PendingShot[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scrollEnd = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const loadMessages = useCallback(() => {
    if (!conversationId) return;
    api(`/api/v2/customer-support/conversation/${conversationId}/messages?limit=100`)
      .then((payload) => {
        setRows(unwrapList<Msg>(payload));
        setError('');
        window.requestAnimationFrame(scrollEnd);
      })
      .catch((err) => setError(explainError(err, t('support.loadFail'))));
  }, [conversationId, scrollEnd, t]);

  const loadTicket = useCallback(() => {
    if (!conversationId) return;
    api('/api/v2/customer-support/conversations?limit=80')
      .then((payload) => {
        const list = unwrapList<Ticket>(payload);
        setTicket(list.find((row) => String(row.id || row._id) === conversationId) || null);
      })
      .catch(() => undefined);
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    loadTicket();
  }, [loadMessages, loadTicket]);

  useEffect(() => {
    scrollEnd();
  }, [rows, scrollEnd]);

  useEffect(() => {
    if (!conversationId) return;
    let leave: (() => void) | undefined;
    getAdminSocket().then((sock) => {
      if (!sock) return;
      sock.emit('join-conversation', conversationId);
      const onMsg = (msg: Msg) => {
        setRows((prev) => appendMsg(prev, msg));
      };
      sock.on('new-message', onMsg);
      leave = () => {
        sock.emit('leave-conversation', conversationId);
        sock.off('new-message', onMsg);
      };
    });
    return () => leave?.();
  }, [conversationId]);

  useEffect(
    () => () => {
      pending.forEach((shot) => URL.revokeObjectURL(shot.url));
    },
    [pending],
  );

  const name = ticket?.username || ticket?.email || rows.find((row) => !row.isAdmin)?.senderName || t('support.player');
  const closed = (ticket?.status || '').toLowerCase() === 'closed';

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    if (fileRef.current) fileRef.current.value = '';
    setPending((prev) => {
      const next = [...prev];
      for (const file of [...list]) {
        if (next.length >= MAX_IMAGES) break;
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
          toast(t('support.badImage'), 'err');
          continue;
        }
        next.push({ id: `${Date.now()}-${next.length}`, file, url: URL.createObjectURL(file) });
      }
      return next;
    });
  }

  function removeShot(id: string) {
    setPending((prev) => {
      const hit = prev.find((item) => item.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((item) => item.id !== id);
    });
  }

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
      <div className="support-thread" ref={threadRef}>
        {rows.length === 0 ? (
          <div className="admin-empty">{t('support.noMessages')}</div>
        ) : (
          rows.map((row) => {
            const files = attachmentUrls(row.attachments);
            return (
              <article key={msgId(row)} className={row.isAdmin ? 'is-staff' : 'is-player'}>
                <header>
                  <strong>{row.isAdmin ? t('support.staff') : row.senderName || name}</strong>
                  <time>{whenLabel(row.createdAt)}</time>
                </header>
                {row.body && row.body.trim() ? <p>{row.body}</p> : null}
                {files.length ? (
                  <div className="support-shots">
                    {files.map((url) => (
                      <a key={url} href={mediaUrl(url)} target="_blank" rel="noreferrer">
                        <img src={mediaUrl(url)} alt="" />
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
          if ((!body && !pending.length) || !conversationId || busy) return;
          setBusy(true);
          setUploading(pending.length > 0);
          try {
            const files = pending.map((item) => item.file);
            const uploaded = files.length ? await uploadSupportImages(files) : [];
            const attachments = uploaded.map((url) => ({ url }));
            const payload = await api('/api/v2/customer-support/message', {
              method: 'POST',
              body: JSON.stringify({
                conversationId,
                body: body || ' ',
                attachments,
              }),
            });
            const sent = unwrapData<Msg>(payload);
            setRows((prev) => appendMsg(prev, sent));
            setText('');
            pending.forEach((shot) => URL.revokeObjectURL(shot.url));
            setPending([]);
            toast(t('support.sent'), 'ok');
            scrollEnd();
          } catch (err) {
            toast(explainError(err, t('support.sendFail')), 'err');
          } finally {
            setBusy(false);
            setUploading(false);
          }
        }}
      >
        {pending.length ? (
          <div className="support-reply-preview">
            {pending.map((item) => (
              <div className="support-reply-shot" key={item.id}>
                <img src={item.url} alt="" />
                <button type="button" aria-label={t('support.removeImage')} onClick={() => removeShot(item.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <textarea
          value={text}
          placeholder={t('support.replyPh')}
          disabled={closed || busy}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="table-tools support-reply-tools">
          <label className="btn btn-ghost support-attach-btn">
            {uploading ? t('support.uploading') : t('support.attach')}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              disabled={closed || busy || pending.length >= MAX_IMAGES}
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={closed || busy || (!text.trim() && !pending.length)}
          >
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
                loadTicket();
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
