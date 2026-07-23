import mongoose, { Schema } from 'mongoose';
const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, default: '' },
    status: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    ip: { type: String, default: '' },
    country: { type: String, default: '' },
    useragent: { type: Schema.Types.Mixed, default: {} },
    expiration: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Session = mongoose.model('Session', sessionSchema);
