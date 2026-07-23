import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IMatchParticipant extends Document {
  matchId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  email: string;
  avatar: string;
  pubgId: string;
  entryFee: number;
  placement?: number | null;
  kills?: number;
  points?: number;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IMatchParticipant>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    pubgId: { type: String, default: '' },
    entryFee: { type: Number, default: 0 },
    placement: { type: Number, default: null },
    kills: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

participantSchema.index({ matchId: 1, userId: 1 }, { unique: true });

export const MatchParticipant = mongoose.model<IMatchParticipant>('MatchParticipant', participantSchema);
