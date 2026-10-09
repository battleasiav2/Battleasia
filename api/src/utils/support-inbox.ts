import { SupportConversation } from '../models/SupportConversation.js';
import { SupportMessage } from '../models/SupportMessage.js';

export type SupportPreview = {
  unread: number;
  lastFrom: '' | 'player' | 'admin';
  previewBody: string;
  previewAttachments: string[];
  attachmentCount: number;
};

type Bucket = SupportPreview & { sealed: boolean };

function asId(value: { toString(): string; _id?: { toString(): string } }) {
  if (value && typeof value === 'object' && value._id) return value._id.toString();
  return value.toString();
}

/** Newest player messages until the last admin reply. That count is the unread badge. */
export async function supportPreviews(ids: Array<{ toString(): string; _id?: { toString(): string } }>): Promise<Map<string, SupportPreview>> {
  const keys = ids.map(asId);
  const map = new Map<string, Bucket>();
  if (!keys.length) return map;

  const messages = await SupportMessage.find({ conversationId: { $in: keys } })
    .sort({ createdAt: -1 })
    .select('conversationId body attachments isAdmin')
    .lean();

  for (const msg of messages) {
    const key = String(msg.conversationId);
    const attachments = Array.isArray(msg.attachments)
      ? msg.attachments.filter((item): item is string => typeof item === 'string' && item.length > 0)
      : [];
    let bucket = map.get(key);
    if (!bucket) {
      bucket = {
        unread: 0,
        sealed: false,
        lastFrom: msg.isAdmin ? 'admin' : 'player',
        previewBody: typeof msg.body === 'string' ? msg.body : '',
        previewAttachments: attachments.slice(0, 3),
        attachmentCount: attachments.length,
      };
      map.set(key, bucket);
    } else {
      bucket.attachmentCount += attachments.length;
      if (bucket.previewAttachments.length < 3 && attachments.length) {
        bucket.previewAttachments = [
          ...bucket.previewAttachments,
          ...attachments.slice(0, 3 - bucket.previewAttachments.length),
        ];
      }
    }
    if (!bucket.sealed) {
      if (msg.isAdmin) bucket.sealed = true;
      else bucket.unread += 1;
    }
  }

  return map;
}

/** A ticket with no saved message still counts, except the empty live-chat placeholder. */
export function ticketUnread(status: string, subject: string, preview?: SupportPreview) {
  if (status === 'closed') return { unread: 0, lastFrom: preview?.lastFrom || '' };
  if (preview?.lastFrom) return { unread: preview.unread, lastFrom: preview.lastFrom };
  if ((subject || 'Live Support') !== 'Live Support') return { unread: 1, lastFrom: 'player' as const };
  return { unread: 0, lastFrom: '' as const };
}

export async function countOpenSupportUnread(): Promise<number> {
  const open = await SupportConversation.find({ status: { $ne: 'closed' } }).select('_id subject status');
  const map = await supportPreviews(open);
  let total = 0;
  for (const conv of open) {
    total += ticketUnread(conv.status, conv.subject || '', map.get(conv._id.toString())).unread;
  }
  return total;
}
