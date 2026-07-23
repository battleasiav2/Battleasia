import { useRef, useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';

import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserEmptyState,
  UserStatTile,
  UserAnimatedStat,
} from 'src/layouts/user';

import { Scrollbar } from 'src/components/scrollbar';

import { useMessagesScroll } from './hooks/use-messages-scroll';
import useApi from 'src/hooks/use-api';
import { CONFIG } from 'src/global-config';
import { toast } from 'react-hot-toast';
import { socketService } from 'src/lib/socket';

import type { ChatMessage } from './customer-support-types';
import {
  SupportHero,
  SupportChatHeader,
  SupportMessageBubble,
  SupportComposer,
  SupportPageSkeleton,
} from './components';

// ----------------------------------------------------------------------

export function CustomerSupportView() {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const api = useApi();

  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  const { messagesEndRef } = useMessagesScroll(messages);

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      const conversationResponse = await api.getOrCreateConversationApi();
      if (conversationResponse?.data?.status && conversationResponse?.data?.data) {
        const convId = conversationResponse.data.data.id;
        setConversationId(convId);

        const messagesResponse = await api.getMessagesApi(convId, { limit: 50 });
        if (messagesResponse?.data?.status && messagesResponse?.data?.data?.results) {
          const loadedMessages = messagesResponse.data.data.results.map((msg: any) => ({
            id: msg.id,
            body: msg.body,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            createdAt: new Date(msg.createdAt),
            isAdmin: msg.isAdmin,
            attachments: msg.attachments || [],
          }));
          setMessages(loadedMessages);
        }
      }
    } catch {
      toast.error(t('customerSupport.failedToLoadConversation'));
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    const serverUrl = CONFIG.serverUrl || '';

    if (!serverUrl || !conversationId) {
      return undefined;
    }

    socketService.connect(serverUrl);
    socketService.offNewMessage();
    socketService.offUserTyping();

    const handleNewMessage = (newMessage: any) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [
          ...prev,
          {
            id: newMessage.id,
            body: newMessage.body,
            senderId: newMessage.senderId,
            senderName: newMessage.senderName,
            senderAvatar: newMessage.senderAvatar,
            createdAt: new Date(newMessage.createdAt),
            isAdmin: newMessage.isAdmin,
            attachments: newMessage.attachments || [],
          },
        ];
      });
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(() => {
      // Handle typing indicator if needed
    });

    socketService.joinConversation(conversationId);

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.offNewMessage();
      socketService.offUserTyping();
    };
  }, [conversationId]);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' || !message.trim() || sending || !conversationId) return;

      const messageBody = message.trim();
      setMessage('');
      setSending(true);

      try {
        const response = await api.sendMessageApi({
          body: messageBody,
          conversationId,
          attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
        });

        if (pendingAttachments.length > 0) {
          setPendingAttachments([]);
        }

        if (response?.data?.status && response?.data?.data) {
          // Message will be added via socket event
        } else {
          setMessage(messageBody);
        }
      } catch {
        setMessage(messageBody);
      } finally {
        setSending(false);
      }
    },
    [message, sending, conversationId, api, pendingAttachments]
  );

  const handleSendClick = useCallback(() => {
    if (message.trim() && !sending && conversationId) {
      const event = { key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>;
      handleSendMessage(event);
    }
  }, [message, sending, conversationId, handleSendMessage]);

  const handleAttach = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        setUploading(true);
        const fileArray = Array.from(files);

        const uploadResponse = await api.uploadFilesApi(fileArray, { folder: 'support' });

        if (uploadResponse?.data?.status && uploadResponse?.data?.data?.files) {
          const uploadedUrls = uploadResponse.data.data.files.map((file: any) => file.url);
          setPendingAttachments((prev) => [...prev, ...uploadedUrls]);
          toast.success(t('customerSupport.filesUploadedSuccess', { count: fileArray.length }));
        } else {
          toast.error(t('customerSupport.failedToUploadFiles'));
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('customerSupport.failedToUploadFiles'));
      } finally {
        setUploading(false);
        if (fileRef.current) {
          fileRef.current.value = '';
        }
      }
    },
    [api, t]
  );

  const handleRemoveAttachment = useCallback((index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const showInitialSkeleton = loading && messages.length === 0;

  return (
    <UserPageShell contentSx={{ maxWidth: 960, mx: 'auto' }}>
      <SupportHero title={t('customerSupport.title') || 'Customer Support'} />

      <UserPageTitle
        badge="Live Support"
        title={t('customerSupport.title') || 'Customer Support'}
        subtitle="Chat with our support team for help with matches, account, and payments"
      />

      {showInitialSkeleton ? (
        <SupportPageSkeleton />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
              mb: 3,
            }}
          >
            <UserStatTile
              label="Messages"
              value={<UserAnimatedStat value={messages.length} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile label="Status" value="Online" suffix="support" />
            <UserStatTile
              label="Attachments"
              value={pendingAttachments.length}
              suffix="pending"
            />
          </Box>

          <UserGlassCard
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'calc(100vh - 22rem)', md: 'calc(100vh - 20rem)' },
              overflow: 'hidden',
              p: 0,
            }}
          >
            <SupportChatHeader
              onlineLabel={t('customerSupport.online')}
              loading={loading}
              onRefresh={loadConversation}
            />

            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Scrollbar sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                {messages.length === 0 ? (
                  <UserEmptyState
                    icon="solar:chat-round-dots-bold-duotone"
                    title={t('customerSupport.noMessagesYet')}
                    description="Send a message to connect with the support team."
                    sx={{ py: 6, border: 'none', bgcolor: 'transparent' }}
                  />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <SupportMessageBubble
                        key={msg.id}
                        message={msg}
                        youLabel={t('customerSupport.you')}
                        userAvatar={user?.avatar}
                        userInitial={user?.username?.charAt(0) || 'U'}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Scrollbar>
            </Box>

            <SupportComposer
              message={message}
              placeholder={t('customerSupport.typeYourMessage')}
              sending={sending}
              uploading={uploading}
              disabled={!conversationId}
              pendingAttachments={pendingAttachments}
              fileInputRef={fileRef}
              onChangeMessage={handleChangeMessage}
              onSendMessage={handleSendMessage}
              onAttach={handleAttach}
              onFileChange={handleFileChange}
              onRemoveAttachment={handleRemoveAttachment}
              onSendClick={handleSendClick}
            />
          </UserGlassCard>
        </>
      )}
    </UserPageShell>
  );
}
