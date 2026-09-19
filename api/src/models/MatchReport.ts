import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IMatchReport extends Document {
  matchId: Types.ObjectId;
  reporterId: Types.ObjectId;
  targetUserId: Types.ObjectId;
  reason: string;
  detail: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMatchReport>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: 'collusion', maxlength: 80 },
    detail: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
  },
  { timestamps: true },
);

schema.index({ matchId: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
schema.index({ reporterId: 1, matchId: 1, targetUserId: 1 }, { unique: true });

export const MatchReport = mongoose.model<IMatchReport>('MatchReport', schema);
