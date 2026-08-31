import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type WeeklyArenaStatus = 'active' | 'completed' | 'claimed';

export interface IUserEngagementWeekly extends Document {
  userId: Types.ObjectId;
  periodKey: string;
  winCount: number;
  status: WeeklyArenaStatus;
  completedAt?: Date | null;
  claimedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementWeeklySchema = new Schema<IUserEngagementWeekly>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    periodKey: { type: String, required: true, trim: true, index: true },
    winCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'claimed'],
      default: 'active',
    },
    completedAt: { type: Date, default: null },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userEngagementWeeklySchema.index({ userId: 1, periodKey: 1 }, { unique: true });
userEngagementWeeklySchema.index({ periodKey: 1, winCount: -1 });

export const UserEngagementWeekly = mongoose.model<IUserEngagementWeekly>(
  'UserEngagementWeekly',
  userEngagementWeeklySchema
);
