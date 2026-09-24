import mongoose, { Schema, type Document } from 'mongoose';

export interface ICoinRate extends Document {
  /** Country / market slug, e.g. bangladesh, india, global */
  region: string;
  /** ISO-ish currency code — fiat units per 1 BAC */
  currency: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const coinRateSchema = new Schema<ICoinRate>(
  {
    region: { type: String, required: true, trim: true, lowercase: true },
    currency: { type: String, required: true, trim: true, uppercase: true },
    rate: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

coinRateSchema.index({ region: 1, currency: 1 }, { unique: true });

export const CoinRate = mongoose.model<ICoinRate>('CoinRate', coinRateSchema);
