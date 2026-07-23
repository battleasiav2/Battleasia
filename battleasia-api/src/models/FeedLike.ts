import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IFeedLike extends Document {
  userId: Types.ObjectId;
  feedId: Types.ObjectId;
  createdAt: Date;
}

const feedLikeSchema = new Schema<IFeedLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

feedLikeSchema.index({ userId: 1, feedId: 1 }, { unique: true });

export const FeedLike = mongoose.model<IFeedLike>('FeedLike', feedLikeSchema);
