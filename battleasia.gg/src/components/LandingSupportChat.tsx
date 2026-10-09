import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { isSignedIn } from '../lib/auth';
import { safeHref } from '../lib/safeHref';
import { fetchSupportConversation, sendSupportMessage, uploadSupportImages } from '../lib/social';

type Topic = 'all' | 'account' | 'gaming' | 'general';

type Faq = { topic: Exclude<Topic, 'all'>; question: string; answer: string };

type Bubble = { id: string; from: 'me' | 'agent'; text: string; images?: string[] };

type Shot = { id: string; file: File; url: string };

const MAX_IMAGES = 2;

const FALLBACK: Faq[] = [
  {
    topic: 'account',
    question: 'How do I create an account?',
    answer: 'Open Sign up, use your email, and confirm the message we send. Then sign in with that same email.',
  },
  {
    topic: 'account',
    question: 'How do I reset my password?',
    answer: 'On the sign-in screen choose Forgot password. We email a reset link. It expires, so open it soon.',
  },
  {
    topic: 'account',
    question: 'Where is my wallet balance?',
    answer: 'Sign in and open Wallet. A deposit stays pending until staff approve the payment proof.',
  },
  {
    topic: 'gaming',
    question: 'How do I join a match?',
    answer: 'Open Play, pick a room that is open, and pay the entry from your wallet. The room page shows the schedule.',
  },
  {
    topic: 'gaming',
    question: 'When do I get the room ID?',
    answer: 'The room ID and password appear on the match page when the lobby opens. Do not share them outside your squad.',
  },
  {
    topic: 'gaming',
    question: 'How are results decided?',
    answer: 'After the match, submit your result screenshot on the match page. Staff check it before any prize is paid.',
  },
  {
    topic: 'general',
    question: 'What is BAC?',
    answer: 'BAC is the BattleAsia coin. You use it for match entry, the shop, and rewards such as Earn.',
  },
  {
    topic: 'general',
    question: 'How do deposits work?',
    answer: 'Choose bKash, Nagad, or USDT, send the exact amount shown, and upload proof. Staff approve it before the balance updates.',
  },
  {
    topic: 'general',
    question: 'How do I reach a person?',
    answer: 'Write here with a screenshot, or email support@battleasia.gg. We usually reply within a few minutes.',
  },
];

const TOPICS: Topic[] = ['all', 'account', 'gaming', 'general'];

function english(value: unknown, fallback: string) {
  const text = String(value || '').trim();
  if (!text || /[\u0980-\u09FF]/.test(text)) return fallback;
  return text;
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
  const [faqs, setFaqs] = useState<Faq[]>(FALLBACK);
  const [welcome, setWelcome] = useState('Welcome to Battle Asia support. What can we help with?');
  const [logo, setLogo] = useState('/logo/logo.webp?v=8');
  const [topic, setTopic] = useState<Topic>('all');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [shots, setShots] = useState<Shot[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/v2/customer-support/live-chat-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        const data = (payload?.data ?? payload) as { welcomeMessage?: string; logoUrl?: string; faqs?: Faq[] } | null;
        if (!data) return;
        setWelcome(english(data.welcomeMessage, 'Welcome to Battle Asia support. What can we help with?'));
        const nextLogo = safeHref(data.logoUrl);
        if (nextLogo) setLogo(nextLogo);
        if (Array.isArray(data.faqs) && data.faqs.length) {
          const clean = data.faqs
            .filter((item) => item && item.question && item.answer && !/[\u0980-\u09FF]/.test(item.question + item.answer))
            .map((item) => ({
              topic: item.topic === 'account' || item.topic === 'gaming' ? item.topic : 'general',
              question: item.question.slice(0, 160),
              answer: item.answer.slice(0, 600),
            }));
          if (clean.length) setFaqs(clean);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && bubbles.length) el.scrollTop = el.scrollHeight;
  }, [bubbles]);

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
        setNotice('You can add 2 images.');
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
      if (next.length === prev.length) setNotice('Use a JPG, PNG, or WebP under 4 MB.');
      else if (bad || incoming.length > MAX_IMAGES - prev.length) setNotice('You can add 2 images.');
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
    push('me', text || 'Screenshots', urls.length ? urls : undefined);

    const hit = text && !picked.length ? matchFaq(text, faqs) : undefined;
    if (hit) {
      push('agent', hit.answer);
      return;
    }

    if (!isSignedIn()) {
      push('agent', 'Sign in so a teammate can see your message and screenshot. You can still use the questions above.');
      return;
    }

    setBusy(true);
    try {
      const conv = await fetchSupportConversation();
      const id = conv.id || (conv as { _id?: string })._id || '';
      if (!id) throw new Error('no conversation');
      const attachments = picked.length ? await uploadSupportImages(picked) : [];
      await sendSupportMessage(id, text || 'Screenshot', attachments);
      push('agent', 'Sent. A teammate usually replies within a few minutes.');
    } catch {
      push('agent', 'We could not send that just now. Email support@battleasia.gg or try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`chat-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="chat-head">
        <img src={logo} width={36} height={36} alt="" />
        <div>
          <strong>Player support</strong>
          <small>Typically replies in a few minutes</small>
        </div>
        <button type="button" aria-label="Close chat" className="drawer-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="chat-topics" role="tablist">
        {TOPICS.map((id) => (
          <button key={id} type="button" className={topic === id ? 'is-on' : ''} onClick={() => setTopic(id)}>
            {id === 'all' ? 'All' : id === 'account' ? 'Account' : id === 'gaming' ? 'Gaming' : 'General'}
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
        {bubbles.some((row) => row.text.startsWith('Sign in')) ? (
          <Link className="chat-signin" to="/dashboard?auth=signin&returnTo=/">
            Sign in
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
          placeholder="Write a message..."
          aria-label="Chat message"
        />
        <button type="submit" aria-label="Send message" disabled={busy}>
          →
        </button>
      </form>
    </div>
  );
}
