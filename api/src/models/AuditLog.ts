import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  actorEmail: string;
  actorName: string;
  action: string;
  target: string;
  detail: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String, default: '' },
    actorName: { type: String, default: '' },
    action: { type: String, required: true, index: true },
    target: { type: String, default: '' },
    detail: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export async function writeAudit(entry: {
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  action: string;
  target?: string;
  detail?: string;
}) {
  try {
    await AuditLog.create({
      actorId: entry.actorId || undefined,
      actorEmail: entry.actorEmail || '',
      actorName: entry.actorName || '',
      action: entry.action,
      target: entry.target || '',
      detail: entry.detail || '',
    });
  } catch (error) {
    console.warn('[audit] fail-open', error instanceof Error ? error.message : error);
  }
}
