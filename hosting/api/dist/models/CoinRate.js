import mongoose, { Schema } from 'mongoose';
const coinRateSchema = new Schema({
    region: { type: String, enum: ['global', 'bangladesh', 'india', 'pakistan'], required: true },
    currency: { type: String, required: true },
    rate: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
coinRateSchema.index({ region: 1, currency: 1 }, { unique: true });
export const CoinRate = mongoose.model('CoinRate', coinRateSchema);
