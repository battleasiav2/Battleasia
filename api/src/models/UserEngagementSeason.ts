import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementSeason extends Document {
  userId: Types.ObjectId;
  seasonKey: string;
  xp: number;
  claimedFreeLevels: number[];
  claimedPlusLevels: number[];
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementSeasonSchema = new Schema<IUserEngagementSeason>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seasonKey: { type: String, required: true, trim: true, index: true },
    xp: { type: Number, default: 0, min: 0 },
    claimedFreeLevels: { type: [Number], default: [] },
    claimedPlusLevels: { type: [Number], default: [] },
  },
  { timestamps: true }
);

userEngagementSeasonSchema.index({ userId: 1, seasonKey: 1 }, { unique: true });

export const UserEngagementSeason = mongoose.model<IUserEngagementSeason>(
  'UserEngagementSeason',
  userEngagementSeasonSchema
);
