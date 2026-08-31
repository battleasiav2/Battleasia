import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementStreak extends Document {
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  lastClaimDate: string | null;
  checkInDates: string[];
  claimDates: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementStreakSchema = new Schema<IUserEngagementStreak>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastCheckInDate: { type: String, default: null },
    lastClaimDate: { type: String, default: null },
    checkInDates: { type: [String], default: [] },
    claimDates: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const UserEngagementStreak = mongoose.model<IUserEngagementStreak>(
  'UserEngagementStreak',
  userEngagementStreakSchema
);
