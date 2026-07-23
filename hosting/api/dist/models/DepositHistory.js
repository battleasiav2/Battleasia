import mongoose, { Schema } from 'mongoose';
const depositHistorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user_email: { type: String, default: '' },
    username: { type: String, default: '' },
    transaction_id: { type: String, required: true },
    coin_amount: { type: Number, required: true },
    payment_currency: { type: String, default: 'USD' },
    payment_amount: { type: Number, default: 0 },
    from_address: { type: String, default: '' },
    payment_channel: { type: Schema.Types.ObjectId, ref: 'PaymentChannel', required: true },
    to_wallet_address: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
    processed_at: { type: Date },
    processed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    rejection_reason: { type: String, default: '' },
    notes: { type: String, default: '' },
}, { timestamps: true });
export const DepositHistory = mongoose.model('DepositHistory', depositHistorySchema);
