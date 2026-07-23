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
