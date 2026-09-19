import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface IKycRecord extends Document {
  userId: Types.ObjectId;
  dateOfBirth?: Date;
  status: KycStatus;
  note: string;
  reviewerId?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IKycRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'pending' },
    note: { type: String, default: '' },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

schema.index({ status: 1, updatedAt: -1 });

export const KycRecord = mongoose.model<IKycRecord>('KycRecord', schema);
