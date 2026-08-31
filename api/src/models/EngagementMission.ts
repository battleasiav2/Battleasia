import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type EngagementMissionType = 'daily' | 'weekly' | 'one_time' | 'event';

export type EngagementMissionAction =
  | 'daily_login'
  | 'join_match'
  | 'win_match'
  | 'get_kills'
  | 'complete_profile'
  | 'first_deposit'
  | 'refer_user'
  | 'manual';

export type EngagementMissionReward = {
  bacAmount: number;
  label?: string;
};

export interface IEngagementMission extends Document {
  key: string;
  title: string;
  description: string;
  icon: string;
  type: EngagementMissionType;
  action: EngagementMissionAction;
  targetCount: number;
  reward: EngagementMissionReward;
  active: boolean;
  inDailyPool: boolean;
  sortOrder: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  gameId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const engagementMissionSchema = new Schema<IEngagementMission>(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    icon: { type: String, default: 'solar:gift-bold', maxlength: 80 },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'one_time', 'event'],
      default: 'daily',
    },
    action: {
      type: String,
      enum: [
        'daily_login',
        'join_match',
        'win_match',
        'get_kills',
        'complete_profile',
        'first_deposit',
        'refer_user',
        'manual',
      ],
      default: 'manual',
    },
    targetCount: { type: Number, default: 1, min: 1 },
    reward: {
      type: Schema.Types.Mixed,
      default: () => ({ bacAmount: 0 }),
    },
    active: { type: Boolean, default: true },
    inDailyPool: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', default: null },
  },
  { timestamps: true }
);

engagementMissionSchema.index({ active: 1, sortOrder: 1 });
engagementMissionSchema.index({ type: 1, active: 1 });

export const EngagementMission = mongoose.model<IEngagementMission>(
  'EngagementMission',
  engagementMissionSchema
);

export function normalizeEngagementMissionReward(
  raw?: Partial<EngagementMissionReward> | null
): EngagementMissionReward {
  return {
    bacAmount: Math.max(Number(raw?.bacAmount) || 0, 0),
    label: raw?.label ? String(raw.label).slice(0, 80) : undefined,
  };
}
