import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { isSignedIn } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { safeHref } from '../lib/safeHref';
import {
  fetchSupportConversation,
  fetchSupportMessages,
  markSupportChatRead,
  sendSupportMessage,
  uploadSupportImages,
  type SupportMessage,
} from '../lib/social';
import { getAuthedSocket } from '../lib/socket';
import { safeMediaHref } from '../lib/safeHref';
import { dispatchSupportUnread } from '../hooks/usePlayerSupportUnread';

type Topic = 'all' | 'account' | 'gaming' | 'general';

type Faq = { topic: Exclude<Topic, 'all'>; question: string; answer: string };

type Bubble = { id: string; from: 'me' | 'agent'; text: string; images?: string[] };

type Shot = { id: string; file: File; url: string };

const MAX_IMAGES = 2;

const FAQ_COUNT = 9;

const TOPICS: Topic[] = ['all', 'account', 'gaming', 'general'];

function defaultFaqs(t: (key: string) => string): Faq[] {
  return Array.from({ length: FAQ_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      topic: faqTopic(t(`landing.chat.faq.${n}.topic`)),
      question: t(`landing.chat.faq.${n}.q`),
      answer: t(`landing.chat.faq.${n}.a`),
    };
  });
}

function faqTopic(value: string): Faq['topic'] {
  return value === 'account' || value === 'gaming' ? value : 'general';
}

function english(value: unknown, fallback: string) {
  const text = String(value || '').trim();
  if (!text || /[\u0980-\u09FF]/.test(text)) return fallback;
  return text;
}

function nid(item: { id?: string; _id?: string }) {
  return item.id || item._id || '';
}

function messageImages(m: SupportMessage) {
  return (m.attachments || [])
    .map((file) => safeMediaHref(typeof file === 'string' ? file : file.url || ''))
    .filter(Boolean) as string[];
}

function rowsToBubbles(rows: SupportMessage[]): Bubble[] {
  return rows.map((m) => ({
    id: nid(m) || `${m.createdAt}-${m.body}`,
    from: m.isAdmin ? 'agent' : 'me',
    text: m.body || '',
    images: messageImages(m).length ? messageImages(m) : undefined,
  }));
}

function matchFaq(text: string, faqs: Faq[]) {
  const q = text.toLowerCase();
  return faqs.find((item) => item.question.toLowerCase() === q)
    || faqs.find((item) => {
      const words = item.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const hits = words.filter((w) => q.includes(w)).length;
      return hits >= 2;
    });
}

type Props = { open: boolean; onClose: () => void };

