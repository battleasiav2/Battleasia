import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IDirectConversation extends Document {
  participants: Types.ObjectId[];
  lastMessageAt: Date;
  lastMessagePreview: string;
  createdAt: Date;
  updatedAt: Date;
}

const directConversationSchema = new Schema<IDirectConversation>(
  {
    participants: { type: [Schema.Types.ObjectId], ref: 'User', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '' },
  },
  { timestamps: true }
);

directConversationSchema.index({ participants: 1 });
directConversationSchema.index({ lastMessageAt: -1 });

export const DirectConversation = mongoose.model<IDirectConversation>(
  'DirectConversation',
  directConversationSchema
);
