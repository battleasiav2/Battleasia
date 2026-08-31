import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IEngagementSquadWeeklyClaim extends Document {
  userId: Types.ObjectId;
  squadId: Types.ObjectId;
  periodKey: string;
  claimedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const engagementSquadWeeklyClaimSchema = new Schema<IEngagementSquadWeeklyClaim>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    squadId: { type: Schema.Types.ObjectId, ref: 'EngagementSquad', required: true },
    periodKey: { type: String, required: true, trim: true },
    claimedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

engagementSquadWeeklyClaimSchema.index({ userId: 1, periodKey: 1 }, { unique: true });

export const EngagementSquadWeeklyClaim = mongoose.model<IEngagementSquadWeeklyClaim>(
  'EngagementSquadWeeklyClaim',
  engagementSquadWeeklyClaimSchema
);
