import mongoose, { Schema } from 'mongoose';
const savedPostSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    collectionName: { type: String, default: 'Saved' },
}, { timestamps: { createdAt: true, updatedAt: false } });
savedPostSchema.index({ userId: 1, feedId: 1 }, { unique: true });
export const SavedPost = mongoose.model('SavedPost', savedPostSchema);
