import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IStoryHighlight extends Document {
  userId: Types.ObjectId;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  overlayText: string;
  caption: string;
  sourceStoryId?: Types.ObjectId;
  createdAt: Date;
}

const storyHighlightSchema = new Schema<IStoryHighlight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    overlayText: { type: String, default: '' },
    caption: { type: String, default: '' },
    sourceStoryId: { type: Schema.Types.ObjectId, ref: 'Story' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

storyHighlightSchema.index({ userId: 1, createdAt: -1 });

export const StoryHighlight = mongoose.model<IStoryHighlight>('StoryHighlight', storyHighlightSchema);
