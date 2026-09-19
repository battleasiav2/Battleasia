import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISquadChatMessage extends Document {
  squadId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  body: string;
  createdAt: Date;
}

const schema = new Schema<ISquadChatMessage>(
  {
    squadId: { type: Schema.Types.ObjectId, ref: 'EngagementSquad', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    body: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ squadId: 1, createdAt: -1 });

export const SquadChatMessage = mongoose.model<ISquadChatMessage>('SquadChatMessage', schema);
