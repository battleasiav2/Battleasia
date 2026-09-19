import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IFraudHold extends Document {
  userId: Types.ObjectId;
  kind: 'transfer' | 'withdraw' | 'join';
  reason: string;
  status: 'open' | 'released';
  createdAt: Date;
  releasedAt?: Date;
}

const fraudHoldSchema = new Schema<IFraudHold>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['transfer', 'withdraw', 'join'], required: true },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['open', 'released'], default: 'open' },
    releasedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

fraudHoldSchema.index({ userId: 1, status: 1 });
fraudHoldSchema.index({ status: 1, createdAt: -1 });

export const FraudHold = mongoose.model<IFraudHold>('FraudHold', fraudHoldSchema);
