import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementLevel extends Document {
  userId: Types.ObjectId;
  xp: number;
  level: number;
  lastXpAt: Date | null;
  lastXpReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementLevelSchema = new Schema<IUserEngagementLevel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    lastXpAt: { type: Date, default: null },
    lastXpReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserEngagementLevel = mongoose.model<IUserEngagementLevel>(
  'UserEngagementLevel',
  userEngagementLevelSchema
);
