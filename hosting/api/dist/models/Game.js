import mongoose, { Schema } from 'mongoose';
const gameSchema = new Schema({
    name: { type: String, required: true, trim: true },
    packageName: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    logo: { type: String, default: '' },
    canCreateChallenge: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
    comingSoon: { type: Boolean, default: false },
    idPrefix: { type: String, required: true, trim: true },
    rules: { type: String, default: '' },
}, { timestamps: true });
export const Game = mongoose.model('Game', gameSchema);
