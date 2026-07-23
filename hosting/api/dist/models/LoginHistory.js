import mongoose, { Schema } from 'mongoose';
const loginHistorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    ip: { type: String, default: '' },
    country: { type: String, default: '' },
    useragent: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
