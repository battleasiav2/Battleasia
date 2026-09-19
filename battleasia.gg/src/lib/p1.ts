import { api, unwrapData } from './api';

export type P1Flags = {
  igVictoryAutoPost: boolean;
  igHighlights: boolean;
  igGameFeed: boolean;
  igMessageRequests: boolean;
  igPinnedPosts: boolean;
  squadChat: boolean;
  kycBeforeWithdraw: boolean;
  cashbackDays: boolean;
  playerTip: boolean;
};

export const P1_OFF: P1Flags = {
  igVictoryAutoPost: false,
  igHighlights: false,
  igGameFeed: false,
  igMessageRequests: false,
  igPinnedPosts: false,
  squadChat: false,
  kycBeforeWithdraw: false,
  cashbackDays: false,
  playerTip: false,
};

export async function fetchP1Flags(): Promise<P1Flags> {
  try {
    const payload = await api('/api/v2/app-settings/p1');
    return { ...P1_OFF, ...unwrapData<Partial<P1Flags>>(payload) };
  } catch {
    return P1_OFF;
  }
}

export async function submitKyc(dateOfBirth: string) {
  return api('/api/v2/users/me/kyc', { method: 'POST', body: JSON.stringify({ dateOfBirth }) });
}
