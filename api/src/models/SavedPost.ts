import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISavedPost extends Document {
  userId: Types.ObjectId;
  feedId: Types.ObjectId;
  collectionName: string;
  createdAt: Date;
}

const savedPostSchema = new Schema<ISavedPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    collectionName: { type: String, default: 'Saved' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedPostSchema.index({ userId: 1, feedId: 1 }, { unique: true });

export const SavedPost = mongoose.model<ISavedPost>('SavedPost', savedPostSchema);
