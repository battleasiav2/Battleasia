import mongoose, { Schema } from 'mongoose';
const verificationCodeSchema = new Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['signup', 'reset', 'admin_login'], required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
verificationCodeSchema.index({ email: 1, type: 1 });
export const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);
