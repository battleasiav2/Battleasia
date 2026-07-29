import mongoose, { Schema, type Document } from 'mongoose';

export interface ICoinRate extends Document {
  region: 'global' | 'bangladesh' | 'india' | 'pakistan';
  currency: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const coinRateSchema = new Schema<ICoinRate>(
  {
    region: { type: String, enum: ['global', 'bangladesh', 'india', 'pakistan'], required: true },
    currency: { type: String, required: true },
    rate: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

coinRateSchema.index({ region: 1, currency: 1 }, { unique: true });

export const CoinRate = mongoose.model<ICoinRate>('CoinRate', coinRateSchema);
