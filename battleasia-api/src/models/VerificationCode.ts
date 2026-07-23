import mongoose, { Schema, type Document } from 'mongoose';

export type VerificationType = 'signup' | 'reset' | 'admin_login';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  type: VerificationType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['signup', 'reset', 'admin_login'], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

verificationCodeSchema.index({ email: 1, type: 1 });

export const VerificationCode = mongoose.model<IVerificationCode>(
  'VerificationCode',
  verificationCodeSchema
);
