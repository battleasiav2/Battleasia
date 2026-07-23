import mongoose, { Schema } from 'mongoose';
const withdrawalHistorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user_email: { type: String, default: '' },
    username: { type: String, default: '' },
    coin_amount: { type: Number, required: true },
    wallet_type: { type: String, default: 'crypto' },
    wallet_address: { type: String, required: true },
    currency_type: { type: String, default: 'USDT' },
    currency_amount: { type: Number, default: 0 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
    processed_at: { type: Date },
    processed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    rejection_reason: { type: String, default: '' },
    notes: { type: String, default: '' },
    transaction_hash: { type: String, default: '' },
}, { timestamps: true });
export const WithdrawalHistory = mongoose.model('WithdrawalHistory', withdrawalHistorySchema);
