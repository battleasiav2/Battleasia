import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface IWithdrawalHistory extends Document {
  userId: Types.ObjectId;
  user_email: string;
  username: string;
  coin_amount: number;
  wallet_type: string;
  wallet_address: string;
  currency_type: string;
  currency_amount: number;
  description: string;
  status: WithdrawalStatus;
  processed_at?: Date;
  processed_by?: Types.ObjectId;
  rejection_reason?: string;
  notes?: string;
  transaction_hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalHistorySchema = new Schema<IWithdrawalHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user_email: { type: String, default: '' },
    username: { type: String, default: '' },
    coin_amount: { type: Number, required: true },
    wallet_type: { type: String, default: 'crypto' },
    wallet_address: { type: String, required: true },
    currency_type: { type: String, default: 'USDT' },
    currency_amount: { type: Number, default: 0 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
    processed_at: { type: Date },
    processed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    rejection_reason: { type: String, default: '' },
    notes: { type: String, default: '' },
    transaction_hash: { type: String, default: '' },
  },
  { timestamps: true }
);

export const WithdrawalHistory = mongoose.model<IWithdrawalHistory>('WithdrawalHistory', withdrawalHistorySchema);
