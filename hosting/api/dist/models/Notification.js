import mongoose, { Schema } from 'mongoose';
const notificationSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    subject: { type: String, default: '' },
    category: { type: String, default: 'General' },
    type: { type: String, default: 'general' },
    avatarUrl: { type: String, default: '' },
    premiumOnly: { type: Boolean, default: false },
    target: { type: String, enum: ['all', 'selected'], default: 'all' },
    recipients: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    entityType: { type: String, default: '' },
    entityId: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Notification = mongoose.model('Notification', notificationSchema);
