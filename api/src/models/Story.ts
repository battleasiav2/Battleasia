import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IStory extends Document {
  userId: Types.ObjectId;
  username: string;
  avatar: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  overlayText: string;
  stickers: Array<{ emoji: string; x: number; y: number }>;
  poll?: {
    question: string;
    kind?: 'poll' | 'quiz';
    correctIndex?: number;
    options: Array<{ text: string; votes: Types.ObjectId[] }>;
  };
  expiresAt: Date;
  viewers: Types.ObjectId[];
  reactions: Array<{ userId: Types.ObjectId; emoji: string }>;
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
    overlayText: { type: String, default: '' },
    stickers: {
      type: [
        {
          emoji: { type: String, default: '' },
          x: { type: Number, default: 50 },
          y: { type: Number, default: 50 },
        },
      ],
      default: [],
    },
    poll: {
      question: { type: String, default: '' },
      kind: { type: String, enum: ['poll', 'quiz'], default: 'poll' },
      correctIndex: { type: Number, default: -1 },
      options: {
        type: [
          {
            text: { type: String, default: '' },
            votes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
          },
        ],
        default: [],
      },
    },
    expiresAt: { type: Date, required: true },
    viewers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    reactions: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User' },
          emoji: { type: String, default: '' },
        },
      ],
      default: [],
    },
    totalViews: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

storySchema.index({ userId: 1, expiresAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story = mongoose.model<IStory>('Story', storySchema);
