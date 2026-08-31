import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type EngagementBadgeCriteria = 'total_kills' | 'total_wins';

export interface IEngagementBadge extends Document {
  key: string;
  title: string;
  description: string;
  icon: string;
  criteria: EngagementBadgeCriteria;
  threshold: number;
  tier: number;
  active: boolean;
  sortOrder: number;
  gameId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const engagementBadgeSchema = new Schema<IEngagementBadge>(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    icon: { type: String, default: 'solar:medal-ribbons-star-bold', maxlength: 80 },
    criteria: {
      type: String,
      enum: ['total_kills', 'total_wins'],
      required: true,
    },
    threshold: { type: Number, required: true, min: 1 },
    tier: { type: Number, default: 1, min: 1 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', default: null },
  },
  { timestamps: true }
);

engagementBadgeSchema.index({ active: 1, sortOrder: 1 });
engagementBadgeSchema.index({ criteria: 1, threshold: 1 });

export const EngagementBadge = mongoose.model<IEngagementBadge>('EngagementBadge', engagementBadgeSchema);
