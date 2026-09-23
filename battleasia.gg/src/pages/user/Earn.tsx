import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import {
  claimMission,
  claimSeason,
  claimSquad,
  claimStreak,
  claimWeekly,
  claimWelcome,
  createSquad,
  doSpin,
  fetchBadges,
  fetchEarnHome,
  joinSquad,
  leaveSquad,
  sendSquadChat,
  fetchSquadChat,
  type BadgeRow,
  type EarnHome,
} from '../../lib/earn';
import { fetchP1Flags, type P1Flags } from '../../lib/p1';
import { useI18n } from '../../lib/i18n';
import { createPost } from '../../lib/social';
import { openBacShop } from '../../lib/wallet';

type ShellCtx = { setBalance: (n: number) => void };

const TABS = [
  ['overview', 'earn.tabOverview'],
  ['missions', 'earn.tabMissions'],
  ['streak', 'earn.tabStreak'],
  ['spin', 'earn.tabSpin'],
  ['squad', 'earn.tabSquad'],
  ['season', 'earn.tabSeason'],
  ['badges', 'earn.tabBadges'],
] as const;

export function EarnPage() {
  const { t } = useI18n();
  const { toast } = useHudPage();
  const { setBalance } = useOutletContext<ShellCtx>();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') || 'overview') as (typeof TABS)[number][0];
  const [home, setHome] = useState<EarnHome | null>(null);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [squadName, setSquadName] = useState('');
  const [invite, setInvite] = useState('');
  const [flags, setFlags] = useState<P1Flags | null>(null);

  const reload = useCallback(async () => {
    const data = await fetchEarnHome();
    setHome(data);
    try {
      const b = await fetchBadges();
      setBadges(b.badges || []);
    } catch {
      setBadges([]);
    }
  }, []);

  useEffect(() => {
    reload().catch((err) => setError(isApiError(err) ? err.message : t('earn.offline')));
  }, [reload]);

  useEffect(() => {
    fetchP1Flags().then(setFlags);
  }, []);

  async function run(id: string, fn: () => Promise<{ balanceAfter?: number } | unknown>) {
    setBusy(id);
    try {
      const res = (await fn()) as { balanceAfter?: number };
      if (res && typeof res === 'object' && res.balanceAfter != null) setBalance(Number(res.balanceAfter) || 0);
      toast(t('earn.claimedToast'));
      await reload();
    } catch (err) {
      toast(isApiError(err) ? err.message : t('earn.fail'));
    } finally {
      setBusy('');
    }
  }

  if (error && !home) {
    return (
      <main className="play-main">
        <div className="play-empty">
          <h2>{error}</h2>
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
            {t('earn.reload')}
          </button>
        </div>
      </main>
    );
  }

  if (!home) {
    return (
      <main className="play-main">
        <div className="match-row skeleton" />
      </main>
    );
  }

  if (home.settings && home.settings.enabled === false) {
    return (
      <main className="play-main">
        <div className="play-empty">
          <h2>{t('earn.off')}</h2>
          <p>{t('earn.offLead')}</p>
          <button type="button" className="btn btn-primary" onClick={() => openBacShop('wallet')}>
            {t('nav.wallet')}
          </button>
        </div>
      </main>
    );
  }

  const missions = home.missions || [];
  const streak = home.streak || {};
  const spin = home.luckySpin || {};
  const squad = home.squadChallenge || {};
  const season = home.seasonPass || {};
  const welcome = home.welcome || {};

  const claimableMissions = missions.filter((m) => m.status === 'completed').length;
  const level = home.level?.level ?? 1;
  const progressPct = Math.min(100, Number(home.level?.progressPct ?? 0));
  const ranks = [
    { min: 1, title: 'Rookie', tone: 'bronze' },
    { min: 5, title: 'Contender', tone: 'silver' },
    { min: 10, title: 'Veteran', tone: 'gold' },
    { min: 20, title: 'Elite', tone: 'platinum' },
    { min: 35, title: 'Champion', tone: 'diamond' },
    { min: 50, title: 'Legend', tone: 'master' },
  ] as const;
  const activeRank = [...ranks].reverse().find((r) => level >= r.min) || ranks[0];

  return (
    <main className="play-main play-main-tight earn-hub earn-board">
      <header className="play-head play-head-compact earn-hub-head">
        <div>
          <p className="eyebrow">{t('nav.earn')}</p>
          <h1>{t('earn.title')}</h1>
        </div>
        <p className="play-count">
          <strong>{level}</strong>
          <small>{home.level?.title?.title || t('earn.rookie')}</small>
        </p>
      </header>

      <section className="earn-ranks" aria-label={t('earn.titleLabel')}>
        {ranks.map((r) => (
          <div key={r.title} className={`earn-rank ${r.tone} ${activeRank.title === r.title ? 'is-on' : level >= r.min ? 'is-done' : ''}`}>
            <span className="earn-rank-orb" aria-hidden />
            <small>{r.title}</small>
          </div>
        ))}
      </section>

      <section className="earn-hero">
        <div
          className="earn-ring"
          style={{ ['--pct' as string]: String(progressPct) }}
          aria-label={`${t('earn.toNext')} ${progressPct}%`}
        >
          <strong>{progressPct}%</strong>
          <small>{t('earn.toNext')}</small>
        </div>
        <div className="earn-hero-copy">
          <h2>{home.level?.title?.title || t('earn.rookie')}</h2>
          <p>
            {t('earn.level')} {level} · {t('earn.xp')} {home.level?.xp ?? 0}
          </p>
          {tab === 'overview' && home.depositBonusDays?.active ? (
            <p className="earn-hero-tip">
              +{home.depositBonusDays.percent}% {home.depositBonusDays.title}
            </p>
          ) : null}
          {tab === 'overview' && flags?.cashbackDays ? <p className="earn-hero-tip">{t('earn.cashbackOn')}</p> : null}
        </div>
      </section>

      <div className="money-tabs earn-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setParams({ tab: id })}>
            {t(label)}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <section className="earn-tasks">
          <h2>{t('earn.tabMissions')}</h2>
          <ul className="earn-task-list">
            {(welcome.enabled ? welcome.milestones || [] : []).map((w) => (
              <li key={w.key || w.title} className={`earn-task ${w.canClaim ? 'is-ready' : w.claimed ? 'is-done' : ''}`}>
                <span className="earn-task-icon" aria-hidden>
                  ★
                </span>
                <div className="earn-task-body">
                  <strong>{w.title}</strong>
                  <small>{w.claimed ? t('earn.claimed') : t('earn.welcome')}</small>
                </div>
                <span className="earn-task-reward">
                  +<CoinValue value={w.bacAmount || 0} />
                </span>
                {w.canClaim && w.key ? (
                  <button className="btn btn-primary earn-task-go" type="button" disabled={busy === w.key} onClick={() => void run(w.key!, () => claimWelcome(w.key!))}>
                    {busy === w.key ? t('earn.claiming') : t('earn.claim')}
                  </button>
                ) : (
                  <button className="btn btn-ghost earn-task-go" type="button" disabled>
                    {w.claimed ? t('earn.claimed') : t('earn.openTab')}
                  </button>
                )}
              </li>
            ))}
            <li className="earn-task">
              <span className="earn-task-icon" aria-hidden>
                ✓
              </span>
              <div className="earn-task-body">
                <strong>{t('earn.tabMissions')}</strong>
                <small>
                  {claimableMissions ? `${claimableMissions} ${t('earn.claimable')}` : `${missions.length} ${t('earn.openTab')}`}
                </small>
              </div>
              <span className="earn-task-reward">{missions.length}</span>
              <button className="btn btn-primary earn-task-go" type="button" onClick={() => setParams({ tab: 'missions' })}>
                {t('earn.openTab')}
              </button>
            </li>
            <li className="earn-task">
              <span className="earn-task-icon" aria-hidden>
                🔥
              </span>
              <div className="earn-task-body">
                <strong>{t('earn.tabStreak')}</strong>
                <small>
                  {t('earn.current')} {streak.currentStreak ?? 0}
                </small>
              </div>
              <span className="earn-task-reward">
                +<CoinValue value={streak.todayReward || 0} />
              </span>
              <button className="btn btn-primary earn-task-go" type="button" onClick={() => setParams({ tab: 'streak' })}>
                {streak.canClaim ? t('earn.claim') : t('earn.openTab')}
              </button>
            </li>
            <li className="earn-task">
              <span className="earn-task-icon" aria-hidden>
                🎡
              </span>
              <div className="earn-task-body">
                <strong>{t('earn.tabSpin')}</strong>
                <small>
                  {spin.remaining ?? 0} {t('earn.spinLeft')}
                </small>
              </div>
              <span className="earn-task-reward">{spin.remaining ?? 0}</span>
              <button className="btn btn-primary earn-task-go" type="button" onClick={() => setParams({ tab: 'spin' })}>
                {t('earn.spin')}
              </button>
            </li>
            <li className="earn-task">
              <span className="earn-task-icon" aria-hidden>
                👥
              </span>
              <div className="earn-task-body">
                <strong>{t('earn.tabSquad')}</strong>
                <small>
                  {t('earn.wins')} {squad.winCount ?? 0}/{squad.targetWins ?? 0}
                </small>
              </div>
              <span className="earn-task-reward">
                {squad.winCount ?? 0}/{squad.targetWins ?? 0}
              </span>
              <button className="btn btn-primary earn-task-go" type="button" onClick={() => setParams({ tab: 'squad' })}>
                {t('earn.openTab')}
              </button>
            </li>
            <li className="earn-task">
              <span className="earn-task-icon" aria-hidden>
                🎖
              </span>
              <div className="earn-task-body">
                <strong>{t('earn.tabSeason')}</strong>
                <small>
                  {t('earn.tier')} {season.currentTier ?? 0}
                </small>
              </div>
              <span className="earn-task-reward">{season.claimableCount ?? 0}</span>
              <button className="btn btn-primary earn-task-go" type="button" onClick={() => setParams({ tab: 'season' })}>
                {t('earn.openTab')}
              </button>
            </li>
            {home.weeklyArena?.enabled ? (
              <li className="earn-task is-ready">
                <span className="earn-task-icon" aria-hidden>
                  🏆
                </span>
                <div className="earn-task-body">
                  <strong>{t('earn.weekly')}</strong>
                  <small>
                    {t('earn.yourRank')}: {home.weeklyArena.viewerRank ?? '—'}
                  </small>
                </div>
                <span className="earn-task-reward">BAC</span>
                <button className="btn btn-primary earn-task-go" type="button" disabled={busy === 'weekly'} onClick={() => void run('weekly', claimWeekly)}>
                  {t('earn.claimWeekly')}
                </button>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {tab === 'missions' ? (
        <section className="earn-tasks">
          <h2>{t('earn.tabMissions')}</h2>
          {missions.length === 0 ? (
            <div className="play-empty">
              <h2>{t('earn.noMissions')}</h2>
              <p>{t('earn.noMissionsLead')}</p>
              <Link className="btn btn-primary" to="/user/play">
                {t('nav.play')}
              </Link>
            </div>
          ) : (
            <ul className="earn-task-list">
              {missions.map((m) => (
                <li key={m.id} className={`earn-task ${m.status === 'completed' ? 'is-ready' : ''}`}>
                  <span className="earn-task-icon" aria-hidden>
                    ◆
                  </span>
                  <div className="earn-task-body">
                    <strong>{m.mission?.title || t('earn.missionFallback')}</strong>
                    <small>{m.mission?.description}</small>
                    <div className="earn-bar" aria-hidden>
                      <i style={{ width: `${Math.min(100, (m.progress / Math.max(m.target, 1)) * 100)}%` }} />
                    </div>
                    <small>
                      {m.progress}/{m.target}
                    </small>
                  </div>
                  <span className="earn-task-reward">
                    +<CoinValue value={m.mission?.reward?.bacAmount || 0} />
                  </span>
                  {m.status === 'completed' ? (
                    <button className="btn btn-primary earn-task-go" type="button" disabled={busy === m.id} onClick={() => void run(m.id, () => claimMission(m.id))}>
                      {busy === m.id ? t('earn.claiming') : t('earn.claim')}
                    </button>
                  ) : (
                    <Link className="btn btn-ghost earn-task-go" to="/user/play">
                      {t('nav.play')}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'streak' ? (
        <section className="room-card">
          <h2>{t('earn.streak')}</h2>
          {!streak.enabled ? (
            <p className="play-muted">{t('earn.streakOff')}</p>
          ) : (
            <>
              <p className={(streak.currentStreak || 0) > 1 ? 'streak-hot' : undefined}>
                {(streak.currentStreak || 0) > 1 ? <span className="streak-flame" aria-hidden /> : null}
                {t('earn.current')} {streak.currentStreak ?? 0} · {t('earn.best')} {streak.longestStreak ?? 0} · {t('earn.today')}{' '}
                <CoinValue value={streak.todayReward || 0} />
              </p>
              <div className="streak-cal">
                {(streak.calendar || []).map((d) => (
                  <span
                    key={d.date}
                    className={`${d.checkedIn ? 'is-in' : ''} ${d.isToday ? 'is-today' : ''} ${d.isToday && d.checkedIn ? 'is-flame' : ''}`}
                  >
                    {d.date.slice(-2)}
                  </span>
                ))}
              </div>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!streak.canClaim || busy === 'streak'}
                onClick={() => void run('streak', claimStreak)}
              >
                {streak.claimedToday ? t('earn.claimedToday') : t('earn.claimStreak')}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={async () => {
                  try {
                    await createPost(`Day ${streak.currentStreak ?? 0} streak on BattleAsia. #streak`);
                    toast(t('earn.sharedStreak'));
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('earn.shareFail'));
                  }
                }}
              >
                {t('earn.shareStreak')}
              </button>
            </>
          )}
        </section>
      ) : null}

      {tab === 'spin' ? (
        <section className="room-card">
          <h2>{spin.title || t('earn.spinFallback')}</h2>
          {!spin.enabled ? (
            <p className="play-muted">{t('earn.spinOff')}</p>
          ) : (
            <>
              <p className="play-muted">{spin.description}</p>
              <p>
                {t('earn.spinLeft')}: {spin.remaining ?? 0}/{spin.dailyFreeSpins ?? 0}
              </p>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!spin.remaining || busy === 'spin'}
                onClick={async () => {
                  setBusy('spin');
                  try {
                    const res = await doSpin();
                    if (res.balanceAfter != null) setBalance(Number(res.balanceAfter) || 0);
                    toast(res.prizeLabel ? `${t('earn.youWon')} ${res.prizeLabel}` : t('earn.spinOk'));
                    await reload();
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('earn.spinFail'));
                  } finally {
                    setBusy('');
                  }
                }}
              >
                {busy === 'spin' ? t('earn.spinning') : t('earn.spin')}
              </button>
              {spin.recent?.length ? (
                <ul className="roster">
                  {spin.recent.map((r, i) => (
                    <li key={i}>
                      {r.prizeLabel} <CoinValue value={r.bacAmount || 0} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {tab === 'squad' ? (
        <section className="room-card">
          <h2>{squad.title || t('earn.squadFallback')}</h2>
          {!squad.enabled ? (
            <p className="play-muted">{t('earn.squadOff')}</p>
          ) : (
            <>
              <p className="play-muted">{squad.description}</p>
              <p>
                {t('earn.wins')} {squad.winCount ?? 0}/{squad.targetWins ?? 0}
              </p>
              {squad.squad ? (
                <>
                  <p>
                    {squad.squad.name} · code <b>{squad.squad.inviteCode}</b>
                  </p>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(squad.squad?.inviteCode || '');
                      toast(t('earn.inviteCopied'));
                    }}
                  >
                    {t('earn.copyInvite')}
                  </button>
                  {squad.canClaim ? (
                    <button className="btn btn-primary" type="button" disabled={busy === 'squad'} onClick={() => void run('squad', claimSquad)}>
                      {t('earn.claimSquad')}
                    </button>
                  ) : null}
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={async () => {
                      try {
                        await leaveSquad();
                        toast(t('earn.leftSquad'));
                        await reload();
                      } catch (err) {
                        toast(isApiError(err) ? err.message : t('earn.leaveFail'));
                      }
                    }}
                  >
                    {t('earn.leave')}
                  </button>
                  {flags?.squadChat ? <SquadChatBox toast={toast} /> : null}
                </>
              ) : (
                <form
                  className="money-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      if (invite.trim()) await joinSquad(invite.trim());
                      else await createSquad(squadName.trim() || 'Squad');
                      toast(invite.trim() ? t('earn.joinedSquad') : t('earn.squadCreated'));
                      await reload();
                    } catch (err) {
                      toast(isApiError(err) ? err.message : t('earn.squadFail'));
                    }
                  }}
                >
                  <label className="field">
                    {t('earn.createName')}
                    <input value={squadName} onChange={(e) => setSquadName(e.target.value)} maxLength={32} />
                  </label>
                  <label className="field">
                    {t('earn.joinCode')}
                    <input value={invite} onChange={(e) => setInvite(e.target.value.toUpperCase())} maxLength={12} />
                  </label>
                  <button className="btn btn-primary" type="submit">
                    {invite.trim() ? t('earn.join') : t('earn.create')}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      ) : null}

      {tab === 'season' ? (
        <section className="room-card">
          <h2>{season.title || t('earn.seasonFallback')}</h2>
          {!season.enabled ? (
            <p className="play-muted">{t('earn.seasonOff')}</p>
          ) : (
            <>
              <p>
                {t('earn.xp')} {season.xp ?? 0} · {t('earn.tier')} {season.currentTier ?? 0} · {t('earn.claimable')} {season.claimableCount ?? 0}
              </p>
              <span
                className="pass-ring lg"
                style={{ ['--pct' as string]: String(Math.min(100, Number(home.level?.progressPct ?? 0))) }}
                aria-hidden
              />
              <ul className="earn-list">
                {(season.tiers || []).map((tier) => (
                  <li key={tier.level}>
                    <div>
                      <strong>{t('earn.levelN')} {tier.level}</strong>
                      <small>{t('earn.needsXp')} {tier.xpRequired} {t('earn.xp')}</small>
                    </div>
                    <div className="match-actions">
                      <button
                        className="btn btn-ghost"
                        type="button"
                        disabled={!tier.canClaimFree || busy === `s${tier.level}f`}
                        onClick={() => void run(`s${tier.level}f`, () => claimSeason(tier.level || 1, 'free'))}
                      >
                        {t('earn.free')} {tier.freeReward?.bacAmount ?? 0}
                      </button>
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={!tier.canClaimPlus || busy === `s${tier.level}p`}
                        onClick={() => void run(`s${tier.level}p`, () => claimSeason(tier.level || 1, 'plus'))}
                      >
                        {t('earn.plus')} {tier.plusReward?.bacAmount ?? 0}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : null}

      {tab === 'badges' ? (
        <section>
          <h2>{t('earn.tabBadges')}</h2>
          {badges.length === 0 ? (
            <div className="play-empty">
              <h2>{t('earn.noBadges')}</h2>
              <p>{t('earn.noBadgesLead')}</p>
            </div>
          ) : (
            <div className="play-grid">
              {badges.map((b) => (
                <article key={b.id || b.title} className={`play-card ${b.unlocked ? '' : 'is-soon'}`}>
                  <div className="play-card-meta">
                    <strong>{b.title}</strong>
                    <small>
                      {b.description} {b.unlocked ? `· ${t('earn.unlocked')}` : `· ${b.current ?? 0}/${b.threshold ?? 0}`}
                    </small>
                    {b.unlocked ? (
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={async () => {
                          try {
                            await createPost(`Unlocked ${b.title} on BattleAsia. #badge`);
                            toast(t('earn.sharedBadge'));
                          } catch (err) {
                            toast(isApiError(err) ? err.message : t('earn.shareFail'));
                          }
                        }}
                      >
                        {t('earn.share')}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

    </main>
  );
}

function SquadChatBox({ toast }: { toast: (m: string) => void }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<Array<{ id: string; username: string; body: string }>>([]);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    fetchSquadChat()
      .then((list) => setRows(Array.isArray(list) ? list : []))
      .catch(() => setRows([]));
  }, []);
  return (
    <form
      className="chat-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        try {
          await sendSquadChat(draft.trim());
          setDraft('');
          const list = await fetchSquadChat();
          setRows(Array.isArray(list) ? list : []);
        } catch (err) {
          toast(isApiError(err) ? err.message : t('earn.chatOff'));
        }
      }}
    >
      <h3>{t('earn.squadChat')}</h3>
      <ul className="roster">
        {rows.map((m) => (
          <li key={m.id}>
            <b>{m.username}</b> {m.body}
          </li>
        ))}
      </ul>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('earn.msgSquad')} maxLength={500} />
      <button className="btn btn-ghost" type="submit">
        {t('earn.send')}
      </button>
    </form>
  );
}
