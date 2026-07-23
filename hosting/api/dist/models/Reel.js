import mongoose, { Schema } from 'mongoose';
const reelSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    avatar: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    musicTitle: { type: String, default: '' },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
}, { timestamps: true });
reelSchema.index({ status: 1, createdAt: -1 });
reelSchema.index({ userId: 1, createdAt: -1 });
export const Reel = mongoose.model('Reel', reelSchema);
