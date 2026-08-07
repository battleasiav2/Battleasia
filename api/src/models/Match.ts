import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type MatchStatus = 'active' | 'deactive' | 'start' | 'complete' | 'cancel';

export interface IMatchResultEntry {
  participantId: Types.ObjectId;
  pubgId?: string;
  playerName?: string;
  avatar?: string;
  status?: 'winner' | 'lose';
  placement?: number | null;
  kills?: number;
  points?: number;
  placePoint?: number;
  winPrize?: number;
  bonus?: number;
  refund?: number;
}

export interface IMatch extends Document {
  gameId: Types.ObjectId;
  gameMode: 'classic' | 'tdm';
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
  banner: string;
  prizeDescription: string;
  matchSponsor: string;
  matchDescription: string;
  matchPrivateDescription: string;
  resultDescription: string;
  resultScreenshots: string[];
  premiumOnly: boolean;
  platformFeePercent: number;
  status: MatchStatus;
  results: IMatchResultEntry[];
  winningsDistributed: boolean;
  entriesRefunded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const matchResultEntrySchema = new Schema<IMatchResultEntry>(
  {
    participantId: { type: Schema.Types.ObjectId, ref: 'MatchParticipant', required: true },
    pubgId: { type: String, default: '' },
    playerName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['winner', 'lose'], default: 'winner' },
    placement: { type: Number, default: null },
    kills: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    placePoint: { type: Number, default: 0 },
    winPrize: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    refund: { type: Number, default: 0 },
  },
  { _id: false }
);

const matchSchema = new Schema<IMatch>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    gameMode: { type: String, enum: ['classic', 'tdm'], default: 'classic' },
    roomId: { type: String, required: true },
    password: { type: String, default: '' },
    matchName: { type: String, required: true },
    matchUrl: { type: String, default: '' },
    matchSchedule: { type: String, required: true },
    killRateType: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    entryFee: { type: Number, default: 0 },
    totalPlayer: { type: Number, default: 100 },
    teamType: { type: String, default: 'solo' },
    perKill: { type: Number, default: 1 },
    matchType: { type: String, enum: ['free', 'paid'], default: 'paid' },
    map: { type: String, default: '' },
    totalKills: { type: Number },
    banner: { type: String, default: '' },
    prizeDescription: { type: String, default: '' },
    matchSponsor: { type: String, default: '' },
    matchDescription: { type: String, default: '' },
    matchPrivateDescription: { type: String, default: '' },
    resultDescription: { type: String, default: '' },
    resultScreenshots: { type: [String], default: [] },
    premiumOnly: { type: Boolean, default: false },
    platformFeePercent: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['active', 'deactive', 'start', 'complete', 'cancel'],
      default: 'active',
    },
    results: { type: [matchResultEntrySchema], default: [] },
    winningsDistributed: { type: Boolean, default: false },
    entriesRefunded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hot paths: public dashboard, game match lists, schedule sorts
matchSchema.index({ status: 1, matchSchedule: 1 });
matchSchema.index({ status: 1, entryFee: -1, totalPlayer: -1 });
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ gameId: 1, createdAt: -1 });
matchSchema.index({ gameId: 1, status: 1, matchSchedule: -1 });

export const Match = mongoose.model<IMatch>('Match', matchSchema);
