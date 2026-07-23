import mongoose, { Schema } from 'mongoose';
const feedSchema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, ref: 'FeedCategory', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    postType: {
        type: String,
        enum: ['text', 'image', 'gallery', 'video', 'gif', 'poll', 'match_result', 'tournament_result', 'achievement', 'shared'],
        default: 'text',
    },
    mediaUrls: { type: [String], default: [] },
    hashtags: { type: [String], default: [] },
    visibility: { type: String, enum: ['public', 'followers', 'friends', 'private'], default: 'public' },
    pinnedAt: { type: Date, default: null },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    premiumOnly: { type: Boolean, default: false },
    totalViews: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: 'Admin' },
    authorAvatar: { type: String, default: '' },
}, { timestamps: true });
export const Feed = mongoose.model('Feed', feedSchema);
