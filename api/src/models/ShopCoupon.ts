import mongoose, { Schema, type Document } from 'mongoose';

export type CouponKind = 'off' | 'bonus';

export interface IShopCoupon extends Document {
  code: string;
  kind: CouponKind;
  /** Percent off the pay amount, or extra BAC percent. */
  value: number;
  label: string;
  minCoins: number;
  /** 0 means unlimited. */
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const shopCouponSchema = new Schema<IShopCoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: { type: String, enum: ['off', 'bonus'], required: true },
    value: { type: Number, required: true },
    label: { type: String, default: '' },
    minCoins: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ShopCoupon = mongoose.model<IShopCoupon>('ShopCoupon', shopCouponSchema);
