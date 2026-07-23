import mongoose, { Schema } from 'mongoose';
const shopOrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    itemId: { type: Schema.Types.ObjectId, ref: 'ShopItem', required: true },
    amount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    symbol: { type: String, default: 'BAC' },
    paymentMethod: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });
export const ShopOrder = mongoose.model('ShopOrder', shopOrderSchema);
