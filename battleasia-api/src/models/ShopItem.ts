import mongoose, { Schema, type Document } from 'mongoose';

export interface IShopItem extends Document {
  amount: number;
  badge: 'Popular' | 'New' | 'Hot' | 'Best' | 'None';
  price: number;
  originalPrice: number;
  discountPercent: number;
  symbol: string;
  paymentOptions: ('bkash' | 'nagad' | 'crypto')[];
  image: string;
  isActive: boolean;
  status: 'available' | 'soldout';
  createdAt: Date;
  updatedAt: Date;
}

const shopItemSchema = new Schema<IShopItem>(
  {
    amount: { type: Number, required: true },
    badge: { type: String, enum: ['Popular', 'New', 'Hot', 'Best', 'None'], default: 'None' },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    symbol: { type: String, default: 'BAC' },
    paymentOptions: { type: [String], default: ['bkash', 'nagad', 'crypto'] },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['available', 'soldout'], default: 'available' },
  },
  { timestamps: true }
);

export const ShopItem = mongoose.model<IShopItem>('ShopItem', shopItemSchema);
