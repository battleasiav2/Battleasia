import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  username: string;
  email: string;
  role: string;
  status: boolean;
  avatar: string;
  ip: string;
  country: string;
  useragent: Record<string, unknown>;
  expiration: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, default: '' },
    status: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    ip: { type: String, default: '' },
    country: { type: String, default: '' },
    useragent: { type: Schema.Types.Mixed, default: {} },
    expiration: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);
