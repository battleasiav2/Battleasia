import { api, unwrapData } from './api';
import { isDemoMatchId } from './demoMatches';

export type GameItem = {
  id: string;
  _id?: string;
  name: string;
  packageName?: string;
  image?: string;
  logo?: string;
  comingSoon?: boolean;
  canCreateChallenge?: boolean;
  rules?: string;
};

export type MatchItem = {
  id: string;
  _id?: string;
  gameId: string;
  gameName?: string;
  matchName: string;
  matchType?: string;
  teamType?: string;
  map?: string;
  matchSchedule?: string;
  entryFee?: number;
  perKill?: number;
  banner?: string;
  prizeDescription?: string;
  matchDescription?: string;
  matchPrivateDescription?: string;
  totalPlayer?: number;
  participantsCount?: number;
  premiumOnly?: boolean;
  status?: string;
  isJoined?: boolean;
  gameMode?: string;
};

export type MatchDetail = MatchItem & {
  roomId?: string;
  password?: string;
  matchUrl?: string;
  matchSponsor?: string;
  participants?: Array<{
    id: string;
    userId?: string;
    username: string;
    pubgId?: string;
    avatar?: string;
    joinedAt?: string;
    ready?: boolean;
  }>;
};

export type MatchResult = MatchDetail & {
  participants: Array<{
    id: string;
    username: string;
    avatar?: string;
    pubgId?: string;
    status?: string;
    placement?: number | null;
    kills?: number;
    points?: number;
    placePoint?: number;
    winPrize?: number;
    bonus?: number;
    refund?: number;
    entryFee?: number;
  }>;
};

export type RoomCreds = {
  matchName?: string;
  map?: string;
  matchSchedule?: string;
  roomId?: string;
  password?: string;
};

export type ChatMessage = {
  id?: string;
  _id?: string;
  username?: string;
  message?: string;
  text?: string;
  createdAt?: string;
};

function idOf(item: { id?: string; _id?: string }) {
  return item.id || item._id || '';
}

export function gameKey(game: { name?: string; packageName?: string; banner?: string }) {
  const blob = `${game.packageName || ''} ${game.name || ''} ${game.banner || ''}`.toLowerCase();
  if (blob.includes('pubg') || blob.includes('tencent.ig')) return 'pubg';
  if (blob.includes('free fire') || blob.includes('freefire')) return 'freefire';
  if (blob.includes('call of duty') || blob.includes('activision') || /\bcod\b/.test(blob)) return 'cod';
  if (blob.includes('valorant')) return 'valorant';
  if (blob.includes('legend') || blob.includes('mobilelegends')) return 'mlbb';
  return 'arena';
}

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

/** Map landing slugs (pubg, freefire, …) to live API game ids. */
export async function resolveGameId(param: string) {
  const raw = param.trim();
  if (!raw) return '';
  if (isObjectId(raw)) return raw;
  try {
    const games = await fetchGames();
    const hit = games.find(
      (g) =>
        g.id === raw ||
        gameKey(g) === raw ||
        g.name.toLowerCase().replace(/\s+/g, '') === raw.toLowerCase(),
    );
    return hit?.id || raw;
  } catch {
    return raw;
  }
}

function isMissingArt(src: string) {
  return /\/assets\/(images\/games\/art|games)\//.test(src);
}

export function coverForGame(game: {
  name?: string;
  packageName?: string;
  image?: string;
  logo?: string;
  banner?: string;
}) {
  const remote = game.banner || game.image || game.logo || '';
  if (remote && !isMissingArt(remote) && !remote.startsWith('/covers/')) return remote;
  const key = gameKey(game);
  if (key !== 'arena') return `/covers/${key}.webp`;
  return '/covers/arena.svg';
}

export function webpSrcSet(src: string, smW: number, fullW: number) {
  if (!src.endsWith('.webp')) return undefined;
  return `${src.replace(/\.webp$/, '-sm.webp')} ${smW}w, ${src} ${fullW}w`;
}

