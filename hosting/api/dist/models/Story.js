import mongoose, { Schema } from 'mongoose';
const storySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    avatar: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    viewers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    totalViews: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });
storySchema.index({ userId: 1, expiresAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Story = mongoose.model('Story', storySchema);
