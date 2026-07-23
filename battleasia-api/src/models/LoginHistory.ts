import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: Types.ObjectId;
  username: string;
  email: string;
  avatar: string;
  ip: string;
  country: string;
  useragent: Record<string, unknown>;
  createdAt: Date;
}

const loginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    ip: { type: String, default: '' },
    country: { type: String, default: '' },
    useragent: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', loginHistorySchema);
