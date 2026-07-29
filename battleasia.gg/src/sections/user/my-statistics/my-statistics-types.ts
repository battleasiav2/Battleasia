import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type StatisticsItem = {
  id: string;
  matchName: string;
  date: string;
  paid: number;
  won: number;
};

export type ApiMatchHistoryItem = {
  _id?: string;
  id?: string;
  matchId?: string;
  match?: {
    id?: string;
    matchName?: string;
    matchType?: string;
    teamType?: string;
    map?: string;
    matchSchedule?: string;
    entryFee?: number;
    banner?: string;
    gameName?: string;
    status?: string;
  };
  matchName?: string;
  matchType?: string;
  teamType?: string;
  map?: string;
  matchSchedule?: string;
  entryFee?: number;
  banner?: string;
  gameName?: string;
  status?: string;
  kills?: number;
  stats?: {
    kills?: number;
    rank?: number;
  };
  rank?: number;
  amountWon?: number;
  winnings?: number;
  points?: number;
  prize?: number;
  reward?: number;
  createdAt?: string;
  joinedAt?: string;
};

export const mapApiMatchToStatistics = (item: ApiMatchHistoryItem): StatisticsItem => {
  const match = item.match || item;
  const matchId = match.id || item.matchId || item._id || item.id || '';
  const matchName = match.matchName || item.matchName || 'Unknown Match';
  const matchSchedule = match.matchSchedule || item.matchSchedule || item.createdAt || item.joinedAt || '';
  const entryFee = match.entryFee || item.entryFee || 0;
  const prizeWon = item.amountWon ?? item.winnings ?? item.points ?? item.prize ?? item.reward ?? 0;

  return {
    id: matchId,
    matchName,
    date: matchSchedule ? fDateTime(matchSchedule, 'YYYY-MM-DD HH:mm:ss') : '',
    paid: entryFee,
    won: prizeWon,
  };
};

export const sortStatisticsByDate = (items: StatisticsItem[]) =>
  [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
