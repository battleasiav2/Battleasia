import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IDispute extends Document {
  userId: Types.ObjectId;
  matchId?: Types.ObjectId;
  conversationId?: Types.ObjectId;
  subject: string;
  evidenceUrls: string[];
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';
  resolution: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IDispute>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'SupportConversation' },
    subject: { type: String, default: '', maxlength: 160 },
    evidenceUrls: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'reviewing', 'resolved', 'rejected'], default: 'open' },
    resolution: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true },
);

schema.index({ status: 1, updatedAt: -1 });
schema.index({ matchId: 1, createdAt: -1 });

export const Dispute = mongoose.model<IDispute>('Dispute', schema);
