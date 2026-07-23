import mongoose, { Schema } from 'mongoose';
const referralHistorySchema = new Schema({
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    depositAmount: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 10 },
    commissionAmount: { type: Number, default: 0 },
    depositId: { type: Schema.Types.ObjectId, ref: 'DepositHistory', default: null },
    depositSource: { type: String, enum: ['manual', 'admin', 'coingo'], default: 'manual' },
    referredUsername: { type: String, default: '' },
    referredEmail: { type: String, default: '' },
    status: { type: String, default: 'paid' },
}, { timestamps: { createdAt: true, updatedAt: false } });
referralHistorySchema.index({ referrerId: 1, createdAt: -1 });
referralHistorySchema.index({ referredUserId: 1, createdAt: -1 });
export const ReferralHistory = mongoose.model('ReferralHistory', referralHistorySchema);
