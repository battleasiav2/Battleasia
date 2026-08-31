import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type WelcomeMilestoneKey = 'signup' | 'first_match' | 'complete_profile' | 'first_deposit';
export type WelcomeMilestoneStatus = 'locked' | 'ready' | 'claimed';

export type WelcomeMilestoneState = {
  status: WelcomeMilestoneStatus;
  eligibleAt?: Date | null;
  claimedAt?: Date | null;
};

export interface IUserEngagementWelcome extends Document {
  userId: Types.ObjectId;
  signup: WelcomeMilestoneState;
  firstMatch: WelcomeMilestoneState;
  completeProfile: WelcomeMilestoneState;
  firstDeposit: WelcomeMilestoneState;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneStateSchema = new Schema<WelcomeMilestoneState>(
  {
    status: {
      type: String,
      enum: ['locked', 'ready', 'claimed'],
      default: 'locked' as WelcomeMilestoneStatus,
    },
    eligibleAt: { type: Date, default: null },
    claimedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userEngagementWelcomeSchema = new Schema<IUserEngagementWelcome>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    signup: { type: milestoneStateSchema, default: () => ({ status: 'locked' as WelcomeMilestoneStatus }) },
    firstMatch: { type: milestoneStateSchema, default: () => ({ status: 'locked' as WelcomeMilestoneStatus }) },
    completeProfile: { type: milestoneStateSchema, default: () => ({ status: 'locked' as WelcomeMilestoneStatus }) },
    firstDeposit: { type: milestoneStateSchema, default: () => ({ status: 'locked' as WelcomeMilestoneStatus }) },
  },
  { timestamps: true }
);

export const UserEngagementWelcome = mongoose.model<IUserEngagementWelcome>(
  'UserEngagementWelcome',
  userEngagementWelcomeSchema
);

export const WELCOME_MILESTONE_KEYS = [
  'signup',
  'first_match',
  'complete_profile',
  'first_deposit',
] as const;
