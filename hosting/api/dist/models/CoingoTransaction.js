import mongoose, { Schema } from 'mongoose';
const coingoTransactionSchema = new Schema({
    merchantSerialNo: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['collection', 'payout'], required: true },
    amount: { type: Number, required: true },
    walletNumber: { type: String, default: '' },
    walletType: { type: String, default: '' },
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    currency_type: { type: String, default: '' },
    currency_amount: { type: Number, default: 0 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'success', 'failed', 'cancelled'], default: 'pending' },
    pollCount: { type: Number, default: 0 },
}, { timestamps: true });
export const CoingoTransaction = mongoose.model('CoingoTransaction', coingoTransactionSchema);
