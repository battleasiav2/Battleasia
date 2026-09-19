import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { FilePick } from '../../components/FilePick';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import {
  closeSupportTicket,
  createSupportTicket,
  fetchMySupportTickets,
  fetchSupportMessages,
  sendSupportMessage,
  uploadSupportImages,
  type SupportMessage,
  type SupportTicket,
} from '../../lib/social';

type ViewMode = 'list' | 'create' | 'detail';
type TicketCategory = 'payment' | 'match' | 'account' | 'other';
type StatusFilter = 'all' | 'open' | 'pending' | 'closed';

const CHANNELS: Array<{
  category: TicketCategory;
  title: string;
  code: string;
  desc: string;
  badge: string;
  accent: string;
}> = [
  {
    category: 'payment',
    title: 'BAC Escrow & Payouts',
    code: 'CHANNEL_PAY_01',
    desc: 'Deposits, withdrawals, wallet balances, and escrow disputes.',
    badge: 'RAPID QUEUE',
    accent: '#f59e0b',
  },
  {
    category: 'match',
    title: 'Match Disputes & Fair Play',
    code: 'CHANNEL_TAC_02',
    desc: 'Score arbitration, disconnect refunds, and anti-cheat appeals.',
    badge: 'REFEREE',
    accent: '#ef4444',
  },
  {
    category: 'account',
    title: 'Account & Security',
    code: 'CHANNEL_SEC_03',
    desc: 'Login recovery, 2FA, profile, and game UID linking.',
    badge: 'SECURE',
    accent: '#38bdf8',
  },
  {
    category: 'other',
    title: 'VIP Hotline',
    code: 'CHANNEL_VIP_04',
    desc: 'General questions, partnerships, and live Discord support.',
    badge: 'DIRECT',
    accent: '#34d399',
  },
];

const FAQ = [
  {
    id: 'faq-1',
    tag: 'PAYOUTS',
    q: 'How fast are BAC deposits and withdrawals?',
    a: 'Deposits usually credit within seconds after confirmation. Withdrawals go through a short security check and typically land within a few minutes.',
  },
  {
    id: 'faq-2',
    tag: 'MATCH',
    q: 'How do I dispute a match result?',
    a: 'Open a Match channel ticket within 15 minutes of the match ending. Include the match ID and screenshots or video of the final score.',
  },
  {
    id: 'faq-3',
    tag: 'FAIR PLAY',
    q: 'What anti-cheat rules apply?',
    a: 'Emulators where banned, injected tools, and account sharing can void a match and ban the account. Report with proof via Support.',
  },
  {
    id: 'faq-4',
    tag: 'PLATFORMS',
    q: 'Can I play on mobile and PC?',
    a: 'Mobile tournaments require native Android/iOS. PC titles use verified desktop clients. Queues stay segregated for fair play.',
  },
] as const;

