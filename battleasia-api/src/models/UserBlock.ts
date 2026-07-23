import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserBlock extends Document {
  blockerId: Types.ObjectId;
  blockedId: Types.ObjectId;
  createdAt: Date;
}

const userBlockSchema = new Schema<IUserBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export const UserBlock = mongoose.model<IUserBlock>('UserBlock', userBlockSchema);
