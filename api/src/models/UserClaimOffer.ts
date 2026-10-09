import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserClaimOffer extends Document {
  userId: Types.ObjectId;
  offerId: Types.ObjectId;
  claimedAt: Date;
  bacAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userClaimOfferSchema = new Schema<IUserClaimOffer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    offerId: { type: Schema.Types.ObjectId, ref: 'EngagementClaimOffer', required: true },
    claimedAt: { type: Date, default: Date.now },
    bacAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

userClaimOfferSchema.index({ userId: 1, offerId: 1 }, { unique: true });
userClaimOfferSchema.index({ offerId: 1 });

export const UserClaimOffer = mongoose.model<IUserClaimOffer>('UserClaimOffer', userClaimOfferSchema);