export function LandingSupportChat({ open, onClose }: Props) {
  const { t, locale } = useI18n();
  const localizedFaqs = useMemo(() => defaultFaqs(t), [t, locale]);
  const [faqs, setFaqs] = useState<Faq[]>(localizedFaqs);
  const [welcome, setWelcome] = useState(() => t('landing.chat.welcome'));
  const [logo, setLogo] = useState('/logo/logo.webp?v=8');
  const [topic, setTopic] = useState<Topic>('all');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [shots, setShots] = useState<Shot[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState('');
  const [cid, setCid] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFaqs(localizedFaqs);
    setWelcome(t('landing.chat.welcome'));
  }, [localizedFaqs, t]);

  useEffect(() => {
    fetch('/api/v2/customer-support/live-chat-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        const data = (payload?.data ?? payload) as { welcomeMessage?: string; logoUrl?: string; faqs?: Faq[] } | null;
        if (!data) return;
        setWelcome(english(data.welcomeMessage, t('landing.chat.welcome')));
        const nextLogo = safeHref(data.logoUrl);
        if (nextLogo) setLogo(nextLogo);
        if (Array.isArray(data.faqs) && data.faqs.length) {
          const clean = data.faqs
            .filter((item) => item && item.question && item.answer && !/[\u0980-\u09FF]/.test(item.question + item.answer))
            .map((item) => ({
              topic: faqTopic(String(item.topic || '')),
              question: item.question.slice(0, 160),
              answer: item.answer.slice(0, 600),
            }));
          if (clean.length) setFaqs(clean);
          else setFaqs(localizedFaqs);
        }
      })
      .catch(() => undefined);
  }, [localizedFaqs, t]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && bubbles.length) el.scrollTop = el.scrollHeight;
  }, [bubbles]);

  useEffect(() => {
    if (!open || !isSignedIn()) return;
    let live = true;
    (async () => {
      try {
        await markSupportChatRead();
        dispatchSupportUnread(0);
        const conv = await fetchSupportConversation();
        const id = nid(conv);
        if (!live) return;
        setCid(id);
        if (id) setBubbles(rowsToBubbles(await fetchSupportMessages(id)));
      } catch {
        /* keep FAQ-only view */
      }
    })();
    return () => {
      live = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !cid || !isSignedIn()) return;
    let leave: (() => void) | undefined;
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      sock.emit('join-conversation', cid);
      const onMsg = (msg: SupportMessage) => {
        const id = nid(msg);
        setBubbles((prev) => {
          if (prev.some((row) => row.id === id)) return prev;
          return [
            ...prev,
            {
              id,
              from: msg.isAdmin ? 'agent' : 'me',
              text: msg.body || '',
              images: messageImages(msg).length ? messageImages(msg) : undefined,
            },
          ];
        });
      };
      sock.on('new-message', onMsg);
      leave = () => {
        sock.emit('leave-conversation', cid);
        sock.off('new-message', onMsg);
      };
    });
    return () => leave?.();
  }, [open, cid]);

  const shown = useMemo(
    () => (topic === 'all' ? faqs : faqs.filter((item) => item.topic === topic)),
    [faqs, topic],
  );

  function push(from: Bubble['from'], text: string, images?: string[]) {
    setBubbles((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, from, text, images }]);
  }

  function ask(item: Faq) {
    push('me', item.question);
    push('agent', item.answer);
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const incoming = [...list];
    if (fileRef.current) fileRef.current.value = '';
    setShots((prev) => {
      if (prev.length >= MAX_IMAGES) {
        setNotice(t('landing.chat.maxImages'));
        return prev;
      }
      const next = [...prev];
      let bad = false;
      for (const file of incoming) {
        if (next.length >= MAX_IMAGES) break;
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 4 * 1024 * 1024) {
          bad = true;
          continue;
        }
        next.push({ id: `${Date.now()}-${next.length}-${file.name}`, file, url: URL.createObjectURL(file) });
      }
      if (next.length === prev.length) setNotice(t('landing.chat.badImage'));
      else if (bad || incoming.length > MAX_IMAGES - prev.length) setNotice(t('landing.chat.maxImages'));
      else setNotice('');
      return next;
    });
  }

  function removeShot(id: string) {
    setShots((prev) => {
      const hit = prev.find((item) => item.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((item) => item.id !== id);
    });
    setNotice('');
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (busy || (!text && !shots.length)) return;
    const picked = shots.map((item) => item.file);
    const urls = shots.map((item) => item.url);
    setDraft('');
    setShots([]);
    push('me', text || t('landing.chat.screenshots'), urls.length ? urls : undefined);

    const hit = text && !picked.length ? matchFaq(text, faqs) : undefined;
    if (hit) {
      push('agent', hit.answer);
      return;
    }

    if (!isSignedIn()) {
      push('agent', t('landing.chat.signInHint'));
      return;
    }

    setBusy(true);
    try {
      const conv = await fetchSupportConversation();
      const id = nid(conv);
      if (!id) throw new Error('no conversation');
      setCid(id);
      const attachments = picked.length ? await uploadSupportImages(picked) : [];
      await sendSupportMessage(id, text || t('landing.chat.screenshots'), attachments);
      setBubbles(rowsToBubbles(await fetchSupportMessages(id)));
    } catch {
      push('agent', t('landing.chat.sendFail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`chat-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="chat-head">
        <img src={logo} width={36} height={36} alt="" />
        <div>
          <strong>{t('landing.chat.title')}</strong>
          <small>{t('landing.chat.eta')}</small>
        </div>
        <button type="button" aria-label={t('landing.chat.close')} className="drawer-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="chat-topics" role="tablist">
        {TOPICS.map((id) => (
          <button key={id} type="button" className={topic === id ? 'is-on' : ''} onClick={() => setTopic(id)}>
            {id === 'all'
              ? t('landing.chat.topic.all')
              : id === 'account'
                ? t('landing.chat.topic.account')
                : id === 'gaming'
                  ? t('landing.chat.topic.gaming')
                  : t('landing.chat.topic.general')}
          </button>
        ))}
      </div>
      <div className="chat-body" ref={bodyRef}>
        <div className="chat-msg">{welcome}</div>
        <div className="chat-qs">
          {shown.map((item) => (
            <button key={item.question} type="button" onClick={() => ask(item)}>
              {item.question}
            </button>
          ))}
        </div>
        {bubbles.map((row) => (
          <div key={row.id} className={row.from === 'me' ? 'chat-msg reply' : 'chat-msg'}>
            {row.text ? <p>{row.text}</p> : null}
            {row.images?.length ? (
              <span className="chat-pics">
                {row.images.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </span>
            ) : null}
          </div>
        ))}
        {bubbles.some((row) => row.text === t('landing.chat.signInHint')) ? (
          <Link className="chat-signin" to="/dashboard?auth=signin&returnTo=/">
            {t('landing.chat.signIn')}
          </Link>
        ) : null}
        {notice ? <p className="chat-note">{notice}</p> : null}
      </div>
      <form className="chat-form" onSubmit={onSend}>
        {shots.length ? (
          <div className="chat-preview">
            {shots.map((item) => (
              <div className="chat-shot" key={item.id}>
                <img src={item.url} alt="" />
                <button type="button" aria-label="Remove image" onClick={() => removeShot(item.id)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <label className="chat-file">
          <ImagePlus size={16} />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            aria-label="Add up to 2 images"
            disabled={shots.length >= MAX_IMAGES || busy}
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('landing.chat.placeholder')}
          aria-label={t('landing.chat.placeholder')}
        />
        <button type="submit" aria-label="Send message" disabled={busy}>
          →
        </button>
      </form>
    </div>
  );
}
