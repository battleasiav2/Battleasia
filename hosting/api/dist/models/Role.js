import mongoose, { Schema } from 'mongoose';
const roleSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['admin', 'official', 'agent', 'player'], default: 'player' },
    parent: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    permissions: { type: [String], default: [] },
    level: { type: Number, default: 0 },
}, { timestamps: true });
export const Role = mongoose.model('Role', roleSchema);
