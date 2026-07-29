export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: Date;
  isAdmin: boolean;
  attachments?: string[];
};

export type TicketCategory = 'payment' | 'match' | 'account' | 'other';

export type SupportTicket = {
  id: string;
  subject: string;
  category: TicketCategory;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  lastMessageAt: Date;
  previewBody?: string;
  previewAttachments?: string[];
  attachmentCount?: number;
};

export type TicketViewMode = 'list' | 'create' | 'detail';
