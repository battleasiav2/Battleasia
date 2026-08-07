import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type FeedPostType =
  | 'text'
  | 'image'
  | 'gallery'
  | 'video'
  | 'gif'
  | 'poll'
  | 'match_result'
  | 'tournament_result'
  | 'achievement'
  | 'shared';

export interface IFeed extends Document {
  categoryId: Types.ObjectId;
  title: string;
  description: string;
  coverUrl: string;
  postType: FeedPostType;
  mediaUrls: string[];
  hashtags: string[];
  visibility: 'public' | 'followers' | 'friends' | 'private';
  status: 'published' | 'draft';
  premiumOnly: boolean;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  totalLikes: number;
  authorId?: Types.ObjectId;
  authorName: string;
  authorAvatar: string;
  pinnedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const feedSchema = new Schema<IFeed>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'FeedCategory', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    postType: {
      type: String,
      enum: ['text', 'image', 'gallery', 'video', 'gif', 'poll', 'match_result', 'tournament_result', 'achievement', 'shared'],
      default: 'text',
    },
    mediaUrls: { type: [String], default: [] },
    hashtags: { type: [String], default: [] },
    visibility: { type: String, enum: ['public', 'followers', 'friends', 'private'], default: 'public' },
    pinnedAt: { type: Date, default: null },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    premiumOnly: { type: Boolean, default: false },
    totalViews: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: 'Admin' },
    authorAvatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hot paths: feed lists (latest / popular) + author timelines
feedSchema.index({ status: 1, createdAt: -1 });
feedSchema.index({ status: 1, totalViews: -1 });
feedSchema.index({ authorId: 1, createdAt: -1 });
feedSchema.index({ visibility: 1, status: 1, createdAt: -1 });

export const Feed = mongoose.model<IFeed>('Feed', feedSchema);
