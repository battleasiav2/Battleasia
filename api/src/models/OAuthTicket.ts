import mongoose, { Schema, type Document } from 'mongoose';

export interface IOAuthTicket extends Document {
  kind: 'state' | 'handoff';
  key: string;
  provider: string;
  returnTo: string;
  origin: string;
  handoffKey: string;
  status: string;
  accessToken: string;
  refreshToken: string;
  userJson: string;
  error: string;
  expiresAt: Date;
}

const oauthTicketSchema = new Schema<IOAuthTicket>(
  {
    kind: { type: String, enum: ['state', 'handoff'], required: true },
    key: { type: String, required: true, unique: true },
    provider: { type: String, default: '' },
    returnTo: { type: String, default: '' },
    origin: { type: String, default: '' },
    handoffKey: { type: String, default: '' },
    status: { type: String, default: 'pending' },
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    userJson: { type: String, default: '' },
    error: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

oauthTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthTicket = mongoose.model<IOAuthTicket>('OAuthTicket', oauthTicketSchema);
