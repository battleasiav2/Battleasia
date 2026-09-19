import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';

type Ctx = { toast: (m: string) => void };

type MatchRow = {
  id?: string;
  _id?: string;
  matchName?: string;
  roomId?: string;
  entryFee?: number;
  totalPlayer?: number;
  teamType?: string;
  gameMode?: string;
  perKill?: number;
  platformFeePercent?: number;
  status?: string;
  winningsDistributed?: boolean;
  entriesRefunded?: boolean;
  resultDescription?: string;
  results?: Array<Record<string, unknown>>;
};

type EntryRow = {
  id: string;
  pubgId: string;
  playerName: string;
  avatar: string;
  status: 'winner' | 'lose';
  placement: number;
  kills: number;
  winPrize: number;
  bonus: number;
};

function winnerTeamSize(teamType?: string) {
  if (teamType === 'solo') return 1;
  if (teamType === 'duo') return 2;
  return 4;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Live prize-pool rules from admin result-view.tsx */
export function buildPrizePoolSummary(match: MatchRow | null, entries: EntryRow[]) {
  const totalPlayers = Number(match?.totalPlayer) || 0;
  const entryFee = Number(match?.entryFee) || 0;
  const feePercent = Number(match?.platformFeePercent ?? 5);
  const gameMode = match?.gameMode || 'classic';
  const wSize = winnerTeamSize(match?.teamType);

  const totalIncome = totalPlayers * entryFee;
  const platformFeeAmount = totalIncome * (feePercent / 100);
  const prizePool = totalIncome - platformFeeAmount;

  let loserCount = 0;
  let winnerTotalKills = 0;
  let perKill = 0;

  if (gameMode === 'classic') {
    loserCount = Math.max(0, totalPlayers - wSize);
    perKill = loserCount > 0 ? round2(prizePool / loserCount) : 0;
  } else {
    winnerTotalKills = entries
      .filter((r) => Number(r.placement) === 1)
      .reduce((sum, r) => sum + (Number(r.kills) || 0), 0);
    perKill = round2(Number(match?.perKill) || 0);
  }

  return {
    gameMode,
    totalIncome,
    platformFeeAmount,
    prizePool,
    killMoneyPool: prizePool,
    winnerTeamSize: wSize,
    loserCount,
    winnerTotalKills,
    perKill,
    feePercent,
    entryFee,
  };
}

/** Live: only winners earn kills × perKill + winPrize + bonus */
function participantWinnings(row: EntryRow, perKill: number) {
  const isWinner = row.status !== 'lose';
  const kills = Number(row.kills) || 0;
  const killWin = isWinner ? round2(kills * perKill) : 0;
  const winPrize = isWinner ? Number(row.winPrize) || 0 : 0;
  const bonus = isWinner ? Number(row.bonus) || 0 : 0;
  return {
    killWin,
    winPrize,
    bonus,
    totalWin: round2(killWin + winPrize + bonus),
  };
}

function resultKey(entry: Record<string, unknown>) {
  return String(entry.participantId || entry.id || entry._id || '');
}

export function MatchResultPage() {
  const { toast } = useOutletContext<Ctx>();
  const { id } = useParams();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    const matchPayload = await api(`/api/v3/games/matches/${id}`);
    const m = unwrapData<MatchRow>(matchPayload) || (matchPayload as MatchRow);
    const matchId = String(m.id || m._id || id);
    setMatch({ ...m, id: matchId });
    setNote(String(m.resultDescription || ''));

    const saved = Array.isArray(m.results) ? m.results : [];
    const savedById = new Map(saved.map((r) => [resultKey(r), r]));

    const partPayload = await api(`/api/v3/games/matches/${id}/participants?limit=500`);
    const partData = unwrapData<{ participants?: Array<Record<string, unknown>> }>(partPayload);
    const list = Array.isArray(partData?.participants)
      ? partData.participants
      : Array.isArray(partData)
        ? (partData as unknown as Array<Record<string, unknown>>)
        : [];

    // Live: prefer saved match.results (status / prizes) over raw participants
    const rows: EntryRow[] = list.map((p) => {
      const pid = String(p.id || p._id || '');
      const hit = savedById.get(pid);
      const statusRaw = String(hit?.status ?? '');
      return {
        id: pid,
        pubgId: String(hit?.pubgId || p.pubgId || ''),
        playerName: String(hit?.playerName || p.username || p.playerName || 'Player'),
        avatar: String(hit?.avatar || p.avatar || ''),
        status: (statusRaw === 'lose' ? 'lose' : 'winner') as 'winner' | 'lose',
        placement: Number(hit?.placement ?? p.placement) || 0,
        kills: Number(hit?.kills ?? p.kills) || 0,
        winPrize: Number(hit?.winPrize ?? p.winPrize) || 0,
        bonus: Number(hit?.bonus ?? p.bonus) || 0,
      };
    });

    // Include any result rows that somehow aren't in participants list
    for (const r of saved) {
      const pid = resultKey(r);
      if (!pid || rows.some((x) => x.id === pid)) continue;
      rows.push({
        id: pid,
        pubgId: String(r.pubgId || ''),
        playerName: String(r.playerName || 'Player'),
        avatar: String(r.avatar || ''),
        status: r.status === 'lose' ? 'lose' : 'winner',
        placement: Number(r.placement) || 0,
        kills: Number(r.kills) || 0,
        winPrize: Number(r.winPrize) || 0,
        bonus: Number(r.bonus) || 0,
      });
    }

    setEntries(rows);
  }, [id]);

  useEffect(() => {
    load().catch((err) => setError(isApiError(err) ? err.message : 'Match missing'));
  }, [load]);

  const pool = useMemo(() => buildPrizePoolSummary(match, entries), [match, entries]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (r) => r.playerName.toLowerCase().includes(q) || r.pubgId.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const winners = useMemo(() => entries.filter((r) => r.status === 'winner'), [entries]);
  const losers = useMemo(() => entries.filter((r) => r.status === 'lose'), [entries]);

  const payoutTotal = useMemo(
    () => entries.reduce((sum, row) => sum + participantWinnings(row, pool.perKill).totalWin, 0),
    [entries, pool.perKill],
  );

  function patchEntry(entryId: string, patch: Partial<EntryRow>) {
    setEntries((prev) =>
      prev.map((row) => {
        if (row.id !== entryId) return row;
        const next = { ...row, ...patch };
        if (patch.status === 'lose') {
          next.winPrize = 0;
          next.bonus = 0;
        }
        if (patch.status === 'winner' && !next.placement) next.placement = 1;
        return next;
      }),
    );
  }

  /** Live save payload — status winner|lose goes to match.results (user result page reads this). */
  function buildResultsPayload() {
    if (!match) throw new Error('Match missing');
    return entries.map((row) => {
      const isWinner = row.status !== 'lose';
      const rawPlacement = Number(row.placement) || 0;
      // Live: winner with unset placement defaults to 1 (backend uses placement for ranking)
      const placement = isWinner ? (rawPlacement === 0 ? 1 : rawPlacement) : rawPlacement || null;
      const kills = Number(row.kills) || 0;
      const win = participantWinnings({ ...row, status: isWinner ? 'winner' : 'lose', kills }, pool.perKill);
      const placementScore = isWinner && placement ? 101 - Number(placement) : 0;
      const killPoints = isWinner ? kills * (Number(match.perKill) || pool.perKill) : 0;

      return {
        participantId: row.id,
        pubgId: row.pubgId,
        playerName: row.playerName,
        avatar: row.avatar,
        status: isWinner ? ('winner' as const) : ('lose' as const),
        placement,
        kills,
        points: round2(placementScore + killPoints),
        // API distribute = placePoint + winPrize + bonus
        // Map killWin → placePoint so TOTAL WIN is paid (live UI shows killWin separately)
        placePoint: win.killWin,
        winPrize: win.winPrize,
        bonus: win.bonus,
        refund: 0,
      };
    });
  }

  async function persistEntries() {
    if (!id || !match) throw new Error('Match missing');
    const results = buildResultsPayload();
    await api(`/api/v3/games/matches/${id}/entries`, {
      method: 'PUT',
      body: JSON.stringify({ entries: results }),
    });
    await api(`/api/v3/games/matches/${id}/results`, {
      method: 'PUT',
      body: JSON.stringify({ resultDescription: note, screenshots: [] }),
    });
  }

  async function saveEntries() {
    if (busy) return;
    if (!entries.length) {
      toast('No participants to save');
      return;
    }
    if (!winners.length) {
      toast('Mark at least one winner (or set losers) before save');
    }
    setBusy(true);
    try {
      await persistEntries();
      toast(`Results saved · ${winners.length} winner / ${losers.length} lose`);
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function distribute() {
    if (!id || busy) return;
    if (!entries.length) {
      toast('No participants to distribute');
      return;
    }
    if (payoutTotal <= 0) {
      toast('Enter kills / prizes for winners before distribute');
      return;
    }
    if (payoutTotal - pool.prizePool > 0.05) {
      toast(`Payout ${payoutTotal.toFixed(2)} exceeds prize pool ${pool.prizePool.toFixed(2)}`);
      return;
    }
    if (!window.confirm(`Distribute ${payoutTotal.toLocaleString()} BAC to winners?`)) return;
    setBusy(true);
    try {
      await persistEntries();
      await api(`/api/v3/games/matches/${id}/distribute-winnings`, { method: 'POST', body: '{}' });
      toast('Winnings distributed — users see win/lose on result page');
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : 'Distribute blocked');
    } finally {
      setBusy(false);
    }
  }

  async function refund() {
    if (!id) return;
    if (!window.confirm('Refund entry fees to all participants?')) return;
    setBusy(true);
    try {
      const res = await api(`/api/v3/games/matches/${id}/refund`, { method: 'POST', body: '{}' });
      const data = unwrapData<{ refunded?: number }>(res);
      toast(`Refund complete: ${data?.refunded ?? 0} participant(s)`);
      await load();
    } catch (err) {
      toast(isApiError(err) ? err.message : 'Refund failed');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <main className="admin-body">
        <h1>Match result</h1>
        <p className="form-error">{error}</p>
        <Link className="btn btn-ghost" to="/games/matches">
          Back
        </Link>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="admin-body">
        <h1>Match result</h1>
        <p className="admin-lead">Loading…</p>
      </main>
    );
  }

  const locked = Boolean(match.winningsDistributed);

  return (
    <main className="admin-body">
      <header className="dash-head dash-head-row">
        <div>
          <p className="dash-eyebrow">Result · live rules</p>
          <h1>{match.matchName || 'Match result'}</h1>
          <p className="admin-lead">
            {(match.teamType || 'squad').toUpperCase()} · {pool.gameMode} · Room {match.roomId || '—'} ·{' '}
            {winners.length} winner · {losers.length} lose
          </p>
        </div>
        <Link className="btn btn-ghost" to="/games/matches">
          Back
        </Link>
      </header>

      <section className="stat-grid prize-pool-grid">
        <article className="stat-card">
          <small>Total income</small>
          <strong>{pool.totalIncome.toLocaleString()}</strong>
          <span className="admin-lead">
            {match.totalPlayer} × {match.entryFee}
          </span>
        </article>
        <article className="stat-card">
          <small>Platform fee ({pool.feePercent}%)</small>
          <strong>−{pool.platformFeeAmount.toLocaleString()}</strong>
        </article>
        <article className="stat-card featured">
          <small>Prize pool</small>
          <strong>{pool.prizePool.toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <small>
            Per kill
            {pool.gameMode === 'classic' ? ` (÷${pool.loserCount} losers)` : ' (match rate)'}
          </small>
          <strong>{pool.perKill.toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <small>Planned payout</small>
          <strong>{payoutTotal.toLocaleString()}</strong>
        </article>
      </section>

      <div className="dash-stage list-stage" style={{ marginTop: 16 }}>
        <div className="table-tools">
          <input
            value={search}
            placeholder="Search player / PUBG ID"
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="chip on">{entries.length} players</span>
          <span className="chip">{winners.length} winner</span>
          <span className="chip">{losers.length} lose</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table compact">
            <thead>
              <tr>
                <th>#</th>
                <th>PUBG ID</th>
                <th>Player</th>
                <th>Status</th>
                <th>Place</th>
                <th>Kills</th>
                <th>Kill win</th>
                <th>Win prize</th>
                <th>Bonus</th>
                <th>Total win</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => {
                const win = participantWinnings(row, pool.perKill);
                const loser = row.status === 'lose';
                return (
                  <tr key={row.id} className={loser ? 'is-lose' : 'is-win'}>
                    <td>{i + 1}</td>
                    <td>
                      <code>{row.pubgId || '—'}</code>
                    </td>
                    <td>{row.playerName}</td>
                    <td>
                      <select
                        value={row.status}
                        disabled={busy || locked}
                        onChange={(e) =>
                          patchEntry(row.id, { status: e.target.value as 'winner' | 'lose' })
                        }
                      >
                        <option value="winner">Winner</option>
                        <option value="lose">Lose</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={row.placement}
                        disabled={busy || loser || locked}
                        onChange={(e) => patchEntry(row.id, { placement: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={row.kills}
                        disabled={busy || locked}
                        onChange={(e) => patchEntry(row.id, { kills: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <strong>{win.killWin.toLocaleString()}</strong>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.winPrize}
                        disabled={busy || loser || locked}
                        onChange={(e) => patchEntry(row.id, { winPrize: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.bonus}
                        disabled={busy || loser || locked}
                        onChange={(e) => patchEntry(row.id, { bonus: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <strong>{win.totalWin.toLocaleString()}</strong>
                    </td>
                  </tr>
                );
              })}
              {!visible.length ? (
                <tr>
                  <td colSpan={10}>No participants yet — players must join the match first.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <p className="admin-lead" style={{ marginTop: 12 }}>
        Save writes winner/lose into match results (user result page). Distribute pays kill win + win prize + bonus to
        wallets.
      </p>

      <label className="field" style={{ marginTop: 12, maxWidth: 640 }}>
        Result note
        <textarea value={note} rows={3} onChange={(e) => setNote(e.target.value)} disabled={busy} />
      </label>

      <div
        className="table-tools"
        style={{ marginTop: 12, borderRadius: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <button className="btn btn-primary" type="button" disabled={busy || locked} onClick={() => void saveEntries()}>
          {busy ? 'Saving…' : 'Save results (win / lose)'}
        </button>
        <button className="btn btn-primary" type="button" disabled={busy || locked} onClick={() => void distribute()}>
          Distribute winnings
        </button>
        <button
          className="btn btn-danger"
          type="button"
          disabled={busy || locked || match.entriesRefunded}
          onClick={() => void refund()}
        >
          Refund entries
        </button>
        {locked ? <span className="chip on">Already distributed</span> : null}
        {match.entriesRefunded ? <span className="chip on">Already refunded</span> : null}
      </div>
    </main>
  );
}
