import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISupportMessage extends Document {
  conversationId: Types.ObjectId;
  body: string;
  senderId: Types.ObjectId;
  senderName: string;
  senderAvatar: string;
  isAdmin: boolean;
  attachments: string[];
  createdAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'SupportConversation', required: true },
    body: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, default: '' },
    senderAvatar: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    attachments: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SupportMessage = mongoose.model<ISupportMessage>('SupportMessage', supportMessageSchema);
