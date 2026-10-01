import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IMatchChat extends Document {
  matchId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMatchChat>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: 'Player', maxlength: 40 },
    message: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

schema.index({ matchId: 1, createdAt: 1 });

export const MatchChat = mongoose.model<IMatchChat>('MatchChat', schema);
