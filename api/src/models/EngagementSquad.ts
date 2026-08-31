import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IEngagementSquad extends Document {
  name: string;
  inviteCode: string;
  ownerId: Types.ObjectId;
  memberIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const engagementSquadSchema = new Schema<IEngagementSquad>(
  {
    name: { type: String, required: true, trim: true, maxlength: 32 },
    inviteCode: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const EngagementSquad = mongoose.model<IEngagementSquad>('EngagementSquad', engagementSquadSchema);
