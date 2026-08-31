import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ReferralTierKey = 'tier_5' | 'tier_10' | 'tier_25';
export type ReferralTierStatus = 'locked' | 'ready' | 'claimed';

export type ReferralTierState = {
  status: ReferralTierStatus;
  eligibleAt?: Date | null;
  claimedAt?: Date | null;
};

export interface IUserEngagementReferral extends Document {
  userId: Types.ObjectId;
  tier5: ReferralTierState;
  tier10: ReferralTierState;
  tier25: ReferralTierState;
  createdAt: Date;
  updatedAt: Date;
}

const tierStateSchema = new Schema<ReferralTierState>(
  {
    status: {
      type: String,
      enum: ['locked', 'ready', 'claimed'],
      default: 'locked' as ReferralTierStatus,
    },
    eligibleAt: { type: Date, default: null },
    claimedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userEngagementReferralSchema = new Schema<IUserEngagementReferral>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    tier5: { type: tierStateSchema, default: () => ({ status: 'locked' as ReferralTierStatus }) },
    tier10: { type: tierStateSchema, default: () => ({ status: 'locked' as ReferralTierStatus }) },
    tier25: { type: tierStateSchema, default: () => ({ status: 'locked' as ReferralTierStatus }) },
  },
  { timestamps: true }
);

export const UserEngagementReferral = mongoose.model<IUserEngagementReferral>(
  'UserEngagementReferral',
  userEngagementReferralSchema
);

export const REFERRAL_TIER_KEYS = ['tier_5', 'tier_10', 'tier_25'] as const;
