import type { DashboardTopPlayer, PublicDashboardStats } from 'src/types';

const DEMO_USERNAME_BLOCKLIST = new Set(['testplayer', 'demouser', 'demo']);

/** Hide obvious seed/test accounts from public Pulse leaderboards */
export function isDemoPulsePlayer(player: DashboardTopPlayer): boolean {
  const name = (player.username || '').trim().toLowerCase();
  if (!name) return true;
  if (DEMO_USERNAME_BLOCKLIST.has(name)) return true;
  if (/^testplayer\d*$/.test(name)) return true;
  return false;
}

export function filterDemoPulsePlayers(players: DashboardTopPlayer[] | undefined): DashboardTopPlayer[] {
  return (players || []).filter((player) => !isDemoPulsePlayer(player));
}

export function sanitizePublicDashboardData(data: PublicDashboardStats): PublicDashboardStats {
  return {
    ...data,
    topProfitPlayers: filterDemoPulsePlayers(data.topProfitPlayers),
    topPlayers: filterDemoPulsePlayers(data.topPlayers),
  };
}

export function formatPulseLastUpdated(seconds: number): string {
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ago`;
}
