import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ILedgerEntry extends Document {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  userId?: Types.ObjectId;
  refType: string;
  refId: string;
  idempotencyKey?: string;
  reversalOf?: Types.ObjectId;
  createdAt: Date;
}

const ledgerEntrySchema = new Schema<ILedgerEntry>(
  {
    debitAccount: { type: String, required: true },
    creditAccount: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    refType: { type: String, required: true },
    refId: { type: String, required: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    reversalOf: { type: Schema.Types.ObjectId, ref: 'LedgerEntry', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ledgerEntrySchema.index({ userId: 1, createdAt: -1 });
ledgerEntrySchema.index({ refType: 1, refId: 1 });

export const LedgerEntry = mongoose.model<ILedgerEntry>('LedgerEntry', ledgerEntrySchema);
