import mongoose, { Schema } from 'mongoose';
const feedCategorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
}, { timestamps: true });
export const FeedCategory = mongoose.model('FeedCategory', feedCategorySchema);
