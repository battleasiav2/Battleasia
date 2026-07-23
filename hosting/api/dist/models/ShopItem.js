import mongoose, { Schema } from 'mongoose';
const shopItemSchema = new Schema({
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
}, { timestamps: true });
export const ShopItem = mongoose.model('ShopItem', shopItemSchema);
