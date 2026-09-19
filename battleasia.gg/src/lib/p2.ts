import { api, unwrapData } from './api';

export type P2Flags = {
  igForYou: boolean;
  voiceNotes: boolean;
  watchParty: boolean;
  liveGifting: boolean;
  clans: boolean;
  fantasy: boolean;
  oneVone: boolean;
  customizationStore: boolean;
  ocrResults: boolean;
  creatorLeaderboard: boolean;
};

export const P2_OFF: P2Flags = {
  igForYou: false,
  voiceNotes: false,
  watchParty: false,
  liveGifting: false,
  clans: false,
  fantasy: false,
  oneVone: false,
  customizationStore: false,
  ocrResults: false,
  creatorLeaderboard: false,
};

export async function fetchP2Flags(): Promise<P2Flags> {
  try {
    const payload = await api('/api/v2/app-settings/p2');
    return { ...P2_OFF, ...unwrapData<Partial<P2Flags>>(payload) };
  } catch {
    return P2_OFF;
  }
}

export type LabRow = {
  id: string;
  kind: string;
  title: string;
  tag?: string;
  hostName?: string;
  hostId?: string;
  memberIds?: string[];
  members?: number;
  hearts?: number;
  status?: string;
  matchId?: string;
  imageUrl?: string;
  picks?: string[];
  stake?: number;
  priceBac?: number;
  giftBac?: number;
  joined?: boolean;
  messages?: Array<{ username: string; body: string; createdAt?: string }>;
};

export async function fetchLab(kind: string) {
  const payload = await api(`/api/v2/labs/${kind}`);
  const data = unwrapData<{ results?: LabRow[]; cosmeticId?: string }>(payload);
  return { rows: data.results || [], cosmeticId: data.cosmeticId || '' };
}

export async function createLab(kind: string, body: Record<string, unknown>) {
  const payload = await api(`/api/v2/labs/${kind}`, { method: 'POST', body: JSON.stringify(body) });
  return unwrapData<LabRow>(payload);
}

export async function joinLab(kind: string, id: string) {
  const payload = await api(`/api/v2/labs/${kind}/${id}/join`, { method: 'POST' });
  return unwrapData<LabRow>(payload);
}

export async function heartLab(kind: string, id: string) {
  const payload = await api(`/api/v2/labs/${kind}/${id}/heart`, { method: 'POST' });
  return unwrapData<{ hearts: number }>(payload);
}

export async function messageLab(kind: string, id: string, body: string) {
  const payload = await api(`/api/v2/labs/${kind}/${id}/message`, { method: 'POST', body: JSON.stringify({ body }) });
  return unwrapData<LabRow>(payload);
}

export async function giftLab(kind: string, id: string, amount: number) {
  const payload = await api(`/api/v2/labs/${kind}/${id}/gift`, { method: 'POST', body: JSON.stringify({ amount }) });
  return unwrapData<LabRow>(payload);
}

export async function watchEarnLab(kind: string, id: string) {
  const payload = await api(`/api/v2/labs/${kind}/${id}/watch-earn`, { method: 'POST' });
  return unwrapData<{ balance: number; credited: number }>(payload);
}

export async function resolveDuel(id: string, winnerId: string) {
  const payload = await api(`/api/v2/labs/duel/${id}/resolve`, { method: 'POST', body: JSON.stringify({ winnerId }) });
  return unwrapData<LabRow>(payload);
}

export async function warClan(id: string, opponentId: string) {
  const payload = await api(`/api/v2/labs/clan/${id}/war`, { method: 'POST', body: JSON.stringify({ opponentId }) });
  return unwrapData<LabRow>(payload);
}

export async function scoreFantasy(id: string) {
  const payload = await api(`/api/v2/labs/fantasy/${id}/score`, { method: 'POST' });
  return unwrapData<LabRow>(payload);
}

export async function fetchCreators() {
  const payload = await api('/api/v2/labs/creators');
  const data = unwrapData<{ results?: Array<{ id: string; rank: number; username: string; posts?: number; likes?: number }> }>(payload);
  return data.results || [];
}

export const P2_LABS: Array<{ id: keyof P2Flags; path: string; title: string; body: string }> = [
  {
    id: 'liveGifting',
    path: 'live',
    title: 'Live + gifting',
    body: 'Go-live rooms, hearts, and BAC gifts attach when streaming infra is connected. This flag only reveals the lobby.',
  },
  {
    id: 'watchParty',
    path: 'watch',
    title: 'Watch party',
    body: 'Spectate a match with lobby chat. Join the match lobby or wait for a live room.',
  },
  {
    id: 'clans',
    path: 'clans',
    title: 'Clans / wars',
    body: 'Clan roster, wars, and clan chat need the clan service. Flag reveals the clubhouse.',
  },
  {
    id: 'fantasy',
    path: 'fantasy',
    title: 'Fantasy lineups',
    body: 'Pick squads against a match slate. Scoring hooks to published results.',
  },
  {
    id: 'oneVone',
    path: 'duel',
    title: '1v1 duels',
    body: 'Challenge another player to a private room. Wager uses the existing BAC ledger.',
  },
  {
    id: 'customizationStore',
    path: 'cosmetics',
    title: 'Customization store',
    body: 'Profile frames and HUD skins. Inventory is empty until catalog items are seeded.',
  },
  {
    id: 'ocrResults',
    path: 'ocr',
    title: 'OCR results',
    body: 'Screenshot ingest for placements. Admin still posts official results.',
  },
  {
    id: 'creatorLeaderboard',
    path: 'creators',
    title: 'Creator board',
    body: 'Ranks feed authors by likes this season. Uses the existing engagement leaderboard.',
  },
];
