import mongoose, { Schema } from 'mongoose';
const notificationReadSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notificationId: { type: Schema.Types.ObjectId, ref: 'Notification', required: true },
    readAt: { type: Date, default: Date.now },
}, { timestamps: false });
notificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });
export const NotificationRead = mongoose.model('NotificationRead', notificationReadSchema);
