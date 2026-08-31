import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type UserEngagementProgressStatus = 'active' | 'completed' | 'claimed';

export interface IUserEngagementProgress extends Document {
  userId: Types.ObjectId;
  missionId: Types.ObjectId;
  missionKey: string;
  status: UserEngagementProgressStatus;
  progress: number;
  target: number;
  periodKey: string;
  completedAt?: Date | null;
  claimedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementProgressSchema = new Schema<IUserEngagementProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    missionId: { type: Schema.Types.ObjectId, ref: 'EngagementMission', required: true },
    missionKey: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'claimed'],
      default: 'active',
    },
    progress: { type: Number, default: 0, min: 0 },
    target: { type: Number, default: 1, min: 1 },
    periodKey: { type: String, default: '', index: true },
    completedAt: { type: Date, default: null },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userEngagementProgressSchema.index({ userId: 1, missionId: 1, periodKey: 1 }, { unique: true });
userEngagementProgressSchema.index({ userId: 1, status: 1 });

export const UserEngagementProgress = mongoose.model<IUserEngagementProgress>(
  'UserEngagementProgress',
  userEngagementProgressSchema
);
