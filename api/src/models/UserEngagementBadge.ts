import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementBadge extends Document {
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  badgeKey: string;
  unlockedAt: Date;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementBadgeSchema = new Schema<IUserEngagementBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeId: { type: Schema.Types.ObjectId, ref: 'EngagementBadge', required: true },
    badgeKey: { type: String, required: true, trim: true, lowercase: true },
    unlockedAt: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userEngagementBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
userEngagementBadgeSchema.index({ userId: 1, unlockedAt: -1 });

export const UserEngagementBadge = mongoose.model<IUserEngagementBadge>(
  'UserEngagementBadge',
  userEngagementBadgeSchema
);
