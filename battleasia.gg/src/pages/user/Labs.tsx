import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { readSessionUser } from '../../lib/auth';
import {
  createLab,
  fetchCreators,
  fetchLab,
  fetchP2Flags,
  giftLab,
  heartLab,
  joinLab,
  messageLab,
  resolveDuel,
  scoreFantasy,
  warClan,
  watchEarnLab,
  P2_LABS,
  P2_OFF,
  type LabRow,
  type P2Flags,
} from '../../lib/p2';
import { FilePick } from '../../components/FilePick';
import { uploadMedia } from '../../lib/social';
import { useI18n } from '../../lib/i18n';

const KIND: Record<string, string> = {
  live: 'live',
  watch: 'watch',
  clans: 'clan',
  duel: 'duel',
  ocr: 'ocr',
  cosmetics: 'cosmetic',
  fantasy: 'fantasy',
};

export function LabsPage() {
  const { t } = useI18n();
  const { feature = '' } = useParams();
  const [flags, setFlags] = useState<P2Flags>(P2_OFF);
  useEffect(() => {
    fetchP2Flags().then(setFlags);
  }, []);

  const spec = P2_LABS.find((s) => s.path === feature);
  const on = spec ? Boolean(flags[spec.id]) : false;

  const onCount = P2_LABS.filter((s) => flags[s.id]).length;

  if (!spec) {
    return (
      <main className="play-main">
        <header className="play-head">
          <div>
            <p className="eyebrow">{t('labs.badge')}</p>
            <h1>{t('labs.title')}</h1>
            <p className="play-lead">{t('labs.lead')}</p>
          </div>
          <p className="play-count">
            <strong>{onCount}</strong>
            <small>{t('labs.on')}</small>
          </p>
        </header>
        <div className="play-stage">
          <div className="play-grid">
            {P2_LABS.map((s) => (
              <Link key={s.id} className="play-card" to={`/user/labs/${s.path}`}>
                <div className="play-card-meta">
                  <strong>{t(`labs.${s.id}.title`)}</strong>
                  <small>{flags[s.id] ? t('labs.on') : t('labs.off')}</small>
                  <p className="play-muted">{t(`labs.${s.id}.body`)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="play-main">
      <Link className="play-back" to="/user/labs">
        ← {t('labs.back')}
      </Link>
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('labs.badge')}</p>
          <h1>{t(`labs.${spec.id}.title`)}</h1>
          <p className="play-lead">{t(`labs.${spec.id}.body`)}</p>
        </div>
        <p className="play-count">
          <strong>{on ? t('labs.on') : t('labs.off')}</strong>
          <small>{t('labs.badge')}</small>
        </p>
      </header>
      {!on ? (
        <div className="play-empty">
          <h2>{t('labs.flagOff')}</h2>
          <p>{t('labs.flagOffLead')}</p>
        </div>
      ) : (
        <div className="play-stage">
          {spec.path === 'creators' ? <CreatorsBoard /> : <LabBoard kind={KIND[spec.path] || spec.path} mode={spec.path} />}
        </div>
      )}
    </main>
  );
}

function CreatorsBoard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Array<{ id: string; rank: number; username: string; likes?: number; posts?: number }>>([]);
  useEffect(() => {
    fetchCreators()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);
  if (!rows.length) {
    return (
      <div className="play-empty">
        <h2>{t('labs.noCreators')}</h2>
        <p>{t('labs.noCreatorsLead')}</p>
      </div>
    );
  }
  return (
    <ol className="roster">
      {rows.map((r) => (
        <li key={r.id}>
          <Link to={`/profile/${r.id}`}>
            #{r.rank} {r.username}
          </Link>
          <small>
            {r.likes || 0} {t('labs.likes')} · {r.posts || 0} {t('labs.posts')}
          </small>
        </li>
      ))}
    </ol>
  );
}

function LabBoard({ kind, mode }: { kind: string; mode: string }) {
  const { t } = useI18n();
  const { toast } = useHudPage();
  const me = readSessionUser();
  const [rows, setRows] = useState<LabRow[]>([]);
  const [open, setOpen] = useState<LabRow | null>(null);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [picks, setPicks] = useState('');
  const [draft, setDraft] = useState('');
  const [giftAmt, setGiftAmt] = useState('10');
  const [equipped, setEquipped] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    return fetchLab(kind)
      .then((d) => {
        setRows(d.rows);
        setEquipped(d.cosmeticId);
      })
      .catch((err) => toast(isApiError(err) ? err.message : t('labs.offline')));
  }

  useEffect(() => {
    void load();
  }, [kind]);

  async function make(extra: Record<string, unknown> = {}) {
    setBusy(true);
    try {
      await createLab(kind, {
        title: title.trim() || t('labs.roomTitle'),
        tag: mode === 'duel' ? '' : tag.trim(),
        stake: mode === 'duel' ? Number(tag) || 10 : undefined,
        picks: picks.split(',').map((s) => s.trim()).filter(Boolean),
        ...extra,
      });
      setTitle('');
      setTag('');
      setPicks('');
      await load();
      toast(t('labs.created'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('labs.createFail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {mode === 'cosmetics' ? (
        <div className="play-grid">
          {rows.map((r) => (
            <article key={r.id} className={`play-card${equipped === r.tag ? '' : ' is-soon'}`}>
              <strong>{r.title}</strong>
              <p className="play-muted">
                {t('labs.hud')} · {r.priceBac || 0} BAC
              </p>
              <button
                className="btn btn-primary"
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await createLab('cosmetic', { tag: r.tag });
                    setEquipped(r.tag || '');
                    toast(equipped === r.tag ? t('labs.equipped') : t('labs.purchased'));
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('labs.buyFail'));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {equipped === r.tag ? t('labs.equipped') : `${t('labs.buy')} ${r.priceBac || 0} BAC`}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <>
          <form
            className="money-form"
            onSubmit={(e) => {
              e.preventDefault();
              void make();
            }}
          >
            <label className="field">
              {mode === 'ocr' ? t('labs.ticketTitle') : mode === 'clans' ? t('labs.clanName') : t('labs.roomTitle')}
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required={mode !== 'ocr'} />
            </label>
            {mode === 'clans' ? (
              <label className="field">
                {t('labs.tag')}
                <input value={tag} maxLength={8} onChange={(e) => setTag(e.target.value)} placeholder={t('labs.tagPh')} />
              </label>
            ) : null}
            {mode === 'duel' ? (
              <label className="field">
                {t('labs.stake')}
                <input value={tag} onChange={(e) => setTag(e.target.value)} inputMode="numeric" placeholder="10" />
              </label>
            ) : null}
            {mode === 'fantasy' ? (
              <label className="field">
                {t('labs.picks')}
                <input value={picks} onChange={(e) => setPicks(e.target.value)} placeholder={t('labs.picksPh')} />
              </label>
            ) : null}
            {mode === 'ocr' ? (
              <div className="field">
                <span>{t('labs.shot')}</span>
                <FilePick
                  accept="image/jpeg,image/png,image/webp"
                  multiple={false}
                  max={1}
                  disabled={busy}
                  hint={t('labs.dropShot')}
                  onFiles={async (files) => {
                    const file = files[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      const imageUrl = await uploadMedia(file, 'support');
                      await make({ imageUrl, title: title.trim() || file.name });
                    } catch (err) {
                      toast(isApiError(err) ? err.message : t('labs.uploadFail'));
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </div>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {mode === 'live' ? t('labs.openLobby') : mode === 'duel' ? t('labs.postChallenge') : t('labs.create')}
              </button>
            )}
          </form>
          {mode === 'live' ? <p className="play-muted">{t('labs.noCam')}</p> : null}
          {rows.length === 0 ? (
            <div className="play-empty">
              <h2>{t('labs.empty')}</h2>
              <p>{t('labs.emptyLead')}</p>
            </div>
          ) : (
            <ul className="roster">
              {rows.map((r) => (
                <li key={r.id}>
                  <button className="text-link" type="button" onClick={() => setOpen(r)}>
                    {r.title}
                  </button>
                  <small>
                    {r.hostName} · {r.members} {t('labs.in')} · {r.hearts || 0} ♥
                    {r.stake ? ` · ${r.stake} BAC` : ''}
                  </small>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={async () => {
                      const next = await joinLab(kind, r.id);
                      setRows((list) => list.map((x) => (x.id === r.id ? next : x)));
                    }}
                  >
                    {r.joined ? t('labs.joined') : t('labs.join')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {open ? (
        <section className="room-card">
          <h2>{open.title}</h2>
          <p className="play-muted">
            {t('labs.host')} {open.hostName} · {open.members} {t('labs.members')}
            {open.picks?.length ? ` · ${t('labs.picksShort')} ${open.picks.join(', ')}` : ''}
            {open.stake ? ` · ${t('labs.stakeShort')} ${open.stake} BAC` : ''}
            {open.giftBac ? ` · ${t('labs.pot')} ${open.giftBac} BAC` : ''}
          </p>
          {open.imageUrl ? <img src={open.imageUrl} alt="" width={320} /> : null}
          {kind === 'live' ? (
            <div className="match-actions">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={async () => {
                const h = await heartLab(kind, open.id);
                setOpen({ ...open, hearts: h.hearts });
              }}
            >
              ♥ {open.hearts || 0}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={async () => {
                try {
                  const next = await giftLab(kind, open.id, Number(giftAmt) || 10);
                  setOpen(next);
                  toast(t('labs.giftSent'));
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('labs.giftFail'));
                }
              }}
              disabled={open.hostId === me?.id}
            >
              {t('labs.gift')}
            </button>
            <input value={giftAmt} onChange={(e) => setGiftAmt(e.target.value)} inputMode="numeric" style={{ width: 72 }} />
            <button
              className="btn btn-ghost"
              type="button"
              onClick={async () => {
                try {
                  const res = await watchEarnLab(kind, open.id);
                  toast(res.credited ? t('labs.watchGot') : t('labs.watchDup'));
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('labs.cap'));
                }
              }}
            >
              {t('labs.watchEarn')}
            </button>
            </div>
          ) : null}
          {kind === 'watch' ? (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={async () => {
                try {
                  const res = await watchEarnLab(kind, open.id);
                  toast(res.credited ? t('labs.watchGot') : t('labs.watchDup'));
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('labs.cap'));
                }
              }}
            >
              {t('labs.watchEarn')}
            </button>
          ) : null}
          {kind === 'clan' && open.hostId === me?.id && open.status !== 'war' ? (
            <div className="match-actions">
              {rows
                .filter((r) => r.id !== open.id && r.tag !== 'war')
                .map((r) => (
                  <button
                    key={r.id}
                    className="btn btn-ghost"
                    type="button"
                    onClick={async () => {
                      try {
                        const next = await warClan(open.id, r.id);
                        setOpen(next);
                        await load();
                        toast(t('labs.warred'));
                      } catch (err) {
                        toast(isApiError(err) ? err.message : t('labs.warFail'));
                      }
                    }}
                  >
                    {t('labs.war')} {r.tag || r.title}
                  </button>
                ))}
            </div>
          ) : null}
          {kind === 'fantasy' && open.hostId === me?.id && open.status !== 'scored' ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={async () => {
                try {
                  const next = await scoreFantasy(open.id);
                  setOpen(next);
                  await load();
                  toast(t('labs.scored'));
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('labs.scoreFail'));
                }
              }}
            >
              {t('labs.score')}
            </button>
          ) : null}
          {kind === 'duel' && open.hostId === me?.id && open.status !== 'complete' ? (
            <div className="match-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={async () => {
                  try {
                    const next = await resolveDuel(open.id, me?.id || '');
                    setOpen(next);
                    await load();
                    toast(t('labs.paidHost'));
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('labs.resolveFail'));
                  }
                }}
              >
                {t('labs.payoutMe')}
              </button>
              {(open.memberIds || []).filter((id) => id !== me?.id).map((id) => (
                <button
                  key={id}
                  className="btn btn-ghost"
                  type="button"
                  onClick={async () => {
                    try {
                      const next = await resolveDuel(open.id, id);
                      setOpen(next);
                      await load();
                      toast(t('labs.paidOpp'));
                    } catch (err) {
                      toast(isApiError(err) ? err.message : t('labs.resolveFail'));
                    }
                  }}
                >
                  {t('labs.payoutOpp')}
                </button>
              ))}
            </div>
          ) : null}
          <div className="dm-log">
            {(open.messages || []).map((m, i) => (
              <p key={`${m.username}-${i}`}>
                <b>{m.username}</b> {m.body}
              </p>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              const next = await messageLab(kind, open.id, draft.trim());
              setOpen(next);
              setDraft('');
              setRows((list) => list.map((x) => (x.id === next.id ? next : x)));
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`${t('labs.chatAs')} ${me?.username || ''}`} />
            <button className="btn btn-primary" type="submit">
              {t('labs.send')}
            </button>
          </form>
          <button className="btn btn-ghost" type="button" onClick={() => setOpen(null)}>
            {t('labs.close')}
          </button>
        </section>
      ) : null}
    </>
  );
}
