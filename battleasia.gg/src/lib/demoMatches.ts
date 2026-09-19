import type { GameItem, MatchItem } from './games';

export const DEMO_GAME_DEFS = [
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    maps: ['Erangel', 'Miramar', 'Sanhok', 'Livik'],
    teams: ['Solo', 'Duo', 'Squad'],
    fees: [0, 10, 20, 50, 100],
    caps: [28, 48, 64, 100],
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    maps: ['Bermuda', 'Purgatory', 'Alpine', 'Nextterra'],
    teams: ['Solo', 'Duo', 'Squad'],
    fees: [0, 10, 25, 50, 80],
    caps: [24, 48, 50],
  },
  {
    id: 'cod',
    name: 'Call of Duty Mobile',
    maps: ['Shipment', 'Nuke Town', 'Crash', 'Raid'],
    teams: ['1v1', '2v2', '4v4', '5v5'],
    fees: [0, 15, 30, 60],
    caps: [8, 10, 16, 20],
  },
  {
    id: 'mlbb',
    name: 'Mobile Legends',
    maps: ['Classic', 'Ranked Draft', 'Custom 5v5'],
    teams: ['1v1', '3v3', '5v5'],
    fees: [0, 10, 20, 40, 75],
    caps: [2, 6, 10],
  },
  {
    id: 'valorant',
    name: 'Valorant Mobile',
    maps: ['Bind', 'Haven', 'Ascent', 'Split'],
    teams: ['1v1', '2v2', '5v5'],
    fees: [0, 20, 40, 80],
    caps: [2, 4, 10],
  },
] as const;

export type DemoGameId = (typeof DEMO_GAME_DEFS)[number]['id'];

export function isDemoMatchId(id: string) {
  return id.startsWith('demo-');
}

export function resolveDemoGameId(gameId: string): DemoGameId | null {
  const raw = (gameId || '').toLowerCase().trim();
  const hit = DEMO_GAME_DEFS.find((g) => g.id === raw || g.name.toLowerCase() === raw);
  if (hit) return hit.id;
  if (raw.includes('pubg')) return 'pubg';
  if (raw.includes('free') || raw.includes('freefire')) return 'freefire';
  if (raw.includes('duty') || raw === 'cod') return 'cod';
  if (raw.includes('valorant')) return 'valorant';
  if (raw.includes('legend') || raw.includes('mlbb') || raw.includes('mobile legend')) return 'mlbb';
  return null;
}

export function demoGames(): GameItem[] {
  return DEMO_GAME_DEFS.map((g) => ({
    id: g.id,
    name: g.name,
    image: `/covers/${g.id}.webp`,
    comingSoon: false,
  }));
}

export function demoOpenByGame(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of DEMO_GAME_DEFS) out[g.name] = 10;
  return out;
}

function pick<T>(list: readonly T[], i: number) {
  return list[i % list.length];
}

/** 10 open-room style matches for a game (slug or name). */
export function buildDemoMatches(gameId: string): MatchItem[] {
  const key = resolveDemoGameId(gameId) || 'pubg';
  const def = DEMO_GAME_DEFS.find((g) => g.id === key) || DEMO_GAME_DEFS[0];
  const now = Date.now();
  return Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const fee = pick(def.fees, i);
    const cap = pick(def.caps, i);
    const filled = Math.min(cap - 1, Math.floor(cap * (0.2 + (i % 5) * 0.12)));
    const status = i === 8 ? 'start' : i === 9 ? 'active' : 'active';
    const when = new Date(now + (n * 35 + 15) * 60_000).toISOString();
    return {
      id: `demo-${def.id}-${String(n).padStart(2, '0')}`,
      gameId: def.id,
      gameName: def.name,
      matchName: `${def.name.split(' ')[0]} Room ${n}`,
      matchType: fee === 0 ? 'free' : 'paid',
      teamType: pick(def.teams, i),
      map: pick(def.maps, i),
      matchSchedule: when,
      entryFee: fee,
      perKill: fee > 0 ? Math.max(2, Math.round(fee / 5)) : 0,
      banner: `/covers/${def.id}.webp`,
      prizeDescription: fee === 0 ? 'Practice room · no entry' : `Winner pool ~${fee * Math.max(4, filled)} BAC`,
      totalPlayer: cap,
      participantsCount: filled,
      status,
      isJoined: false,
      gameMode: pick(def.teams, i),
    };
  });
}
