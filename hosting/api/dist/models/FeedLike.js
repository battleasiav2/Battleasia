import mongoose, { Schema } from 'mongoose';
const feedLikeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
feedLikeSchema.index({ userId: 1, feedId: 1 }, { unique: true });
export const FeedLike = mongoose.model('FeedLike', feedLikeSchema);
