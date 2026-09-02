import { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Box, Grid2 as Grid, Stack, Avatar, Typography, IconButton, CircularProgress, useMediaQuery } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import { CONFIG } from 'src/global-config';
import { socketService } from 'src/lib/socket';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import {
  UserPageShell,
  UserGlassCard,
  UserPageTitle,
  UserEmptyState,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx, goldAlpha } from 'src/layouts/user';

import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';

import { useMessagesScroll } from '../customer-support/hooks/use-messages-scroll';
import { mapApiConversation, mapApiMessage, type DmConversation, type DmMessage } from './messages-types';
import { ConversationList, DmMessageBubble, DmComposer, NewChatDialog, ExternalMessagingPanel } from './components';
import { useMessagingSettings } from './use-messaging-settings';
import { getActiveMessagingProviders } from './messaging-settings-utils';

// ----------------------------------------------------------------------

export function MessagesView({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslate();
  const router = useRouter();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const { user } = useSelector((state) => state.auth);
  const api = useApi();
  const { settings: messagingSettings, loading: messagingLoading } = useMessagingSettings();
  const builtinEnabled = messagingSettings?.builtinEnabled !== false;
  const activeProviders = messagingSettings ? getActiveMessagingProviders(messagingSettings) : [];

  const fileRef = useRef<HTMLInputElement>(null);
  const startUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState<DmConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<DmConversation | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const { messagesEndRef } = useMessagesScroll(messages);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingList(true);
      const response = await api.getConversationsApi({ page: 1, limit: 50 });
      if (response?.data?.status && response.data.data?.results) {
        setConversations(response.data.data.results.map(mapApiConversation));
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, [api]);

  const openConversation = useCallback(
    async (conversation: DmConversation) => {
      setSelectedConversation(conversation);
      setMobileShowThread(true);
      setLoadingThread(true);

      try {
        const response = await api.getDirectMessagesApi(conversation.id, { page: 1, limit: 100 });
        if (response?.data?.status && response.data.data?.results) {
          setMessages(response.data.data.results.map(mapApiMessage));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      } finally {
        setLoadingThread(false);
      }
    },
    [api]
  );

  const startConversationWithUser = useCallback(
    async (participantId: string) => {
      if (!participantId || participantId === user?._id) return;

      const existing = conversations.find((c) => c.participant.id === participantId);
      if (existing) {
        await openConversation(existing);
        return;
      }

      try {
        const response = await api.createConversationApi(participantId);
        const conversationId = response?.data?.data?.id;
        if (!response?.data?.status || !conversationId) return;

        const userResponse = await api.getUserByIdApi(participantId);
        const userData = userResponse?.data?.data;
        const conversation: DmConversation = {
          id: conversationId,
          participant: {
            id: participantId,
            username: userData?.username || 'User',
            avatar: userData?.avatar || '',
          },
          lastMessagePreview: '',
          lastMessageAt: new Date(),
        };

        setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversationId)]);
        await openConversation(conversation);
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    },
    [api, conversations, openConversation, user?._id]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!startUserId || loadingList) return;

    const existing = conversations.find((c) => c.participant.id === startUserId);
    if (existing) {
      void openConversation(existing);
    } else {
      void startConversationWithUser(startUserId);
    }

    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startUserId, loadingList]);

  useEffect(() => {
    if (!selectedConversation?.id) return undefined;

    const conversationId = selectedConversation.id;
    socketService.connect(CONFIG.serverUrl);
    socketService.joinConversation(conversationId);

    const handleNewMessage = (payload: any) => {
      if (payload?.conversationId !== conversationId) return;

      const mapped = mapApiMessage({
        ...payload,
        isMine: payload.senderId === user?._id,
      });

      setMessages((prev) => (prev.some((m) => m.id === mapped.id) ? prev : [...prev, mapped]));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessagePreview: mapped.body || t('messages.attachment'),
                lastMessageAt: mapped.createdAt,
              }
            : c
        )
      );
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.offNewMessage();
    };
  }, [selectedConversation?.id, user?._id, t]);

  const handleSend = async () => {
    if (!selectedConversation || sending) return;
    const body = message.trim();
    if (!body && pendingAttachments.length === 0) return;

    try {
      setSending(true);
      const response = await api.sendDirectMessageApi(selectedConversation.id, {
        body,
        attachments: pendingAttachments,
      });

      if (response?.data?.status && response.data.data) {
        const mapped = mapApiMessage({ ...response.data.data, isMine: true });
        setMessages((prev) => [...prev, mapped]);
        setMessage('');
        setPendingAttachments([]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessagePreview: body || t('messages.attachment'), lastMessageAt: new Date() }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const uploadAttachments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const fileArray = Array.from(files);
      const uploadResponse = await api.uploadFilesApi(fileArray, { folder: 'messages' });
      if (uploadResponse?.data?.status && uploadResponse?.data?.data?.files) {
        const uploadedUrls = uploadResponse.data.data.files.map((file: any) => file.url);
        setPendingAttachments((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Failed to upload attachments:', error);
    } finally {
      setUploading(false);
    }
  };

  const showList = isDesktop || !mobileShowThread;
  const showThread = isDesktop || mobileShowThread;

  if (!messagingLoading && messagingSettings && !builtinEnabled) {
    const externalPanel = (
      <UserGlassCard>
        <ExternalMessagingPanel
          providers={activeProviders}
          title={t('messages.externalOnlyTitle')}
          description={t('messages.externalOnlyDescription')}
          openLabel={t('messages.openInProvider')}
        />
      </UserGlassCard>
    );

    if (embedded) return externalPanel;

    return (
      <UserPageShell contentSx={{ maxWidth: 720, mx: 'auto' }}>
        <UserPageTitle
          badge={t('messages.badgeInbox')}
          title={t('messages.title')}
          subtitle={t('messages.externalOnlySubtitle')}
        />
        {externalPanel}
      </UserPageShell>
    );
  }

  const inbox = (
    <>
      {!embedded ? (
        <UserPageTitle
          badge={t('messages.badgeInbox')}
          title={t('messages.title')}
          subtitle={t('messages.subtitle')}
          action={
            <UserActionButton
              actionVariant="gold"
              size="small"
              startIcon={<Iconify icon="solar:pen-new-square-bold" width={16} />}
              onClick={() => setNewChatOpen(true)}
            >
              {t('messages.newChat')}
            </UserActionButton>
          }
        />
      ) : (
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
          <UserActionButton
            actionVariant="gold"
            size="small"
            startIcon={<Iconify icon="solar:pen-new-square-bold" width={16} />}
            onClick={() => setNewChatOpen(true)}
          >
            {t('messages.newChat')}
          </UserActionButton>
        </Stack>
      )}

      <Grid container spacing={2} sx={{ minHeight: { md: embedded ? 480 : 560 } }}>
        {showList ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <UserGlassCard noPadding sx={{ height: 1, minHeight: { xs: 320, md: 560 }, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${USER_COLORS.border}` }}>
                <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary, textTransform: 'uppercase', fontSize: 13 }}>
                  {t('messages.conversations')}
                </Typography>
              </Box>

              {conversations.length === 0 && !loadingList ? (
                <UserEmptyState
                  icon="solar:chat-round-dots-bold-duotone"
                  title={t('messages.noConversations')}
                  description={t('messages.noConversationsDescription')}
                  actionLabel={t('messages.newChat')}
                  onAction={() => setNewChatOpen(true)}
                  sx={{ flex: 1, border: 'none', bgcolor: 'transparent' }}
                />
              ) : (
                <Scrollbar sx={{ flex: 1 }}>
                  <ConversationList
                    conversations={conversations}
                    loading={loadingList}
                    selectedId={selectedConversation?.id || null}
                    onSelect={openConversation}
                  />
                </Scrollbar>
              )}
            </UserGlassCard>
          </Grid>
        ) : null}

        {showThread ? (
          <Grid size={{ xs: 12, md: 8 }}>
            <UserGlassCard noPadding sx={{ height: 1, minHeight: { xs: 420, md: 560 }, display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{ p: 2, borderBottom: `1px solid ${USER_COLORS.border}` }}
                  >
                    {!isDesktop ? (
                      <IconButton
                        onClick={() => setMobileShowThread(false)}
                        sx={{ color: USER_COLORS.textMuted, mr: 0.5 }}
                      >
                        <Iconify icon="eva:arrow-ios-back-fill" width={20} />
                      </IconButton>
                    ) : null}
                    <Avatar
                      src={getImageUrl(selectedConversation.participant.avatar)}
                      alt={selectedConversation.participant.username}
                      sx={{ width: 40, height: 40, border: `1px solid ${goldAlpha(0.3)}` }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary }}>
                        {selectedConversation.participant.username}
                      </Typography>
                      <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>{t('messages.directMessage')}</Typography>
                    </Box>
                    <IconButton
                      onClick={() => router.push(paths.profile(selectedConversation.participant.id))}
                      sx={{ color: USER_COLORS.gold }}
                    >
                      <Iconify icon="solar:user-bold" width={20} />
                    </IconButton>
                  </Stack>

                  <Scrollbar sx={{ flex: 1, px: 2, py: 2 }}>
                    {loadingThread ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress size={28} sx={{ color: USER_COLORS.gold }} />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Typography sx={{ ...userMutedTextSx, textAlign: 'center', py: 6 }}>
                        {t('messages.noMessagesYet')}
                      </Typography>
                    ) : (
                      <>
                        {messages.map((item) => (
                          <DmMessageBubble key={item.id} message={item} youLabel={t('messages.you')} />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </Scrollbar>

                  <DmComposer
                    message={message}
                    placeholder={t('messages.typeMessage')}
                    sending={sending}
                    uploading={uploading}
                    pendingAttachments={pendingAttachments}
                    fileInputRef={fileRef}
                    onChangeMessage={(e) => setMessage(e.target.value)}
                    onSendMessage={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    onAttach={() => fileRef.current?.click()}
                    onFileChange={(e) => void uploadAttachments(e.target.files)}
                    onRemoveAttachment={(index) =>
                      setPendingAttachments((prev) => prev.filter((_, idx) => idx !== index))
                    }
                    onSendClick={() => void handleSend()}
                  />
                </>
              ) : (
                <UserEmptyState
                  icon="solar:chat-line-bold-duotone"
                  title={t('messages.selectConversation')}
                  description={t('messages.selectConversationDescription')}
                  sx={{ flex: 1, border: 'none', bgcolor: 'transparent', minHeight: 360 }}
                />
              )}
            </UserGlassCard>
          </Grid>
        ) : null}
      </Grid>

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectUser={(userId) => void startConversationWithUser(userId)}
      />
    </>
  );

  if (embedded) return inbox;

  return <UserPageShell contentSx={{ maxWidth: 1100, mx: 'auto' }}>{inbox}</UserPageShell>;
}
