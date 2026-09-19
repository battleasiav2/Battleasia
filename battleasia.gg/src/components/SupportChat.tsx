import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { FilePick } from './FilePick';
import { IconChat, IconClose, SocialGlyph } from './Icons';
import { isSignedIn } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { getAuthedSocket } from '../lib/socket';
import {
  fetchSupportConversation,
  fetchSupportMessages,
  sendSupportMessage,
  uploadSupportImages,
  type SupportMessage,
} from '../lib/social';
import { FALLBACK_SITE_SOCIALS, type SiteSocialLink } from '../lib/siteSocials';
import { safeHref, safeMediaHref } from '../lib/safeHref';

type ChatSettings = {
  enabled: boolean;
  agentName: string;
  agentTitle: string;
  logoUrl: string;
  welcomeMessage: string;
  socialLinks: SiteSocialLink[];
};

const DEFAULTS: ChatSettings = {
  enabled: true,
  agentName: 'BattleAsia Support',
  agentTitle: 'Live Support',
  logoUrl: '/logo/logo.webp?v=8',
  welcomeMessage: 'Hi! How can we help you today? Chat with our team or reach us on social.',
  socialLinks: FALLBACK_SITE_SOCIALS.slice(0, 4),
};

const POS_KEY = 'ba-support-chat-pos';

function nid(item: { id?: string; _id?: string }) {
  return item.id || item._id || '';
}

function attachmentUrl(item: { url?: string } | string) {
  const raw = typeof item === 'string' ? item : item.url || '';
  return safeMediaHref(raw);
}

type Props = { forceOpen?: boolean };

