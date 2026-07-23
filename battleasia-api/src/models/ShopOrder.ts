import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IShopOrder extends Document {
  userId: Types.ObjectId;
  username: string;
  email: string;
  itemId: Types.ObjectId;
  amount: number;
  price: number;
  symbol: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const shopOrderSchema = new Schema<IShopOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    itemId: { type: Schema.Types.ObjectId, ref: 'ShopItem', required: true },
    amount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    symbol: { type: String, default: 'BAC' },
    paymentMethod: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

export const ShopOrder = mongoose.model<IShopOrder>('ShopOrder', shopOrderSchema);
