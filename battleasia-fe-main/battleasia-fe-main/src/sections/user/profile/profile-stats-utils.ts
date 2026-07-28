import type { IMatchHistory } from 'src/types';

// ----------------------------------------------------------------------

export type ProfileGamingStats = {
  gamesPlayed: number;
  totalKills: number;
  wins: number;
  winRate: number;
};

const getPrizeWon = (record: IMatchHistory) =>
  Number(record?.winnings ?? 0) ||
  Number(record?.amountWon ?? 0) ||
  Number(record?.reward ?? 0) ||
  0;

export const getMatchWinStatus = (record: IMatchHistory): 'win' | 'loss' | 'pending' => {
  const prizeWon = getPrizeWon(record);
  const matchStatus = record?.status;

  if (matchStatus === 'complete' || matchStatus === 'finished') {
    return prizeWon > 0 ? 'win' : 'loss';
  }
  if (matchStatus === 'cancel') {
    return 'loss';
  }
  if (matchStatus === 'active' || matchStatus === 'start' || matchStatus === 'ongoing') {
    return 'pending';
  }
  if (matchStatus === 'deactive' || matchStatus === 'upcoming') {
    return 'pending';
  }
  if (prizeWon > 0) {
    return 'win';
  }

  const schedule = record?.matchSchedule || record?.joinedAt;
  if (schedule) {
    const scheduleTime = new Date(schedule).getTime();
    if (!Number.isNaN(scheduleTime) && scheduleTime < Date.now()) {
      return prizeWon > 0 ? 'win' : 'loss';
    }
  }

  return 'pending';
};

export const computeProfileGamingStats = (history: IMatchHistory[]): ProfileGamingStats => {
  const gamesPlayed = history.length;
  const totalKills = history.reduce(
    (sum, record) => sum + (Number(record?.kills ?? 0) || 0),
    0
  );

  const resolved = history.filter((record) => getMatchWinStatus(record) !== 'pending');
  const wins = resolved.filter((record) => getMatchWinStatus(record) === 'win').length;
  const winRate = resolved.length > 0 ? Math.round((wins / resolved.length) * 100) : 0;

  return { gamesPlayed, totalKills, wins, winRate };
};

export const mapApiFeedToItem = (feed: any) => ({
  id: feed.id || feed._id,
  title: feed.title || '',
  description: feed.description || '',
  coverUrl: feed.coverUrl || '',
  status: feed.status || 'published',
  totalViews: feed.totalViews || 0,
  totalLikes: feed.totalLikes || 0,
  totalComments: feed.totalComments || 0,
  totalShares: feed.totalShares || 0,
  createdAt: feed.createdAt ? new Date(feed.createdAt) : new Date(),
  author: feed.author
    ? {
        id: feed.author.id,
        name: feed.author.name,
        avatarUrl: feed.author.avatarUrl || '',
      }
    : null,
});
