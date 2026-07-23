import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISupportConversation extends Document {
  userId: Types.ObjectId;
  status: 'open' | 'closed' | 'pending';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supportConversationSchema = new Schema<ISupportConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SupportConversation = mongoose.model<ISupportConversation>(
  'SupportConversation',
  supportConversationSchema
);
