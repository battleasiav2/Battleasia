import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type SquadWeeklyStatus = 'active' | 'completed';

export interface IEngagementSquadWeekly extends Document {
  squadId: Types.ObjectId;
  periodKey: string;
  winCount: number;
  status: SquadWeeklyStatus;
  creditedMatchIds: Types.ObjectId[];
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const engagementSquadWeeklySchema = new Schema<IEngagementSquadWeekly>(
  {
    squadId: { type: Schema.Types.ObjectId, ref: 'EngagementSquad', required: true, index: true },
    periodKey: { type: String, required: true, trim: true, index: true },
    winCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    creditedMatchIds: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

engagementSquadWeeklySchema.index({ squadId: 1, periodKey: 1 }, { unique: true });
engagementSquadWeeklySchema.index({ periodKey: 1, winCount: -1 });

export const EngagementSquadWeekly = mongoose.model<IEngagementSquadWeekly>(
  'EngagementSquadWeekly',
  engagementSquadWeeklySchema
);
