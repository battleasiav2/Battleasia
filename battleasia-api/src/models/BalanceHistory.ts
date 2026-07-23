import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBalanceHistory extends Document {
  userId: Types.ObjectId;
  username: string;
  email: string;
  avatar: string;
  performedBy?: Types.ObjectId;
  amount: number;
  type: 'deposit' | 'withdraw';
  balanceBefore: number;
  balanceAfter: number;
  detail?: Record<string, unknown>;
  createdAt: Date;
}

const balanceHistorySchema = new Schema<IBalanceHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdraw'], required: true },
    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    detail: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BalanceHistory = mongoose.model<IBalanceHistory>('BalanceHistory', balanceHistorySchema);
