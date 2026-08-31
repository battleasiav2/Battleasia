import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserTransferHistory extends Document {
  senderId: Types.ObjectId;
  senderUsername: string;
  recipientId: Types.ObjectId;
  recipientUsername: string;
  amount: number;
  feeAmount: number;
  feePercent: number;
  totalDebited: number;
  note: string;
  status: 'completed' | 'failed';
  createdAt: Date;
}

const userTransferHistorySchema = new Schema<IUserTransferHistory>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderUsername: { type: String, default: '' },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientUsername: { type: String, default: '' },
    amount: { type: Number, required: true },
    feeAmount: { type: Number, default: 0 },
    feePercent: { type: Number, default: 0 },
    totalDebited: { type: Number, required: true },
    note: { type: String, default: '', maxlength: 200 },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userTransferHistorySchema.index({ senderId: 1, createdAt: -1 });
userTransferHistorySchema.index({ recipientId: 1, createdAt: -1 });

export const UserTransferHistory = mongoose.model<IUserTransferHistory>(
  'UserTransferHistory',
  userTransferHistorySchema
);

export function serializeUserTransferHistory(record: IUserTransferHistory, viewerId?: string) {
  const viewer = viewerId ? String(viewerId) : '';
  const isSender = viewer && record.senderId.toString() === viewer;
  const isRecipient = viewer && record.recipientId.toString() === viewer;

  return {
    _id: record._id.toString(),
    id: record._id.toString(),
    direction: isSender ? 'sent' : isRecipient ? 'received' : 'unknown',
    senderId: record.senderId.toString(),
    senderUsername: record.senderUsername,
    recipientId: record.recipientId.toString(),
    recipientUsername: record.recipientUsername,
    counterpartyUsername: isSender ? record.recipientUsername : record.senderUsername,
    amount: record.amount,
    feeAmount: record.feeAmount,
    feePercent: record.feePercent,
    totalDebited: record.totalDebited,
    note: record.note || '',
    status: record.status,
    createdAt: record.createdAt,
  };
}
