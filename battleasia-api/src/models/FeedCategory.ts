import mongoose, { Schema, type Document } from 'mongoose';

export interface IFeedCategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedCategorySchema = new Schema<IFeedCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

export const FeedCategory = mongoose.model<IFeedCategory>('FeedCategory', feedCategorySchema);