export function SupportChat({ forceOpen }: Props) {
  const { t } = useI18n();
  const authed = isSignedIn();
  const [settings, setSettings] = useState(DEFAULTS);
  const [open, setOpen] = useState(Boolean(forceOpen));
  const [toast, setToast] = useState('');
  const [cid, setCid] = useState('');
  const [rows, setRows] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    fetch('/api/v2/customer-support/live-chat-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        const data = (payload?.data ?? payload) as Partial<ChatSettings> | null;
        if (!data) return;
        setSettings({
          ...DEFAULTS,
          ...data,
          agentName: /[\u0980-\u09FF]/.test(String(data.agentName || ''))
            ? DEFAULTS.agentName
            : data.agentName || DEFAULTS.agentName,
          agentTitle: /[\u0980-\u09FF]/.test(String(data.agentTitle || ''))
            ? DEFAULTS.agentTitle
            : data.agentTitle || DEFAULTS.agentTitle,
          welcomeMessage: /[\u0980-\u09FF]/.test(String(data.welcomeMessage || ''))
            ? DEFAULTS.welcomeMessage
            : data.welcomeMessage || DEFAULTS.welcomeMessage,
          logoUrl: safeHref(data.logoUrl) || DEFAULTS.logoUrl,
          socialLinks: (data.socialLinks?.length ? data.socialLinks : DEFAULTS.socialLinks)
            .map((l) => ({ ...l, href: safeHref(l.href) }))
            .filter((l) => l.href),
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw || !fabRef.current) return;
      const pos = JSON.parse(raw) as { x: number; y: number };
      fabRef.current.style.left = `${pos.x}px`;
      fabRef.current.style.top = `${pos.y}px`;
      fabRef.current.style.right = 'auto';
      fabRef.current.style.bottom = 'auto';
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open || !authed) return;
    let live = true;
    setLoading(true);
    fetchSupportConversation()
      .then(async (conv) => {
        const id = nid(conv);
        if (!live) return;
        setCid(id);
        if (id) setRows(await fetchSupportMessages(id));
      })
      .catch(() => undefined)
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [open, authed]);

  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  }, [rows, open]);

  useEffect(() => {
    if (!open || !authed || !cid) return;
    let leave: (() => void) | undefined;
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      sock.emit('join-conversation', cid);
      const onMsg = (msg: SupportMessage) => {
        const id = nid(msg);
        setRows((prev) => (prev.some((row) => nid(row) === id) ? prev : [...prev, { ...msg, id }]));
      };
      sock.on('new-message', onMsg);
      leave = () => {
        sock.emit('leave-conversation', cid);
        sock.off('new-message', onMsg);
      };
    });
    return () => leave?.();
  }, [open, authed, cid]);

  if (!settings.enabled && !open) return null;

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1600);
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    const el = fabRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    const rect = el.getBoundingClientRect();
    drag.current = { active: true, moved: false, x: rect.left, y: rect.top, startX: e.clientX, startY: e.clientY };
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current.active || !fabRef.current) return;
    e.preventDefault();
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.hypot(dx, dy) > 6) drag.current.moved = true;
    if (!drag.current.moved) return;
    const size = fabRef.current.offsetWidth || 44;
    const x = Math.max(8, Math.min(window.innerWidth - size - 8, drag.current.x + dx));
    const y = Math.max(8, Math.min(window.innerHeight - size - 8, drag.current.y + dy));
    fabRef.current.style.left = `${x}px`;
    fabRef.current.style.top = `${y}px`;
    fabRef.current.style.right = 'auto';
    fabRef.current.style.bottom = 'auto';
  }

  function endDrag(toggle = true) {
    fabRef.current?.classList.remove('is-dragging');
    if (drag.current.moved && fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      localStorage.setItem(POS_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
    } else if (toggle && settings.enabled) {
      setOpen((v) => !v);
    } else if (toggle) {
      showToast(t('chat.offline'));
    }
    drag.current.active = false;
    drag.current.moved = false;
  }

  function onPointerUp() {
    endDrag(true);
  }

  function onPointerCancel() {
    endDrag(false);
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!authed) {
      window.location.href = '/auth/sign-in';
      return;
    }
    if (busy || (!draft.trim() && !pending.length) || !cid) return;
    setBusy(true);
    try {
      const attachments = pending.length ? await uploadSupportImages(pending) : [];
      await sendSupportMessage(cid, draft.trim() || ' ', attachments);
      setDraft('');
      setPending([]);
      setRows(await fetchSupportMessages(cid));
    } catch {
      showToast(t('chat.offline'));
    } finally {
      setBusy(false);
    }
  }

  const low = fabRef.current ? fabRef.current.getBoundingClientRect().top > window.innerHeight * 0.55 : true;

  return (
    <>
      <button
        ref={fabRef}
        className="chat-fab"
        type="button"
        title={t('chat.drag')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {open ? <IconClose /> : <IconChat />}
      </button>
      {open ? (
        <aside className={low ? 'chat-panel origin-br' : 'chat-panel origin-tr'} aria-label="Live support">
          <header>
            <img src={settings.logoUrl || DEFAULTS.logoUrl} width={32} height={32} alt="" />
            <div>
              <strong>{settings.agentName}</strong>
              <small>
                <span className="online-dot" /> {settings.agentTitle}
              </small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('chat.close')}>
              <IconClose size={16} />
            </button>
          </header>
          <p className="chat-welcome">{settings.welcomeMessage}</p>
          {authed ? (
            <div className="chat-log" ref={logRef}>
              {loading ? <p className="chat-guest">…</p> : null}
              {rows.map((m) => (
                <div key={m.id} className={m.isAdmin ? 'bubble agent' : 'bubble me'}>
                  {m.isAdmin ? <small>{m.senderName || settings.agentName}</small> : null}
                  {m.body ? <p>{m.body}</p> : null}
                  {(m.attachments || []).map((file) => {
                    const url = attachmentUrl(file);
                    return url ? (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="" />
                      </a>
                    ) : null;
                  })}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="chat-guest">{t('chat.guest')}</p>
              <Link className="btn btn-primary" to="/auth/sign-in">
                {t('cta.signin')}
              </Link>
            </>
          )}
          <div className="chat-socials">
            {settings.socialLinks.map((item) => {
              const href = safeHref(item.href);
              if (!href) return null;
              return (
              <a key={item.label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: item.color }} title={item.label}>
                <SocialGlyph name={item.label} />
              </a>
              );
            })}
          </div>
          {authed ? (
            <div className="chat-attach">
              <FilePick
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                max={8}
                disabled={busy}
                hint={t('support.attachHint')}
                files={pending}
                onFiles={setPending}
              />
            </div>
          ) : null}
          <form className="chat-composer" onSubmit={onSend}>
            <input
              value={draft}
              disabled={!authed || busy}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={authed ? t('chat.placeholderAuth') : t('chat.placeholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void onSend(e as unknown as FormEvent);
                }
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {t('chat.send')}
            </button>
          </form>
        </aside>
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}

export function DeferredSupportChat(props: Props) {
  const [ready, setReady] = useState(Boolean(props.forceOpen));
  useEffect(() => {
    if (props.forceOpen) {
      setReady(true);
      return;
    }
    const start = () => setReady(true);
    const idle = window.requestIdleCallback?.bind(window);
    if (idle) {
      const id = idle(start, { timeout: 4500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 4500);
    return () => window.clearTimeout(t);
  }, [props.forceOpen]);
  if (!ready) return null;
  return <SupportChat {...props} />;
}
