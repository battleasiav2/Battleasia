import mongoose, { Schema } from 'mongoose';
const supportMessageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'SupportConversation', required: true },
    body: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, default: '' },
    senderAvatar: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    attachments: { type: [String], default: [] },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);
