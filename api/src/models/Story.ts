import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IStory extends Document {
  userId: Types.ObjectId;
  username: string;
  avatar: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  expiresAt: Date;
  viewers: Types.ObjectId[];
  totalViews: number;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    avatar: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    viewers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    totalViews: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

storySchema.index({ userId: 1, expiresAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story = mongoose.model<IStory>('Story', storySchema);
