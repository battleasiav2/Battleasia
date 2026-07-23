import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IDirectMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  senderAvatar: string;
  body: string;
  attachments: string[];
  readBy: Types.ObjectId[];
  editedAt?: Date | null;
  deletedForEveryone: boolean;
  createdAt: Date;
}

const directMessageSchema = new Schema<IDirectMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'DirectConversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, default: '' },
    senderAvatar: { type: String, default: '' },
    body: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    readBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    editedAt: { type: Date, default: null },
    deletedForEveryone: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

directMessageSchema.index({ conversationId: 1, createdAt: -1 });

export const DirectMessage = mongoose.model<IDirectMessage>('DirectMessage', directMessageSchema);
