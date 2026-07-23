import mongoose, { Schema } from 'mongoose';
const directConversationSchema = new Schema({
    participants: { type: [Schema.Types.ObjectId], ref: 'User', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '' },
}, { timestamps: true });
directConversationSchema.index({ participants: 1 });
directConversationSchema.index({ lastMessageAt: -1 });
export const DirectConversation = mongoose.model('DirectConversation', directConversationSchema);
