import mongoose, { Schema } from 'mongoose';
const feedCommentSchema = new Schema({
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    avatar: { type: String, default: '' },
    content: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'FeedComment', default: null },
    mentions: { type: [String], default: [] },
}, { timestamps: true });
feedCommentSchema.index({ feedId: 1, createdAt: -1 });
feedCommentSchema.index({ parentId: 1 });
export const FeedComment = mongoose.model('FeedComment', feedCommentSchema);
