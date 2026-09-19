export type PulseMatch = {
  id: string;
  matchName: string;
  gameName: string;
  prizeEstimate: number;
  participantsCount: number;
  totalPlayer: number;
  entryFee: number;
  status: string;
};

export type PulsePlayer = {
  userId: string;
  username: string;
  avatar: string | null;
  totalWinnings: number;
  totalKills: number;
  winRate: number | null;
};

export type PulseGameLive = { name: string; live: number };

const ARENA_GAMES: { name: string; match: RegExp }[] = [
  { name: 'PUBG Mobile', match: /pubg/i },
  { name: 'Free Fire', match: /free\s*fire|freefire/i },
  { name: 'Call of Duty', match: /call of duty|\bcod\b/i },
  { name: 'MLBB', match: /mlbb|mobile legends/i },
  { name: 'Valorant', match: /valorant/i },
];

export function fillByGame(rows: PulseGameLive[]): PulseGameLive[] {
  return ARENA_GAMES.map((g) => {
    const hit = rows.find((r) => g.match.test(r.name));
    return { name: g.name, live: hit?.live ?? 0 };
  });
}

export type PulseStats = {
  todayJoins: number;
  matches: number;
  ongoing: number;
  winnings: number;
  playersOnline: number;
  matchesToday: number;
  stadiumLive: number;
  inSeats: number;
  byGame: PulseGameLive[];
  /** Live + upcoming open matches keyed by API game name */
  openByGame: Record<string, number>;
  topProfit: PulsePlayer[];
  topKillers: PulsePlayer[];
  ongoingMatches: PulseMatch[];
  highPrizeMatches: PulseMatch[];
};

export const EMPTY_PULSE: PulseStats = {
  todayJoins: 0,
  matches: 0,
  ongoing: 0,
  winnings: 0,
  playersOnline: 0,
  matchesToday: 0,
  stadiumLive: 0,
  inSeats: 0,
  byGame: fillByGame([]),
  openByGame: {},
  topProfit: [],
  topKillers: [],
  ongoingMatches: [],
  highPrizeMatches: [],
};

