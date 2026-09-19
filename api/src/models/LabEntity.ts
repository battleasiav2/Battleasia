import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type LabKind = 'live' | 'watch' | 'clan' | 'duel' | 'ocr' | 'cosmetic' | 'fantasy';

export interface ILabMessage {
  userId: Types.ObjectId;
  username: string;
  body: string;
  createdAt: Date;
}

export interface ILabEntity extends Document {
  kind: LabKind;
  title: string;
  tag: string;
  hostId: Types.ObjectId;
  hostName: string;
  members: Types.ObjectId[];
  hearts: number;
  status: string;
  matchId?: string;
  imageUrl: string;
  picks: string[];
  messages: ILabMessage[];
  stake: number;
  priceBac: number;
  giftBac: number;
  createdAt: Date;
  updatedAt: Date;
}

const labMessageSchema = new Schema<ILabMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    body: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const labEntitySchema = new Schema<ILabEntity>(
  {
    kind: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    tag: { type: String, default: '', trim: true, maxlength: 24 },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, default: '' },
    members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    hearts: { type: Number, default: 0 },
    status: { type: String, default: 'open' },
    matchId: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    picks: { type: [String], default: [] },
    messages: { type: [labMessageSchema], default: [] },
    stake: { type: Number, default: 0 },
    priceBac: { type: Number, default: 0 },
    giftBac: { type: Number, default: 0 },
  },
  { timestamps: true },
);

labEntitySchema.index({ kind: 1, createdAt: -1 });

export const LabEntity = mongoose.model<ILabEntity>('LabEntity', labEntitySchema);
