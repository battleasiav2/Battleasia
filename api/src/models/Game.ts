import mongoose, { Schema, type Document } from 'mongoose';

export interface IGame extends Document {
  name: string;
  packageName: string;
  image: string;
  logo: string;
  canCreateChallenge: boolean;
  status: boolean;
  comingSoon: boolean;
  idPrefix: string;
  rules: string;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    name: { type: String, required: true, trim: true },
    packageName: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    logo: { type: String, default: '' },
    canCreateChallenge: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
    comingSoon: { type: Boolean, default: false },
    idPrefix: { type: String, required: true, trim: true },
    rules: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Game = mongoose.model<IGame>('Game', gameSchema);
