import mongoose, { Schema, type Document } from 'mongoose';

export interface IEngagementClaimOffer extends Document {
  title: string;
  description: string;
  bacAmount: number;
  startsAt: Date;
  endsAt?: Date | null;
  active: boolean;
  maxClaims: number;
  createdAt: Date;
  updatedAt: Date;
}

const engagementClaimOfferSchema = new Schema<IEngagementClaimOffer>(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 240 },
    bacAmount: { type: Number, required: true, min: 1, max: 100000 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    maxClaims: { type: Number, default: 0, min: 0, max: 1000000 },
  },
  { timestamps: true }
);

engagementClaimOfferSchema.index({ active: 1, startsAt: 1 });

export const EngagementClaimOffer = mongoose.model<IEngagementClaimOffer>(
  'EngagementClaimOffer',
  engagementClaimOfferSchema
);