export async function fetchGames() {
  try {
    const payload = await api('/api/v2/games');
    const list = unwrapData<GameItem[]>(payload) || [];
    return list.map((g) => ({ ...g, id: idOf(g) })).filter((g) => g.id);
  } catch {
    return [];
  }
}

export async function fetchMatches(gameId: string) {
  const resolved = await resolveGameId(gameId);
  try {
    const payload = await api(`/api/v2/games/matches?gameId=${encodeURIComponent(resolved)}`);
    const list = unwrapData<MatchItem[]>(payload) || [];
    return list.map((m) => ({ ...m, id: idOf(m) })).filter((m) => m.id);
  } catch {
    return [];
  }
}

export async function fetchMatch(id: string) {
  if (isDemoMatchId(id)) {
    throw Object.assign(new Error('Demo rooms are disabled'), {
      status: 404,
      message: 'Demo rooms are disabled',
    });
  }
  const payload = await api(`/api/v2/games/matches/${id}`);
  const m = unwrapData<MatchDetail>(payload);
  return { ...m, id: idOf(m) };
}

export async function fetchMatchResult(id: string) {
  if (isDemoMatchId(id)) {
    throw Object.assign(new Error('Demo rooms are disabled'), {
      status: 404,
      message: 'Demo rooms are disabled',
    });
  }
  const payload = await api(`/api/v2/games/matches/${id}/result`);
  const m = unwrapData<MatchResult>(payload);
  return { ...m, id: idOf(m) };
}

export async function fetchRoom(id: string) {
  const payload = await api(`/api/v2/games/matches/${id}/room`);
  return unwrapData<RoomCreds>(payload);
}

export async function checkJoin(id: string) {
  return api(`/api/v2/games/matches/${id}/check-join`, { method: 'POST' });
}

export async function joinMatch(id: string) {
  const payload = await api(`/api/v2/games/matches/${id}/join`, { method: 'POST' });
  return unwrapData<{ balance?: number; isJoined?: boolean }>(payload);
}

export async function reportMatch(id: string, targetUserId: string, reason = 'collusion') {
  return api(`/api/v2/games/matches/${id}/report`, {
    method: 'POST',
    body: JSON.stringify({ targetUserId, reason }),
  });
}

export async function leaveMatch(id: string) {
  return api(`/api/v2/games/matches/${id}/leave`, { method: 'POST' });
}

export async function setReady(id: string, ready: boolean) {
  return api(`/api/v2/games/matches/${id}/ready`, {
    method: 'POST',
    body: JSON.stringify({ ready }),
  });
}

export async function fetchChat(id: string) {
  const payload = await api(`/api/v2/games/matches/${id}/chat`);
  const list = unwrapData<ChatMessage[]>(payload);
  return Array.isArray(list) ? list : [];
}

export async function sendChat(id: string, message: string) {
  return api(`/api/v2/games/matches/${id}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export function spotsLeft(match: MatchItem) {
  const total = Number(match.totalPlayer) || 0;
  const taken = Number(match.participantsCount) || 0;
  return Math.max(0, total - taken);
}

/** Estimate prize pool for display (entry × slots, or first number in description). */
export function estimateMatchWinningPool(
  match: Pick<MatchItem, 'entryFee' | 'totalPlayer' | 'prizeDescription'>,
) {
  const fee = Number(match.entryFee) || 0;
  const slots = Number(match.totalPlayer) || 0;
  if (fee > 0 && slots > 0) return Math.round(fee * slots);
  const raw = match.prizeDescription || '';
  const hit = raw.match(/(\d[\d,]*)/);
  if (hit) return Number(hit[1].replace(/,/g, '')) || 0;
  return 0;
}

export function isJoinable(match: MatchItem) {
  const status = (match.status || '').toLowerCase();
  return (status === 'active' || status === 'start') && spotsLeft(match) > 0 && !match.isJoined;
}

export function formatWhen(value?: string) {
  if (!value) return 'TBD';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
