import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBusinessWallet extends Document {
  channel_id: Types.ObjectId;
  wallet_address: string;
  currency_type: string;
  enabled: boolean;
  qr_code: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessWalletSchema = new Schema<IBusinessWallet>(
  {
    channel_id: { type: Schema.Types.ObjectId, ref: 'PaymentChannel', required: true },
    wallet_address: { type: String, required: true },
    currency_type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    qr_code: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BusinessWallet = mongoose.model<IBusinessWallet>('BusinessWallet', businessWalletSchema);