function whenLabel(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function attachUrl(item: { url?: string } | string) {
  return typeof item === 'string' ? item : item.url || '';
}

export function CustomerSupportPage() {
  const { t } = useI18n();
  const chatRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { toast } = useHudPage({
    openChat: () => chatRef.current?.focus(),
  });

  const [view, setView] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [rows, setRows] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string>('faq-1');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('other');
  const [body, setBody] = useState('');
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const stats = useMemo(() => {
    const list = tickets || [];
    return {
      total: list.length,
      open: list.filter((x) => x.status === 'open' || x.status === 'pending').length,
      closed: list.filter((x) => x.status === 'closed').length,
    };
  }, [tickets]);

  const loadTickets = useCallback(async () => {
    const list = await fetchMySupportTickets(filter);
    setTickets(list);
  }, [filter]);

  useEffect(() => {
    if (view !== 'list') return;
    let live = true;
    setError('');
    loadTickets().catch((err) => {
      if (!live) return;
      setError(isApiError(err) ? err.message : t('support.offline'));
      setTickets([]);
    });
    return () => {
      live = false;
    };
  }, [view, loadTickets, t]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [rows, view]);

  async function openTicket(ticket: SupportTicket) {
    setSelected(ticket);
    setView('detail');
    setDraft('');
    setPendingFiles([]);
    setRows([]);
    try {
      setRows(await fetchSupportMessages(ticket.id));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('support.offline'));
    }
  }

  function startCreate(cat?: TicketCategory) {
    if (cat) setCategory(cat);
    setView('create');
  }

  const open = (selected?.status || 'open').toLowerCase() !== 'closed';

  return (
    <main className="play-main support-page">
      <header className="play-head support-head">
        <div>
          <p className="eyebrow">{t('support.eyebrow')}</p>
          <h1>{t('support.title')}</h1>
          <p className="play-lead">{t('support.lead')}</p>
        </div>
        {view === 'list' ? (
          <button className="btn btn-primary" type="button" onClick={() => startCreate()}>
            {t('support.newTicket')}
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setView('list');
              setSelected(null);
              setRows([]);
            }}
          >
            {t('support.back')}
          </button>
        )}
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      {view === 'list' ? (
        <>
          <div className="support-stats" aria-label={t('support.stats')}>
            <div>
              <small>{t('support.statTickets')}</small>
              <b>{stats.total}</b>
            </div>
            <div>
              <small>{t('support.statOpen')}</small>
              <b>{stats.open}</b>
            </div>
            <div>
              <small>{t('support.statClosed')}</small>
              <b>{stats.closed}</b>
            </div>
          </div>

          <div className="support-tabs" role="tablist">
            {(['all', 'open', 'pending', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                className={filter === tab ? 'is-on' : ''}
                onClick={() => setFilter(tab)}
              >
                {t(`support.filter.${tab}`)}
              </button>
            ))}
          </div>

          <section className="support-channels" aria-label={t('support.channels')}>
            <div className="support-channels-head">
              <div>
                <h2>{t('support.channelsTitle')}</h2>
                <p>{t('support.channelsLead')}</p>
              </div>
              <span className="support-live-chip">
                <i />
                {t('support.relays')}
              </span>
            </div>
            <div className="support-channel-grid">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.category}
                  type="button"
                  className="support-channel"
                  style={{ '--ch': ch.accent } as CSSProperties}
                  onClick={() => startCreate(ch.category)}
                >
                  <div className="support-channel-top">
                    <code>{ch.code}</code>
                    <span>{ch.badge}</span>
                  </div>
                  <strong>{ch.title}</strong>
                  <p>{ch.desc}</p>
                  <em>{t('support.dispatch')} →</em>
                </button>
              ))}
            </div>
          </section>

          <section className="support-ticket-panel room-card">
            <div className="dm-thread-head">
              <h2>{t('support.yourTickets')}</h2>
            </div>
            {tickets === null ? (
              <div className="match-row skeleton" />
            ) : tickets.length === 0 ? (
              <div className="dm-empty">
                <p>{t('support.noTickets')}</p>
                <button className="btn btn-primary" type="button" onClick={() => startCreate()}>
                  {t('support.newTicket')}
                </button>
              </div>
            ) : (
              <ul className="support-ticket-list">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button type="button" className="support-ticket" onClick={() => openTicket(ticket)}>
                      <span className={`support-status is-${ticket.status || 'open'}`}>
                        {ticket.status || 'open'}
                      </span>
                      <strong>{ticket.subject || t('support.staff')}</strong>
                      <small>
                        {(ticket.category || 'other').toUpperCase()}
                        {ticket.lastMessageAt ? ` · ${whenLabel(ticket.lastMessageAt)}` : ''}
                      </small>
                      {ticket.previewBody ? <p>{ticket.previewBody}</p> : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="support-faq room-card">
            <div className="support-faq-head">
              <div>
                <h2>{t('support.faqTitle')}</h2>
                <p>{t('support.faqLead')}</p>
              </div>
              <button className="btn btn-ghost" type="button" onClick={() => startCreate()}>
                {t('support.openTicket')}
              </button>
            </div>
            <div className="support-faq-list">
              {FAQ.map((item) => {
                const openFaq = faqOpen === item.id;
                return (
                  <details
                    key={item.id}
                    className="support-faq-item"
                    open={openFaq}
                    onToggle={(e) => {
                      if ((e.target as HTMLDetailsElement).open) setFaqOpen(item.id);
                      else if (faqOpen === item.id) setFaqOpen('');
                    }}
                  >
                    <summary>
                      <code>{item.tag}</code>
                      <span>{item.q}</span>
                    </summary>
                    <p>{item.a}</p>
                  </details>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {view === 'create' ? (
        <section className="room-card support-create">
          <div className="dm-thread-head">
            <h2>{t('support.newTicket')}</h2>
          </div>
          <label className="field">
            <span>{t('support.subject')}</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
          </label>
          <label className="field">
            <span>{t('support.category')}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)}>
              {CHANNELS.map((ch) => (
                <option key={ch.category} value={ch.category}>
                  {ch.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('support.describe')}</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={2000} />
          </label>
          <div className="field">
            <span>{t('support.attach')}</span>
            <FilePick
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              max={8}
              disabled={busy}
              hint={t('support.attachHint')}
              files={createFiles}
              onFiles={setCreateFiles}
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!subject.trim()) {
                toast(t('support.needSubject'));
                return;
              }
              if (!body.trim() && createFiles.length === 0) {
                toast(t('support.needBody'));
                return;
              }
              setBusy(true);
              try {
                const attachments = createFiles.length ? await uploadSupportImages(createFiles) : [];
                const ticket = await createSupportTicket({
                  subject: subject.trim(),
                  category,
                  body: body.trim() || subject.trim(),
                  attachments,
                });
                setSubject('');
                setBody('');
                setCreateFiles([]);
                await openTicket(ticket);
                toast(t('support.created'));
              } catch (err) {
                toast(isApiError(err) ? err.message : t('support.fail'));
              } finally {
                setBusy(false);
              }
            }}
          >
            {t('support.create')}
          </button>
        </section>
      ) : null}

      {view === 'detail' && selected ? (
        <section className="room-card dm-pane support-detail">
          <div className="dm-thread-head">
            <div>
              <h2>{selected.subject || t('support.staff')}</h2>
              <small>{(selected.category || 'other').toUpperCase()}</small>
            </div>
            <div className="support-detail-actions">
              <span className={`support-status is-${selected.status || 'open'}`}>{selected.status || 'open'}</span>
              {open ? (
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await closeSupportTicket(selected.id);
                      setSelected({ ...selected, status: 'closed' });
                      toast(t('support.closedOk'));
                    } catch (err) {
                      toast(isApiError(err) ? err.message : t('support.fail'));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {t('support.close')}
                </button>
              ) : null}
            </div>
          </div>
          <div className="dm-log" ref={logRef}>
            {rows.length === 0 ? (
              <div className="dm-empty">
                <p>{t('support.empty')}</p>
              </div>
            ) : (
              rows.map((m) => (
                <div key={m.id} className={`dm-bubble ${m.isAdmin ? '' : 'mine'}`}>
                  <small>{m.isAdmin ? t('support.staff') : m.senderName || t('support.you')}</small>
                  {m.body ? <p>{m.body}</p> : null}
                  {m.attachments?.length ? (
                    <div className="support-msg-atts">
                      {m.attachments.map((a, i) => {
                        const url = attachUrl(a);
                        return url ? <img key={`${m.id}-${i}`} src={url} alt="" /> : null;
                      })}
                    </div>
                  ) : null}
                  {whenLabel(m.createdAt) ? <small>{whenLabel(m.createdAt)}</small> : null}
                </div>
              ))
            )}
          </div>
          {open ? (
            <div className="support-detail-attach">
              <FilePick
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                max={8}
                disabled={busy}
                hint={t('support.attachHint')}
                files={pendingFiles}
                onFiles={setPendingFiles}
              />
            </div>
          ) : null}
          <form
            className="chat-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if ((!draft.trim() && !pendingFiles.length) || !selected.id || busy || !open) return;
              setBusy(true);
              try {
                const attachments = pendingFiles.length ? await uploadSupportImages(pendingFiles) : [];
                await sendSupportMessage(selected.id, draft.trim(), attachments);
                setDraft('');
                setPendingFiles([]);
                setRows(await fetchSupportMessages(selected.id));
              } catch (err) {
                toast(isApiError(err) ? err.message : t('support.fail'));
              } finally {
                setBusy(false);
              }
            }}
          >
            <input
              ref={chatRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              placeholder={t('support.ph')}
              aria-label={t('support.ph')}
              disabled={!open}
            />
            <button className="btn btn-primary" type="submit" disabled={!open || busy}>
              {t('support.send')}
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
