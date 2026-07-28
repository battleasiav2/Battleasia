export type DmParticipant = {
  id: string;
  username: string;
  avatar: string;
};

export type DmConversation = {
  id: string;
  participant: DmParticipant;
  lastMessagePreview: string;
  lastMessageAt: string | Date;
};

export type DmMessage = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  attachments: string[];
  createdAt: string | Date;
  isMine: boolean;
};

export const mapApiConversation = (item: any): DmConversation => ({
  id: item.id,
  participant: {
    id: item.participant?.id || '',
    username: item.participant?.username || 'User',
    avatar: item.participant?.avatar || '',
  },
  lastMessagePreview: item.lastMessagePreview || '',
  lastMessageAt: item.lastMessageAt ? new Date(item.lastMessageAt) : new Date(),
});

export const mapApiMessage = (item: any): DmMessage => ({
  id: item.id,
  body: item.body || '',
  senderId: item.senderId || '',
  senderName: item.senderName || '',
  senderAvatar: item.senderAvatar || '',
  attachments: item.attachments || [],
  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
  isMine: !!item.isMine,
});
