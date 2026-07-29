
export type IMatchStatus = 'active' | 'deactive' | 'start' | 'complete' | 'cancel';

export interface IMatchRow {
  id: string;
  gameId: string;
  gameName?: string;
  gameMode?: 'classic' | 'tdm';
  roomId: string;
  password: string;
  matchName: string;
  matchUrl: string;
  matchSchedule: string;
  killRateType: 'automatic' | 'manual';
  entryFee: number;
  totalPlayer: number;
  teamType: string;
  perKill: number;
  matchType: 'free' | 'paid';
  map: string;
  totalKills?: number;
  banner?: string;
  prizeDescription?: string;
  matchSponsor?: string;
  matchDescription?: string;
  matchPrivateDescription?: string;
  resultDescription?: string;
  resultScreenshots?: string[];
  premiumOnly?: boolean;
  platformFeePercent?: number;
  status: IMatchStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMatchParticipantRow {
  id: string;
  userId: string;
  username: string;
  email?: string;
  avatar?: string;
  pubgId?: string;
  entryFee: number;
  joinedAt?: string | Date;
}