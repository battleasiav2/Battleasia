import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementShare extends Document {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  status: 'claimed';
  platform: string;
  bacAmount: number;
  sharedAt: Date;
  claimedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementShareSchema = new Schema<IUserEngagementShare>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    status: { type: String, enum: ['claimed'], default: 'claimed' },
    platform: { type: String, default: 'native', maxlength: 40 },
    bacAmount: { type: Number, default: 0, min: 0 },
    sharedAt: { type: Date, default: Date.now },
    claimedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userEngagementShareSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export const UserEngagementShare = mongoose.model<IUserEngagementShare>(
  'UserEngagementShare',
  userEngagementShareSchema
);
