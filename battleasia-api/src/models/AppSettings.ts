import mongoose, { Schema, type Document } from 'mongoose';

export interface IAppSettings extends Document {
  key: string;
  premiumDuration: number;
  premiumPrice: number;
  commissionRate: number;
}

const appSettingsSchema = new Schema<IAppSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    premiumDuration: { type: Number, default: 30 },
    premiumPrice: { type: Number, default: 100 },
    commissionRate: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const AppSettings = mongoose.model<IAppSettings>('AppSettings', appSettingsSchema);

export async function getAppSettings() {
  let settings = await AppSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await AppSettings.create({ key: 'global' });
  }
  return settings;
}
