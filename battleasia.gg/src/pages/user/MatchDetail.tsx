import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { MatchJoinDialog } from '../../components/MatchJoinDialog';
import { SpotBar } from '../../components/SpotBar';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { createLab, fetchP2Flags } from '../../lib/p2';
import {
  checkJoin,
  coverForGame,
  estimateMatchWinningPool,
  fetchChat,
  fetchMatch,
  fetchRoom,
  formatWhen,
  joinMatch,
  leaveMatch,
  localCoverForGame,
  reportMatch,
  sendChat,
  setReady,
  spotsLeft,
  type ChatMessage,
  type MatchDetail,
  type RoomCreds,
} from '../../lib/games';
import { isDemoMatchId } from '../../lib/demoMatches';
import { httpCopy } from '../../lib/form';
import { useI18n } from '../../lib/i18n';
import { readSessionUser, isPremiumUser } from '../../lib/auth';

type ShellCtx = {
  setBalance: (n: number) => void;
  balance?: number;
};

export function MatchDetailPage() {
  const { t } = useI18n();
  const meId = readSessionUser()?.id;
  const { matchId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const outlet = useOutletContext<ShellCtx>();
  const { setBalance } = outlet;
  const balance = Number(outlet?.balance ?? readSessionUser()?.balance) || 0;
  const { toast, register } = useHud();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReadyOn] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [room, setRoom] = useState<RoomCreds | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [watchOn, setWatchOn] = useState(false);
  const chatRef = useRef<HTMLInputElement>(null);
  const autoJoinPrompt = useRef(false);
  const joined = Boolean(match?.isJoined);

  const load = useCallback(async () => {
    const data = await fetchMatch(matchId);
    setMatch(data);
    if (data.isJoined) {
      try {
        setRoom(await fetchRoom(matchId));
      } catch {
        setRoom(null);
      }
    }
    return data;
  }, [matchId]);

  useEffect(() => {
    fetchP2Flags().then((f) => setWatchOn(f.watchParty));
  }, []);

  useEffect(() => {
    let live = true;
    load().catch((err) => {
      if (!live) return;
      setError(isApiError(err) ? err.message : t('match.loadFail'));
    });
    return () => {
      live = false;
    };
  }, [load, t]);

  useEffect(() => {
    if (!joined) return;
    let live = true;
    const tick = () => {
      fetchRoom(matchId)
        .then((creds) => {
          if (!live) return;
          setRoom(creds);
        })
        .catch(() => undefined);
    };
    tick();
    const id = window.setInterval(tick, 8000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [joined, matchId]);

  useEffect(() => {
    if (!joined) return;
    let live = true;
    const tick = () => {
      fetchChat(matchId)
        .then((rows) => {
          if (live) setChat(rows);
        })
        .catch(() => undefined);
    };
    tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [joined, matchId]);

  const requestJoin = useCallback(() => {
    if (!match || busy || match.isJoined) return;
    if (spotsLeft(match) <= 0) {
      toast(t('match.matchFullToast'));
      return;
    }
    if (match.premiumOnly && !isPremiumUser(readSessionUser())) {
      toast(t('match.premiumOnlyToast'));
      return;
    }
    const fee = Number(match.entryFee) || 0;
    if (fee > balance) {
      toast(t('match.insufficientBalance'));
      return;
    }
    if (!isDemoMatchId(matchId)) {
      const pubgId = (readSessionUser()?.pubgId || '').trim();
      if (!pubgId) {
        toast(t('match.pubgIdRequired'));
        return;
      }
    }
    setJoinError(isDemoMatchId(matchId) ? t('match.demoDisabled') : '');
    setJoinOpen(true);
  }, [balance, busy, match, matchId, t, toast]);

  const doJoin = useCallback(async () => {
    if (!match || busy) return;
    const fee = Number(match.entryFee) || 0;
    setJoinError('');
    if (fee > balance) {
      const msg = t('match.insufficientBalance');
      setJoinError(msg);
      toast(msg);
      return;
    }

    if (isDemoMatchId(matchId)) {
      const msg = t('match.demoDisabled');
      setJoinError(msg);
      toast(msg);
      return;
    }

    setBusy(true);
    try {
      try {
        const check = await checkJoin(matchId);
        if (check && check.canJoin === false) {
          const msg = (check.issues || []).filter(Boolean).join(' · ') || t('match.joinFail');
          setJoinError(msg);
          toast(msg);
          return;
        }
      } catch (err) {
        if (isApiError(err) && err.status !== 404) {
          const msg = httpCopy(err, t, t('match.joinFail'));
          setJoinError(msg);
          toast(msg);
          return;
        }
      }
      const joinedRes = await joinMatch(matchId);
      if (joinedRes?.balance != null) setBalance(Number(joinedRes.balance) || 0);
      else if (fee > 0) setBalance(Math.max(balance - fee, 0));
      if (joinedRes?.roomId || joinedRes?.password) {
        setRoom({
          roomId: joinedRes.roomId || '',
          password: joinedRes.password || '',
          matchName: match.matchName,
          map: match.map,
          matchSchedule: match.matchSchedule,
        });
      }
      toast(t('match.joinedSuccessfully'));
      setJoinOpen(false);
      setJoinError('');
      await load();
      window.requestAnimationFrame(() => {
        document.getElementById('match-room')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      const msg = httpCopy(err, t, t('match.joinFail'));
      setJoinError(msg);
      toast(msg);
    } finally {
      setBusy(false);
    }
  }, [balance, busy, load, match, matchId, setBalance, t, toast]);

  useEffect(() => {
    if (params.get('join') === '1' && match && !match.isJoined && !autoJoinPrompt.current) {
      autoJoinPrompt.current = true;
      requestJoin();
    }
  }, [match, params, requestJoin]);

  const doLeave = useCallback(async () => {
    setBusy(true);
    try {
      await leaveMatch(matchId);
      toast(t('match.leftToast'));
      setLeaveOpen(false);
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('match.leaveFail'));
      setLeaveOpen(false);
    } finally {
      setBusy(false);
    }
  }, [load, matchId, t, toast]);

  const doReady = useCallback(async () => {
    if (!joined) {
      toast(t('match.joinFirst'));
      return;
    }
    const next = !ready;
    try {
      await setReady(matchId, next);
      setReadyOn(next);
      setMatch((prev) => {
        if (!prev?.participants) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            meId && p.userId === meId ? { ...p, ready: next } : p
          ),
        };
      });
      toast(next ? t('match.ready') : t('match.notReady'));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('match.readyFail'));
    }
  }, [joined, matchId, meId, ready, t, toast]);

  const copyRoom = useCallback(async () => {
    const id = room?.roomId || match?.roomId;
    const pass = room?.password || match?.password;
    if (!joined || !id) {
      toast(t('match.roomSoon'));
      return;
    }
    await navigator.clipboard.writeText(
      t('match.roomClip').replace('{id}', id).replace('{pass}', pass ? `  ${t('match.pass')}: ${pass}` : ''),
    );
    toast(t('match.roomCopied'));
  }, [joined, match?.password, match?.roomId, room, t, toast]);

  const copyField = useCallback(
    async (value: string, okToast: string) => {
      if (!value) {
        toast(t('match.roomSoon'));
        return;
      }
      await navigator.clipboard.writeText(value);
      toast(okToast);
    },
    [t, toast],
  );

  const focusChat = useCallback(() => {
    if (!joined) {
      toast(t('match.chatHint'));
      return;
    }
    chatRef.current?.focus();
  }, [joined, t, toast]);

  useEffect(() => {
    return register({
      quickJoin: () => {
        if (joined) toast(t('match.alreadyJoined'));
        else requestJoin();
      },
      copyRoom,
      ready: () => void doReady(),
      leave: () => {
        if (!joined) toast(t('match.notInMatch'));
        else setLeaveOpen(true);
      },
      matchDetails: () => {
        document.getElementById('match-rules')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      openChat: focusChat,
      share: async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('match.linkCopied'));
      },
      leaderboard: () => navigate(`/user/play/${matchId}/result`),
    });
  }, [copyRoom, doReady, focusChat, joined, matchId, navigate, register, requestJoin, t, toast]);

  useEffect(() => {
    if (!joined) return;
    if (window.location.hash !== '#match-room') return;
    window.requestAnimationFrame(() => {
      document.getElementById('match-room')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [joined, room]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    try {
      await sendChat(matchId, text);
      setChat((prev) => [...prev, { username: t('match.you'), message: text, createdAt: new Date().toISOString() }]);
    } catch (err) {
      toast(isApiError(err) ? err.message : t('match.chatFail'));
    }
  }

  if (error) {
    return (
      <main className="play-main">
        <div className="play-empty">
          <h2>{error}</h2>
          <Link className="btn btn-primary" to="/user/play">
            {t('match.backToGames')}
          </Link>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="play-main">
        <div className="match-hero skeleton" />
        <div className="match-row skeleton" />
      </main>
    );
  }

  const started = (match.status || '').toLowerCase() === 'start' || (match.status || '').toLowerCase() === 'complete';
  const roomId = room?.roomId || match.roomId;
  const roomPass = room?.password || match.password;
  const prize = estimateMatchWinningPool(match);

  return (
    <main className="play-main">
      <Link className="play-back" to={params.get('from') ? `/user/play/${params.get('from')}` : '/user/play'}>
        ← {t('match.backList')}
      </Link>
      <header className="play-head">
        <div>
          <p className="eyebrow">{match.gameName || t('nav.play')}</p>
          <h1>{match.matchName}</h1>
          <p className="play-lead">
            {match.teamType} · {match.map || t('match.mapTbd')} · {formatWhen(match.matchSchedule)}
          </p>
        </div>
        <p className="play-count">
          <strong>
            {match.participantsCount || 0}/{match.totalPlayer || 0}
          </strong>
          <small>{joined ? t('match.joined') : t('match.spots')}</small>
        </p>
      </header>
      <div className="play-stage">
        <div className={`match-hero${match.banner || match.gameName ? '' : ' is-empty'}`}>
          <img
            src={coverForGame({ name: match.gameName, banner: match.banner })}
            alt=""
            width={1260}
            height={420}
            onError={(e) => {
              const img = e.currentTarget;
              const local = localCoverForGame({ name: match.gameName });
              if (img.getAttribute('src') === local || img.src.includes(local)) {
                img.style.display = 'none';
                img.parentElement?.classList.add('is-empty');
                return;
              }
              img.src = local;
            }}
          />
        </div>
        {watchOn ? (
          <p className="play-muted">
            {t('match.watchOn')}{' '}
            <button
              className="text-link"
              type="button"
              disabled={busy}
              onClick={async () => {
                try {
                  await createLab('watch', { title: `Watch · ${match.matchName}`, matchId: match.id || matchId });
                  toast(t('match.watchOpened'));
                  navigate('/user/labs/watch');
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('match.watchFail'));
                }
              }}
            >
              {t('match.startWatch')}
            </button>
          </p>
        ) : null}
        <div className="match-actions">
          {!joined ? (
            <button className="btn btn-primary" type="button" disabled={busy} onClick={requestJoin}>
              {busy ? t('match.joining') : t('match.join')}
            </button>
          ) : (
            <>
              <button className="btn btn-primary" type="button" onClick={() => void doReady()}>
                {ready ? t('match.unready') : t('match.ready')}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={started}
                onClick={() => setLeaveOpen(true)}
                title={started ? t('match.leaveBlocked') : t('match.leaveBefore')}
              >
                {t('match.leave')}
              </button>
            </>
          )}
          <Link className="btn btn-ghost" to={`/user/play/${match.id}/result`}>
            {t('match.results')}
          </Link>
        </div>

        <section id="match-room" className="room-card room-creds">
          <h2>{t('match.roomCreds')}</h2>
          {!joined ? (
            <p className="play-muted">{t('match.roomHidden')}</p>
          ) : roomId ? (
            <>
              <div className="pay-copy">
                <small>{t('match.roomIdLabel')}</small>
                <p className="pay-addr">
                  <b>{roomId}</b>
                </p>
                <button className="btn btn-ghost" type="button" onClick={() => void copyField(String(roomId), t('match.roomCopied'))}>
                  {t('match.copyId')}
                </button>
              </div>
              {roomPass ? (
                <div className="pay-copy">
                  <small>{t('match.passLabel')}</small>
                  <p className="pay-addr">
                    <b>{roomPass}</b>
                  </p>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => void copyField(String(roomPass), t('match.roomCopied'))}
                  >
                    {t('match.copyPass')}
                  </button>
                </div>
              ) : null}
              <button className="btn btn-primary" type="button" onClick={() => void copyRoom()}>
                {t('match.copyRoom')}
              </button>
              {match.matchPrivateDescription ? <p className="play-muted">{match.matchPrivateDescription}</p> : null}
            </>
          ) : (
            <p className="play-muted">{t('match.roomPending')}</p>
          )}
        </section>

        <section id="match-rules" className="match-facts">
          <article>
            <small>{t('match.entry')}</small>
            <strong>{match.matchType === 'free' || !match.entryFee ? t('match.free') : <CoinValue value={match.entryFee || 0} />}</strong>
          </article>
          {prize > 0 ? (
            <article>
              <small>{t('match.prize')}</small>
              <strong>
                <CoinValue value={prize} />
              </strong>
            </article>
          ) : null}
          <article>
            <small>{t('match.perKill')}</small>
            <strong>{match.perKill ?? 0}</strong>
          </article>
          <article>
            <small>{t('match.spots')}</small>
            <strong>
              {match.participantsCount || 0}/{match.totalPlayer || 0}
            </strong>
            <SpotBar used={match.participantsCount || 0} total={match.totalPlayer || 0} />
          </article>
          <article>
            <small>{t('match.left')}</small>
            <strong>{spotsLeft(match)}</strong>
          </article>
        </section>
        <p className="play-lead">{match.prizeDescription || match.matchDescription || t('match.prizeFallback')}</p>
      </div>
      <div className="hub-stage">
        <section className="room-card">
          <h2>{t('match.roster')}</h2>
          <ul className="roster">
            {(match.participants || []).map((p) => (
              <li key={p.id}>
                <span>
                  <b>{p.username}</b>
                  {p.pubgId ? <small>{p.pubgId}</small> : null}
                </span>
                {p.ready ? <i className="ready-tick" title={t('match.ready')} /> : null}
                {joined && p.userId && p.userId !== meId ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={async () => {
                      try {
                        await reportMatch(matchId, p.userId as string);
                        toast(t('match.reported'));
                      } catch (err) {
                        toast(isApiError(err) ? err.message : t('match.reportFail'));
                      }
                    }}
                  >
                    {t('match.report')}
                  </button>
                ) : null}
              </li>
            ))}
            {!match.participants?.length ? <li className="play-muted">{t('match.noPlayers')}</li> : null}
          </ul>
        </section>
        {joined ? (
          <section className="room-card">
            <h2>{t('match.lobbyChat')}</h2>
            <div className="chat-log">
              {chat.map((m, i) => (
                <p key={m.id || m._id || i}>
                  <b>{m.username || 'Player'}:</b> {m.message || m.text}
                </p>
              ))}
            </div>
            <form className="chat-form" onSubmit={onSend}>
              <input
                ref={chatRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('match.message')}
                aria-label={t('match.lobbyChat')}
              />
              <button className="btn btn-primary" type="submit">
                {t('match.send')}
              </button>
            </form>
          </section>
        ) : null}
      </div>
      {leaveOpen ? (
        <div className="play-sheet" role="dialog" aria-labelledby="leave-title">
          <button className="play-sheet-bg" type="button" aria-label={t('match.close')} onClick={() => setLeaveOpen(false)} />
          <div className="play-sheet-card">
            <h2 id="leave-title">{t('match.leaveTitle')}</h2>
            <p>{t('match.leaveLead')}</p>
            <div className="match-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setLeaveOpen(false)}>
                {t('match.stay')}
              </button>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void doLeave()}>
                {t('match.leave')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <MatchJoinDialog
        match={joinOpen ? match : null}
        balance={balance}
        joining={busy}
        error={joinError}
        onClose={() => {
          if (busy) return;
          setJoinOpen(false);
          setJoinError('');
        }}
        onConfirm={() => void doJoin()}
      />
    </main>
  );
}
