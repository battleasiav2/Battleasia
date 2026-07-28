import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type SocialReportTargetType = 'user' | 'feed' | 'reel';
export type SocialReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface ISocialReport extends Document {
  reporterId: Types.ObjectId;
  targetType: SocialReportTargetType;
  targetId: Types.ObjectId;
  reason: string;
  details: string;
  status: SocialReportStatus;
  adminNote: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const socialReportSchema = new Schema<ISocialReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['user', 'feed', 'reel'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, maxlength: 80 },
    details: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
    adminNote: { type: String, default: '', maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

socialReportSchema.index({ status: 1, createdAt: -1 });
socialReportSchema.index({ targetType: 1, targetId: 1 });
socialReportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 }, { unique: true });

export const SocialReport = mongoose.model<ISocialReport>('SocialReport', socialReportSchema);
