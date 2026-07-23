import mongoose, { Schema } from 'mongoose';
const userBlockSchema = new Schema({
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
export const UserBlock = mongoose.model('UserBlock', userBlockSchema);
