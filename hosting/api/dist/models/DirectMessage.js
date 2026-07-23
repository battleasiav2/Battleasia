import mongoose, { Schema } from 'mongoose';
const directMessageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'DirectConversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, default: '' },
    senderAvatar: { type: String, default: '' },
    body: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    readBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    editedAt: { type: Date, default: null },
    deletedForEveryone: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
directMessageSchema.index({ conversationId: 1, createdAt: -1 });
export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
