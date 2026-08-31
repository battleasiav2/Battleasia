import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementSpin extends Document {
  userId: Types.ObjectId;
  periodKey: string;
  prizeId: string;
  prizeLabel: string;
  bacAmount: number;
  weight: number;
  probability: number;
  spunAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementSpinSchema = new Schema<IUserEngagementSpin>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    periodKey: { type: String, required: true, index: true },
    prizeId: { type: String, required: true },
    prizeLabel: { type: String, default: '' },
    bacAmount: { type: Number, default: 0, min: 0 },
    weight: { type: Number, default: 1, min: 0 },
    probability: { type: Number, default: 0, min: 0 },
    spunAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userEngagementSpinSchema.index({ userId: 1, periodKey: 1 });
userEngagementSpinSchema.index({ userId: 1, spunAt: -1 });

export const UserEngagementSpin = mongoose.model<IUserEngagementSpin>(
  'UserEngagementSpin',
  userEngagementSpinSchema
);
