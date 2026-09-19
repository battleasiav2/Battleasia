import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, isApiError, unwrapData, unwrapList } from '../lib/api';

type Ctx = { toast: (m: string) => void };

type GameRow = { id?: string; _id?: string; name?: string; packageName?: string };

/** Same 5 titles as live PLATFORM_GAMES / play UI */
const ARENA_GAMES = [
  { name: 'PUBG Mobile', packageName: 'com.tencent.ig', idPrefix: 'PUBG', image: '/covers/pubg.webp' },
  { name: 'Free Fire', packageName: 'com.dts.freefireth', idPrefix: 'FF', image: '/covers/freefire.webp' },
  { name: 'Call of Duty Mobile', packageName: 'com.activision.callofduty.shooter', idPrefix: 'COD', image: '/covers/cod.webp' },
  { name: 'Valorant Mobile', packageName: 'com.riotgames.valorant', idPrefix: 'VAL', image: '/covers/valorant.webp' },
  { name: 'Mobile Legends', packageName: 'com.mobilelegends', idPrefix: 'ML', image: '/covers/mlbb.webp' },
] as const;

const CLASSIC_MAPS = ['Erangel', 'Rondo', 'Miramar', 'Nusa', 'Vikendi', 'Sanhok', 'Livik', 'Karakin'];
const TDM_MAPS = ['Warehouse', 'Hanger', 'Gun'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function ensureHttps(url: string) {
  const v = url.trim();
  if (!v) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function randRoom() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function randPass() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function toLocalInput(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function winnerTeamSize(teamType: string) {
  if (teamType === 'solo') return 1;
  if (teamType === 'duo') return 2;
  return 4;
}

function gameKey(g: GameRow) {
  return String(g.id || g._id || '');
}

export function MatchFormPage() {
  const { toast } = useOutletContext<Ctx>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [slugLocked, setSlugLocked] = useState(Boolean(id));
  const [createForAllFive, setCreateForAllFive] = useState(!id);
  const [form, setForm] = useState({
    gameId: '',
    matchName: '',
    matchUrl: '',
    roomId: '',
    password: '',
    entryFee: '10',
    totalPlayer: '100',
    teamType: 'squad',
    gameMode: 'classic',
    map: '',
    matchSchedule: '',
    platformFeePercent: '5',
    status: 'active',
    matchType: 'paid',
    perKill: '0',
    killRateType: 'automatic',
    totalKills: '40',
    prizeDescription: '',
    matchSponsor: '',
    matchDescription: '',
    matchPrivateDescription: '',
    premiumOnly: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const maps = form.gameMode === 'tdm' ? TDM_MAPS : CLASSIC_MAPS;
  const wSize = winnerTeamSize(form.teamType);
  const players = Number(form.totalPlayer) || 0;
  const fee = Number(form.entryFee) || 0;
  const feePercent = Number(form.platformFeePercent) || 5;
  const totalIncome = players * fee;
  const prizePool = totalIncome * (1 - feePercent / 100);
  const loserCount = Math.max(0, players - wSize);

  const autoPerKill = useMemo(() => {
    if (form.killRateType !== 'automatic') return null;
    if (form.gameMode === 'tdm') {
      const kills = Number(form.totalKills) || 40;
      return kills > 0 ? Number((prizePool / kills).toFixed(2)) : 0;
    }
    return loserCount > 0 ? Number((prizePool / loserCount).toFixed(2)) : 0;
  }, [form.gameMode, form.killRateType, form.totalKills, loserCount, prizePool]);

  const perKillHelper =
    form.killRateType === 'automatic'
      ? form.gameMode === 'tdm'
        ? `Auto: prizePool ÷ 40 kills = ${prizePool.toFixed(2)} ÷ 40 = ${(autoPerKill ?? 0).toFixed(2)}  [${feePercent}% fee]`
        : `Auto: prizePool ÷ loserCount = ${prizePool.toFixed(2)} ÷ ${loserCount} = ${(autoPerKill ?? 0).toFixed(2)}  [${feePercent}% fee, loserCount = ${players} − ${wSize}]`
      : 'Enter the coin reward per kill manually';

  useEffect(() => {
    if (autoPerKill == null) return;
    setForm((prev) => (prev.perKill === String(autoPerKill) ? prev : { ...prev, perKill: String(autoPerKill) }));
  }, [autoPerKill]);

  useEffect(() => {
    if (form.matchType === 'free' && fee !== 0) set('entryFee', '0');
  }, [form.matchType, fee]);

  async function loadGames() {
    let list = unwrapList<GameRow>(await api('/api/v3/games/list?limit=50'));
    const have = new Set(list.map((g) => String(g.packageName || g.name || '').toLowerCase()));
    for (const seed of ARENA_GAMES) {
      const hit =
        have.has(seed.packageName.toLowerCase()) ||
        [...have].some((n) => n.includes(seed.name.toLowerCase().split(' ')[0]));
      if (hit) continue;
      try {
        await api('/api/v3/games/list', {
          method: 'POST',
          body: JSON.stringify({
            name: seed.name,
            packageName: seed.packageName,
            idPrefix: seed.idPrefix,
            image: seed.image,
            logo: seed.image,
            rules: `${seed.name} tournament rules — same match create / join system.`,
            status: true,
            comingSoon: false,
            canCreateChallenge: true,
          }),
        });
      } catch {
        /* ignore duplicate */
      }
    }
    list = unwrapList<GameRow>(await api('/api/v3/games/list?limit=50'));
    setGames(list);
    if (!id && !form.gameId && list[0]) {
      setForm((prev) => ({ ...prev, gameId: gameKey(list[0]) }));
    }
  }

  useEffect(() => {
    loadGames().catch(() => setGames([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    api(`/api/v3/games/matches/${id}`)
      .then((payload) => {
        const m = unwrapData<Record<string, unknown>>(payload);
        setCreateForAllFive(false);
        setForm({
          gameId: String(m.gameId || ''),
          matchName: String(m.matchName || m.title || ''),
          matchUrl: String(m.matchUrl || ''),
          roomId: String(m.roomId || ''),
          password: String(m.password || ''),
          entryFee: String(m.entryFee ?? 10),
          totalPlayer: String(m.totalPlayer ?? 100),
          teamType: String(m.teamType || 'squad'),
          gameMode: String(m.gameMode || 'classic'),
          map: String(m.map || ''),
          matchSchedule: toLocalInput(String(m.matchSchedule || m.startTime || '')),
          platformFeePercent: String(m.platformFeePercent ?? 5),
          status: String(m.status || 'active'),
          matchType: String(m.matchType || ((Number(m.entryFee) || 0) <= 0 ? 'free' : 'paid')),
          perKill: String(m.perKill ?? 0),
          killRateType: String(m.killRateType || 'automatic'),
          totalKills: String(m.totalKills ?? 40),
          prizeDescription: String(m.prizeDescription || ''),
          matchSponsor: String(m.matchSponsor || ''),
          matchDescription: String(m.matchDescription || ''),
          matchPrivateDescription: String(m.matchPrivateDescription || ''),
          premiumOnly: Boolean(m.premiumOnly),
        });
      })
      .catch((err) => setError(isApiError(err) ? err.message : 'Match missing'));
  }, [id]);

  function buildBody(gameId: string, roomId: string, password: string) {
    const entryFee = form.matchType === 'free' ? 0 : Number(form.entryFee) || 0;
    let matchUrl = form.matchUrl.trim() || slugify(form.matchName);
    matchUrl = ensureHttps(matchUrl);
    return {
      gameId,
      gameMode: form.gameMode,
      roomId,
      password,
      matchName: form.matchName.trim(),
      matchUrl,
      matchSchedule: new Date(form.matchSchedule).toISOString(),
      killRateType: form.killRateType,
      entryFee,
      totalPlayer: Number(form.totalPlayer) || 100,
      teamType: form.teamType,
      perKill: Number(form.perKill) || 0,
      matchType: entryFee <= 0 ? 'free' : 'paid',
      map: form.map,
      totalKills: form.gameMode === 'tdm' ? Number(form.totalKills) || 40 : undefined,
      banner: form.map ? `/assets/images/map/${form.map}.webp` : '',
      prizeDescription: form.prizeDescription,
      matchSponsor: form.matchSponsor,
      matchDescription: form.matchDescription,
      matchPrivateDescription: form.matchPrivateDescription,
      premiumOnly: form.premiumOnly,
      platformFeePercent: Number(form.platformFeePercent) || 5,
      status: form.status,
    };
  }

  function arenaGameIds() {
    const ids: string[] = [];
    for (const seed of ARENA_GAMES) {
      const hit = games.find((g) => {
        const pkg = String(g.packageName || '').toLowerCase();
        const name = String(g.name || '').toLowerCase();
        return pkg === seed.packageName.toLowerCase() || name === seed.name.toLowerCase() || name.includes(seed.idPrefix.toLowerCase());
      });
      const gid = hit ? gameKey(hit) : '';
      if (gid) ids.push(gid);
    }
    return ids.length ? ids : games.slice(0, 5).map(gameKey).filter(Boolean);
  }

  return (
    <main className="admin-body">
      <h1>{id ? 'Edit match' : 'Create match'}</h1>
      <p className="admin-lead">
        Live create rules: auto per-kill, free/paid, room ID/pass, schedule required. Create once → add to all 5 arena
        games.
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      <form
        className="money-form match-form-grid"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.matchName.trim() || !form.password.trim() || !form.map) {
            toast('Fill required match fields');
            return;
          }
          if (!form.matchSchedule) {
            toast('Match schedule is required');
            return;
          }
          if (!createForAllFive && !form.gameId) {
            toast('Select a game');
            return;
          }
          setBusy(true);
          try {
            if (id) {
              await api(`/api/v3/games/matches/${id}`, {
                method: 'PUT',
                body: JSON.stringify(buildBody(form.gameId, form.roomId.trim() || randRoom(), form.password.trim())),
              });
              toast('Match updated');
            } else if (createForAllFive) {
              const targets = arenaGameIds();
              if (targets.length < 1) {
                toast('No arena games found — create games first');
                return;
              }
              let ok = 0;
              for (const gid of targets) {
                await api('/api/v3/games/matches', {
                  method: 'POST',
                  body: JSON.stringify(buildBody(gid, randRoom(), form.password.trim() || randPass())),
                });
                ok += 1;
              }
              toast(`Match created for ${ok} games`);
            } else {
              await api('/api/v3/games/matches', {
                method: 'POST',
                body: JSON.stringify(
                  buildBody(form.gameId, form.roomId.trim() || randRoom(), form.password.trim() || randPass()),
                ),
              });
              toast('Match created');
            }
            navigate('/games/matches');
          } catch (err) {
            toast(isApiError(err) ? err.message : 'Save failed');
          } finally {
            setBusy(false);
          }
        }}
      >
        {!id ? (
          <label className="field field-check">
            <input
              type="checkbox"
              checked={createForAllFive}
              onChange={(e) => setCreateForAllFive(e.target.checked)}
            />
            Create for all 5 arena games (PUBG, Free Fire, COD, Valorant, MLBB)
          </label>
        ) : null}

        <label className="field">
          Game *
          <select
            value={form.gameId}
            onChange={(e) => set('gameId', e.target.value)}
            required={!createForAllFive}
            disabled={createForAllFive}
          >
            <option value="">{createForAllFive ? 'All 5 arena games' : 'Select game'}</option>
            {games.map((g) => {
              const gid = gameKey(g);
              return (
                <option key={gid} value={gid}>
                  {g.name}
                </option>
              );
            })}
          </select>
        </label>

        <label className="field">
          Game mode *
          <select
            value={form.gameMode}
            onChange={(e) => {
              const mode = e.target.value;
              setForm((prev) => ({
                ...prev,
                gameMode: mode,
                map: '',
                totalPlayer: mode === 'classic' ? '100' : prev.totalPlayer,
                totalKills: '40',
              }));
            }}
          >
            <option value="classic">Classic</option>
            <option value="tdm">Team Death Match (TDM)</option>
          </select>
        </label>

        <label className="field">
          Map *
          <select value={form.map} onChange={(e) => set('map', e.target.value)} required>
            <option value="">Select map</option>
            {maps.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        {form.map ? (
          <div className="map-preview">
            <img
              src={`/assets/images/map/${form.map}.webp`}
              alt={form.map}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <strong>{form.map}</strong>
          </div>
        ) : (
          <p className="admin-lead">Select a map to preview</p>
        )}

        <label className="field">
          {form.gameMode === 'tdm' ? 'Total kills (TDM)' : 'Loser count (Classic)'}
          <input
            value={form.gameMode === 'tdm' ? form.totalKills : String(loserCount)}
            disabled
            readOnly
          />
          <small className="admin-lead">
            {form.gameMode === 'tdm'
              ? 'Fixed at 40 kills for TDM mode'
              : `Auto: loserCount = totalPlayer (${players}) − winnerTeamSize (${wSize}) = ${loserCount}`}
          </small>
        </label>

        <label className="field">
          Total player *
          <input value={form.totalPlayer} required onChange={(e) => set('totalPlayer', e.target.value)} />
        </label>

        <label className="field">
          Player mode *
          <select value={form.teamType} onChange={(e) => set('teamType', e.target.value)}>
            <option value="solo">Solo</option>
            <option value="duo">Duo</option>
            <option value="squad">Squad</option>
          </select>
        </label>

        <label className="field">
          Match / event name *
          <input
            value={form.matchName}
            required
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({
                ...prev,
                matchName: name,
                matchUrl: slugLocked ? prev.matchUrl : slugify(name),
              }));
            }}
          />
        </label>

        <label className="field">
          Match URL *
          <input
            value={form.matchUrl}
            required
            onChange={(e) => {
              setSlugLocked(true);
              set('matchUrl', e.target.value);
            }}
          />
          <small className="admin-lead">https:// will be added automatically if omitted</small>
        </label>

        {!createForAllFive ? (
          <>
            <label className="field">
              Room ID *
              <span className="table-tools">
                <input value={form.roomId} onChange={(e) => set('roomId', e.target.value)} />
                <button className="btn btn-ghost" type="button" onClick={() => set('roomId', randRoom())}>
                  Generate
                </button>
              </span>
            </label>
          </>
        ) : (
          <p className="admin-lead">Room ID auto-generates uniquely per game when creating for all 5.</p>
        )}

        <label className="field">
          Password *
          <span className="table-tools">
            <input value={form.password} required onChange={(e) => set('password', e.target.value)} />
            <button className="btn btn-ghost" type="button" onClick={() => set('password', randPass())}>
              Generate
            </button>
          </span>
        </label>

        <label className="field">
          Match schedule *
          <input
            type="datetime-local"
            value={form.matchSchedule}
            required
            onChange={(e) => set('matchSchedule', e.target.value)}
          />
        </label>

        <label className="field">
          Set kill rate *
          <select value={form.killRateType} onChange={(e) => set('killRateType', e.target.value)}>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </label>

        <label className="field">
          Match type *
          <select
            value={form.matchType}
            onChange={(e) => {
              const next = e.target.value;
              setForm((prev) => ({
                ...prev,
                matchType: next,
                entryFee: next === 'free' ? '0' : prev.entryFee === '0' ? '10' : prev.entryFee,
              }));
            }}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>

        <label className="field">
          Entry fee *
          <input
            value={form.entryFee}
            disabled={form.matchType === 'free'}
            required
            onChange={(e) => set('entryFee', e.target.value)}
          />
        </label>

        <label className="field">
          Platform fee (%)
          <input value={form.platformFeePercent} onChange={(e) => set('platformFeePercent', e.target.value)} />
          <small className="admin-lead">Percentage of total income kept by platform</small>
        </label>

        <label className="field">
          Per kill *
          <input
            value={form.perKill}
            disabled={form.killRateType === 'automatic'}
            onChange={(e) => set('perKill', e.target.value)}
          />
          <small className="admin-lead">{perKillHelper}</small>
        </label>

        <label className="field">
          Status
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">active</option>
            <option value="deactive">deactive</option>
            <option value="start">start</option>
            <option value="complete">complete</option>
            <option value="cancel">cancel</option>
          </select>
        </label>

        <label className="field field-check">
          <input type="checkbox" checked={form.premiumOnly} onChange={(e) => set('premiumOnly', e.target.checked)} />
          Premium only — only premium members can join
        </label>

        <label className="field">
          Prize description
          <textarea value={form.prizeDescription} rows={4} onChange={(e) => set('prizeDescription', e.target.value)} />
        </label>

        <label className="field">
          Match sponsor
          <textarea value={form.matchSponsor} rows={2} onChange={(e) => set('matchSponsor', e.target.value)} />
        </label>

        <label className="field">
          Match description
          <textarea value={form.matchDescription} rows={3} onChange={(e) => set('matchDescription', e.target.value)} />
        </label>

        <label className="field">
          Match private description (joined players only)
          <textarea
            value={form.matchPrivateDescription}
            rows={3}
            onChange={(e) => set('matchPrivateDescription', e.target.value)}
          />
        </label>

        <div className="prize-preview">
          <small>Prize pool preview</small>
          <p>
            Income {totalIncome.toLocaleString()} − fee {((totalIncome * feePercent) / 100).toLocaleString()} = pool{' '}
            <b>{prizePool.toLocaleString()}</b> · per kill <b>{((autoPerKill ?? Number(form.perKill)) || 0).toLocaleString()}</b>
          </p>
        </div>

        <div className="table-tools" style={{ borderRadius: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : id ? 'Save changes' : createForAllFive ? 'Create for 5 games' : 'Create match'}
          </button>
          <Link className="btn btn-ghost" to="/games/matches">
            Back
          </Link>
        </div>
      </form>
    </main>
  );
}
