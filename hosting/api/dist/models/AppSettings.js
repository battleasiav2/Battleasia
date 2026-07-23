import mongoose, { Schema } from 'mongoose';
const appSettingsSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'global' },
    premiumDuration: { type: Number, default: 30 },
    premiumPrice: { type: Number, default: 100 },
    commissionRate: { type: Number, default: 10 },
}, { timestamps: true });
export const AppSettings = mongoose.model('AppSettings', appSettingsSchema);
export async function getAppSettings() {
    let settings = await AppSettings.findOne({ key: 'global' });
    if (!settings) {
        settings = await AppSettings.create({ key: 'global' });
    }
    return settings;
}