function asRecord(v: unknown) {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

function asList(v: unknown) {
  return Array.isArray(v) ? v : [];
}

function mapMatch(row: unknown): PulseMatch {
  const m = asRecord(row);
  return {
    id: String(m.id || m._id || ''),
    matchName: String(m.matchName || 'Match'),
    gameName: String(m.gameName || ''),
    prizeEstimate: Number(m.prizeEstimate) || 0,
    participantsCount: Number(m.participantsCount) || 0,
    totalPlayer: Number(m.totalPlayer) || 0,
    entryFee: Number(m.entryFee) || 0,
    status: String(m.status || ''),
  };
}

function mapPlayer(row: unknown): PulsePlayer {
  const p = asRecord(row);
  const winRateRaw = p.winRate;
  return {
    userId: String(p.userId || p.id || ''),
    username: String(p.username || 'Player'),
    avatar: typeof p.avatar === 'string' ? p.avatar : null,
    totalWinnings: Number(p.totalWinnings) || 0,
    totalKills: Number(p.totalKills) || 0,
    winRate: winRateRaw == null || winRateRaw === '' ? null : Number(winRateRaw),
  };
}

function mergeGameCounts(...maps: Record<string, unknown>[]) {
  const out: Record<string, number> = {};
  for (const map of maps) {
    for (const [name, value] of Object.entries(map)) {
      out[name] = (out[name] || 0) + (Number(value) || 0);
    }
  }
  return out;
}

/** Resolve open-match count for a catalog game name / slug. */
export function openMatchesForGame(gameName: string, openByGame: Record<string, number>) {
  if (!gameName) return 0;
  if (openByGame[gameName] != null) return openByGame[gameName];
  const needle = gameName.toLowerCase().replace(/\s+/g, ' ').trim();
  const aliases =
    /pubg/.test(needle)
      ? ['pubg']
      : /free\s*fire|freefire/.test(needle)
        ? ['free fire', 'freefire']
        : /call of duty|\bcod\b/.test(needle)
          ? ['call of duty', 'cod']
          : /mlbb|mobile legends/.test(needle)
            ? ['mobile legends', 'mlbb']
            : /valorant/.test(needle)
              ? ['valorant']
              : [needle];
  const hit = Object.entries(openByGame).find(([key]) => {
    const k = key.toLowerCase();
    return aliases.some((a) => k === a || k.includes(a) || a.includes(k));
  });
  return hit ? hit[1] : 0;
}

/** Fake live-rail cards when API has no status=start matches yet. */
export function fakeLiveBattles(limit = 5): PulseMatch[] {
  const rows: Array<Omit<PulseMatch, 'status'>> = [
    {
      id: 'live-fake-pubg',
      matchName: 'PUBG Night Scrims Live',
      gameName: 'PUBG Mobile',
      entryFee: 40,
      totalPlayer: 100,
      participantsCount: 67,
      prizeEstimate: 4000,
    },
    {
      id: 'live-fake-cod',
      matchName: 'COD Domination Live',
      gameName: 'Call of Duty Mobile',
      entryFee: 30,
      totalPlayer: 40,
      participantsCount: 28,
      prizeEstimate: 1200,
    },
    {
      id: 'live-fake-ff',
      matchName: 'Free Fire Clash Live',
      gameName: 'Free Fire',
      entryFee: 20,
      totalPlayer: 48,
      participantsCount: 36,
      prizeEstimate: 960,
    },
    {
      id: 'live-fake-valo',
      matchName: 'Valorant Spike Rush Live',
      gameName: 'Valorant Mobile',
      entryFee: 25,
      totalPlayer: 10,
      participantsCount: 8,
      prizeEstimate: 250,
    },
    {
      id: 'live-fake-mlbb',
      matchName: 'MLBB Ranked Live',
      gameName: 'Mobile Legends',
      entryFee: 15,
      totalPlayer: 10,
      participantsCount: 9,
      prizeEstimate: 150,
    },
  ];
  return rows.slice(0, limit).map((m) => ({ ...m, status: 'start' }));
}

function fillLiveBattles(real: PulseMatch[], limit = 5) {
  if (real.length >= limit) return real.slice(0, limit);
  const usedGames = new Set(real.map((m) => m.gameName.toLowerCase()));
  const fakes = fakeLiveBattles(limit).filter((m) => !usedGames.has(m.gameName.toLowerCase()));
  return [...real, ...fakes].slice(0, limit);
}

export function mapPulse(raw: unknown): PulseStats {
  const root = asRecord(raw);
  const data = asRecord(root.data ?? root);
  const platform = asRecord(data.platform ?? data);
  const todayJoins = Number(platform.todayJoinedUsers ?? 0) || 0;
  const matches = Number(platform.processedMatches ?? platform.totalMatches ?? 0) || 0;
  const ongoing = Number(platform.ongoingMatches ?? 0) || 0;
  const winnings = Number(platform.totalWinnings ?? 0) || 0;
  const liveMap = asRecord(data.liveCountByGame);
  const upcomingMap = asRecord(data.upcomingCountByGame);
  const openByGame = mergeGameCounts(liveMap, upcomingMap);
  const byGame = fillByGame(
    Object.entries(liveMap).map(([name, live]) => ({
      name,
      live: Number(live) || 0,
    })),
  );
  const stadiumLive = byGame.reduce((n, g) => n + g.live, 0) || Number(platform.liveCount ?? 0) || 0;
  const seatMap = asRecord(data.participantsByGame);
  const inSeats = Object.values(seatMap).reduce((n: number, v) => n + (Number(v) || 0), 0);
  const ongoingReal = asList(data.ongoingMatches).map(mapMatch);
  return {
    todayJoins,
    matches,
    ongoing,
    winnings,
    playersOnline: Number(platform.onlineUsers ?? todayJoins) || 0,
    matchesToday: Number(platform.matchesToday ?? ongoing) || 0,
    stadiumLive,
    inSeats: Number(inSeats) || 0,
    byGame,
    openByGame,
    topProfit: asList(data.topProfitPlayers).map(mapPlayer),
    topKillers: asList(data.topPlayers).map(mapPlayer),
    ongoingMatches: fillLiveBattles(ongoingReal, 5),
    highPrizeMatches: asList(data.highPrizeMatches).map(mapMatch),
  };
}

export async function fetchPublicDashboard(): Promise<PulseStats> {
  try {
    const res = await fetch('/api/v3/public/dashboard', {
      credentials: 'include',
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) {
      return { ...EMPTY_PULSE, ongoingMatches: fakeLiveBattles(5), ongoing: 5 };
    }
    return mapPulse(await res.json());
  } catch {
    return { ...EMPTY_PULSE, ongoingMatches: fakeLiveBattles(5), ongoing: 5 };
  }
}
