import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IDevicePushToken extends Document {
  userId: Types.ObjectId;
  token: string;
  platform: 'android' | 'web';
  lastSeen: Date;
  createdAt: Date;
}

const schema = new Schema<IDevicePushToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, maxlength: 4096 },
    platform: { type: String, enum: ['android', 'web'], required: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

schema.index({ userId: 1, platform: 1, token: 1 }, { unique: true });
schema.index({ lastSeen: -1 });

export const DevicePushToken = mongoose.model<IDevicePushToken>('DevicePushToken', schema);
