import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUserEngagementSquad extends Document {
  userId: Types.ObjectId;
  squadId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userEngagementSquadSchema = new Schema<IUserEngagementSquad>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    squadId: { type: Schema.Types.ObjectId, ref: 'EngagementSquad', required: true, index: true },
  },
  { timestamps: true }
);

export const UserEngagementSquad = mongoose.model<IUserEngagementSquad>(
  'UserEngagementSquad',
  userEngagementSquadSchema
);
