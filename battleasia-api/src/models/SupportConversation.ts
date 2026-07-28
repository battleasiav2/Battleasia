import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const SUPPORT_TICKET_CATEGORIES = ['payment', 'match', 'account', 'other'] as const;
export type SupportTicketCategory = (typeof SUPPORT_TICKET_CATEGORIES)[number];

export interface ISupportConversation extends Document {
  userId: Types.ObjectId;
  subject: string;
  category: SupportTicketCategory;
  status: 'open' | 'closed' | 'pending';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supportConversationSchema = new Schema<ISupportConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, trim: true, maxlength: 120, default: 'Live Support' },
    category: { type: String, enum: SUPPORT_TICKET_CATEGORIES, default: 'other' },
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SupportConversation = mongoose.model<ISupportConversation>(
  'SupportConversation',
  supportConversationSchema
);
