import { fDateTime } from 'src/utils/format-time';

import { getImageUrl } from 'src/utils/get-image-url';

import { PLAY_IMAGE_PATHS } from '../play/play-constants';

// ----------------------------------------------------------------------

export type MyMatchStatus = 'win' | 'loss' | 'pending';

export type MyMatchCardData = {
  id: string;
  gameName: string;
  matchName: string;
  matchType: string;
  map: string;
  date: string;
  entryFee: string;
  prizeWon: string;
  status: MyMatchStatus;
  heroImage: string;
  kills?: number;
  rank?: number;
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

export type MyMatchTab = 'all' | 'win' | 'loss' | 'pending';

// ----------------------------------------------------------------------

export const getMyMatchBannerUrl = (path?: string) => {
  const resolved = getImageUrl(path);
  return resolved || PLAY_IMAGE_PATHS.game;
};

export const mapApiMatchToCard = (item: ApiMatchHistoryItem): MyMatchCardData => {
  const match = item.match || item;
  const matchId = match.id || item.matchId || item._id || item.id || '';
  const matchName = match.matchName || item.matchName || 'Unknown Match';
  const matchType = match.matchType || item.matchType || match.teamType || item.teamType || 'N/A';
  const map = match.map || item.map || 'N/A';
  const matchSchedule = match.matchSchedule || item.matchSchedule || item.createdAt || item.joinedAt || '';
  const entryFee = match.entryFee || item.entryFee || 0;
  const banner = match.banner || item.banner;
  const gameName = match.gameName || item.gameName || 'PUBG MOBILE';

  const kills = item.kills ?? item.stats?.kills ?? 0;
  const rank = item.rank ?? item.stats?.rank;

  const prizeWon = item.amountWon ?? item.winnings ?? item.points ?? item.prize ?? item.reward ?? 0;

  let status: MyMatchStatus = 'pending';
  const matchStatus = match.status || item.status;

  if (matchStatus === 'complete' || matchStatus === 'finished') {
    status = prizeWon > 0 ? 'win' : 'loss';
  } else if (matchStatus === 'cancel') {
    status = 'loss';
  } else if (matchStatus === 'active' || matchStatus === 'start' || matchStatus === 'ongoing') {
    status = 'pending';
  } else if (matchStatus === 'deactive' || matchStatus === 'upcoming') {
    status = 'pending';
  } else if (prizeWon > 0) {
    status = 'win';
  } else if (matchSchedule) {
    const scheduleTime = new Date(matchSchedule).getTime();
    const now = Date.now();
    if (!Number.isNaN(scheduleTime) && scheduleTime < now) {
      status = prizeWon > 0 ? 'win' : 'loss';
    }
  }

  return {
    id: matchId,
    gameName,
    matchName,
    matchType,
    map,
    date: matchSchedule ? fDateTime(matchSchedule, 'DD/MM/YYYY hh:mm a') : 'N/A',
    entryFee: entryFee.toString(),
    prizeWon: prizeWon.toString(),
    status,
    heroImage: getMyMatchBannerUrl(banner),
    kills: kills > 0 ? kills : undefined,
    rank: rank ? rank : undefined,
  };
};
