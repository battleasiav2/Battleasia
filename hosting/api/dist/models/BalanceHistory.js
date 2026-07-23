import mongoose, { Schema } from 'mongoose';
const balanceHistorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdraw'], required: true },
    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    detail: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const BalanceHistory = mongoose.model('BalanceHistory', balanceHistorySchema);
