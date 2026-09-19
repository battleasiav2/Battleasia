import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IDeviceFingerprint extends Document {
  userId: Types.ObjectId;
  hash: string;
  ip: string;
  ua: string;
  lastSeen: Date;
  createdAt: Date;
}

const schema = new Schema<IDeviceFingerprint>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hash: { type: String, required: true },
    ip: { type: String, default: '' },
    ua: { type: String, default: '' },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

schema.index({ hash: 1 });
schema.index({ ip: 1, createdAt: -1 });
schema.index({ userId: 1, hash: 1 }, { unique: true });
schema.index({ lastSeen: -1 });

export const DeviceFingerprint = mongoose.model<IDeviceFingerprint>('DeviceFingerprint', schema);
