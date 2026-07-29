import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface INotificationRead extends Document {
  userId: Types.ObjectId;
  notificationId: Types.ObjectId;
  readAt: Date;
}

const notificationReadSchema = new Schema<INotificationRead>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notificationId: { type: Schema.Types.ObjectId, ref: 'Notification', required: true },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

notificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

export const NotificationRead = mongoose.model<INotificationRead>(
  'NotificationRead',
  notificationReadSchema
);
