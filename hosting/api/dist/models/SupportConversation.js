import mongoose, { Schema } from 'mongoose';
const supportConversationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const SupportConversation = mongoose.model('SupportConversation', supportConversationSchema);
