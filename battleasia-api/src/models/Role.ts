import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  type: 'admin' | 'official' | 'agent' | 'player';
  parent?: Types.ObjectId | null;
  permissions: string[];
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['admin', 'official', 'agent', 'player'], default: 'player' },
    parent: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    permissions: { type: [String], default: [] },
    level: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
