import { api, unwrapData } from './api';

export type MissionRow = {
  id: string;
  status: string;
  progress: number;
  target: number;
  mission?: {
    title?: string;
    description?: string;
    reward?: { bacAmount?: number; label?: string };
  };
};

export type StreakState = {
  enabled?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  canClaim?: boolean;
  claimedToday?: boolean;
  todayReward?: number;
  calendar?: Array<{ date: string; checkedIn?: boolean; claimed?: boolean; isToday?: boolean }>;
};

export type SpinState = {
  enabled?: boolean;
  title?: string;
  description?: string;
  remaining?: number;
  dailyFreeSpins?: number;
  prizes?: Array<{ id?: string; label?: string; bacAmount?: number }>;
  recent?: Array<{ prizeLabel?: string; bacAmount?: number; spunAt?: string }>;
};

export type SquadState = {
  enabled?: boolean;
  title?: string;
  description?: string;
  winCount?: number;
  targetWins?: number;
  canClaim?: boolean;
  status?: string;
  squad?: {
    id?: string;
    name?: string;
    inviteCode?: string;
    isOwner?: boolean;
    members?: Array<{ username?: string }>;
  } | null;
};

export type SeasonState = {
  enabled?: boolean;
  title?: string;
  xp?: number;
  currentTier?: number;
  claimableCount?: number;
  active?: boolean;
  isPlus?: boolean;
  tiers?: Array<{
    level?: number;
    xpRequired?: number;
    canClaimFree?: boolean;
    canClaimPlus?: boolean;
    claimedFree?: boolean;
    claimedPlus?: boolean;
    freeReward?: { bacAmount?: number };
    plusReward?: { bacAmount?: number };
  }>;
};

export type WelcomeState = {
  enabled?: boolean;
  milestones?: Array<{
    key?: string;
    title?: string;
    canClaim?: boolean;
    claimed?: boolean;
    bacAmount?: number;
  }>;
};

export type EarnHome = {
  settings?: { enabled?: boolean; streakEnabled?: boolean };
  missions?: MissionRow[];
  streak?: StreakState;
  luckySpin?: SpinState;
  squadChallenge?: SquadState;
  seasonPass?: SeasonState;
  welcome?: WelcomeState;
  weeklyArena?: { enabled?: boolean; title?: string; viewerRank?: number | null };
  level?: { level?: number; xp?: number; progressPct?: number; title?: { title?: string } };
  depositBonusDays?: { enabled?: boolean; active?: boolean; percent?: number; title?: string };
};

export type BadgeRow = {
  id?: string;
  title?: string;
  description?: string;
  unlocked?: boolean;
  threshold?: number;
  current?: number;
};

export async function fetchEarnHome() {
  const payload = await api('/api/v2/engagement/home');
  return unwrapData<EarnHome>(payload);
}

export async function fetchBadges() {
  const payload = await api('/api/v2/engagement/badges');
  return unwrapData<{ enabled?: boolean; badges?: BadgeRow[] }>(payload);
}

export async function claimMission(progressId: string) {
  const payload = await api(`/api/v2/engagement/claim/${progressId}`, { method: 'POST' });
  return unwrapData<{ balanceAfter?: number }>(payload);
}

export async function claimStreak() {
  const payload = await api('/api/v2/engagement/streak/claim', { method: 'POST' });
  return unwrapData<{ balanceAfter?: number }>(payload);
}

export async function claimWelcome(key: string) {
  const payload = await api(`/api/v2/engagement/welcome/claim/${encodeURIComponent(key)}`, { method: 'POST' });
  return unwrapData<{ balanceAfter?: number }>(payload);
}

export async function claimWeekly() {
  const payload = await api('/api/v2/engagement/weekly/claim', { method: 'POST' });
  return unwrapData<{ balanceAfter?: number }>(payload);
}

export async function doSpin() {
  const payload = await api('/api/v2/engagement/spin', { method: 'POST' });
  return unwrapData<{ prizeLabel?: string; bacAmount?: number; balanceAfter?: number; luckySpin?: SpinState }>(payload);
}

export async function createSquad(name: string) {
  const payload = await api('/api/v2/engagement/squad/create', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return unwrapData(payload);
}

export async function joinSquad(inviteCode: string) {
  const payload = await api('/api/v2/engagement/squad/join', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  });
  return unwrapData(payload);
}

export async function leaveSquad() {
  return api('/api/v2/engagement/squad/leave', { method: 'POST' });
}

export async function fetchSquadChat() {
  const payload = await api('/api/v2/engagement/squad/chat');
  return unwrapData<Array<{ id: string; username: string; body: string; isMine?: boolean }>>(payload) || [];
}

export async function sendSquadChat(body: string) {
  return api('/api/v2/engagement/squad/chat', { method: 'POST', body: JSON.stringify({ body }) });
}

export async function claimSquad() {
  const payload = await api('/api/v2/engagement/squad/claim', { method: 'POST' });
  return unwrapData<{ balanceAfter?: number }>(payload);
}

export async function claimSeason(level: number, track: 'free' | 'plus') {
  const payload = await api('/api/v2/engagement/season/claim', {
    method: 'POST',
    body: JSON.stringify({ level, track }),
  });
  return unwrapData<{ balanceAfter?: number }>(payload);
}
