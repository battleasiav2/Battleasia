import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

import {
  Box,
  Chip,
  Stack,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserGlassCard,
  UserEmptyState,
  UserStatTile,
  UserAnimatedStat,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  userFieldSx,
  userFieldLabelProps,
  userSelectMenuProps,
  getUserChipSx,
} from 'src/layouts/user';

import { Scrollbar } from 'src/components/scrollbar';
import { PlayTabs } from 'src/components/play-tabs';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';
import { getImageUrl } from 'src/utils/get-image-url';

import { useMessagesScroll } from './hooks/use-messages-scroll';
import useApi from 'src/hooks/use-api';
import { CONFIG } from 'src/global-config';
import { socketService } from 'src/lib/socket';

import type { ChatMessage, SupportTicket, TicketCategory, TicketViewMode } from './customer-support-types';
import {
  SupportHero,
  SupportChatHeader,
  SupportMessageBubble,
  SupportComposer,
  SupportPageSkeleton,
} from './components';

// ----------------------------------------------------------------------

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'payment', label: 'Payment' },
  { value: 'match', label: 'Match' },
  { value: 'account', label: 'Account' },
  { value: 'other', label: 'Other' },
];

function mapTicket(raw: any): SupportTicket {
  return {
    id: raw.id || raw._id,
    subject: raw.subject || 'Support Ticket',
    category: (raw.category || 'other') as TicketCategory,
    status: raw.status || 'open',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    lastMessageAt: raw.lastMessageAt ? new Date(raw.lastMessageAt) : new Date(),
    previewBody: raw.previewBody || '',
    previewAttachments: raw.previewAttachments || [],
    attachmentCount: raw.attachmentCount || 0,
  };
}

function statusChipSx(status: string) {
  if (status === 'closed') return getUserChipSx('neutral');
  if (status === 'pending') return getUserChipSx('info');
  return getUserChipSx('success');
}

// ----------------------------------------------------------------------

export function CustomerSupportView() {
  const { t } = useTranslate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const api = useApi();

  const fileRef = useRef<HTMLInputElement>(null);
  const createFileRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<TicketViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'pending'>('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  const [createSubject, setCreateSubject] = useState('');
  const [createCategory, setCreateCategory] = useState<TicketCategory>('other');
  const [createBody, setCreateBody] = useState('');
  const [createAttachments, setCreateAttachments] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const { messagesEndRef } = useMessagesScroll(messages);

  const statusTabs = useMemo(
    () => [
      { value: 'all' as const, label: 'All' },
      { value: 'open' as const, label: 'Open' },
      { value: 'pending' as const, label: 'Pending' },
      { value: 'closed' as const, label: 'Closed' },
    ],
    []
  );

  const stats = useMemo(() => {
    const open = tickets.filter((tkt) => tkt.status === 'open' || tkt.status === 'pending').length;
    const closed = tickets.filter((tkt) => tkt.status === 'closed').length;
    return { total: tickets.length, open, closed };
  }, [tickets]);

  const loadTickets = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      setTickets([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.getMyTicketsApi({
        limit: 50,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (response?.data?.status && Array.isArray(response?.data?.data?.results)) {
        setTickets(response.data.data.results.map(mapTicket));
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status;
      if (status !== 401) {
        toast.error(t('customerSupport.failedToLoadConversation') || 'Failed to load tickets');
      }
    } finally {
      setLoading(false);
    }
  }, [api, isLoggedIn, statusFilter, t]);

  useEffect(() => {
    if (viewMode === 'list') {
      loadTickets();
    }
  }, [loadTickets, viewMode]);

  const loadTicketMessages = useCallback(
    async (ticketId: string) => {
      try {
        setDetailLoading(true);
        const messagesResponse = await api.getMessagesApi(ticketId, { limit: 100 });
        if (messagesResponse?.data?.status && messagesResponse?.data?.data?.results) {
          setMessages(
            messagesResponse.data.data.results.map((msg: any) => ({
              id: msg.id,
              body: msg.body,
              senderId: msg.senderId,
              senderName: msg.senderName,
              senderAvatar: msg.senderAvatar,
              createdAt: new Date(msg.createdAt),
              isAdmin: msg.isAdmin,
              attachments: msg.attachments || [],
            }))
          );
        } else {
          setMessages([]);
        }
      } catch {
        toast.error(t('customerSupport.failedToLoadConversation') || 'Failed to load messages');
      } finally {
        setDetailLoading(false);
      }
    },
    [api, t]
  );

  const openTicket = useCallback(
    async (ticket: SupportTicket) => {
      setSelectedTicket(ticket);
      setViewMode('detail');
      setMessage('');
      setPendingAttachments([]);
      await loadTicketMessages(ticket.id);
    },
    [loadTicketMessages]
  );

  // Realtime replies while ticket detail is open
  useEffect(() => {
    const serverUrl = CONFIG.serverUrl || '';
    const conversationId = selectedTicket?.id;
    if (viewMode !== 'detail' || !serverUrl || !conversationId) return undefined;

    socketService.connect(serverUrl);
    socketService.offNewMessage();

    const handleNewMessage = (newMessage: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
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

      if (newMessage.isAdmin) {
        toast.success('Support replied to your ticket', { id: `ticket-reply-${newMessage.id}` });
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.joinConversation(conversationId);

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.offNewMessage();
    };
  }, [viewMode, selectedTicket?.id]);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' || !message.trim() || sending || !selectedTicket) return;
      if (selectedTicket.status === 'closed') {
        toast.error('This ticket is closed');
        return;
      }

      const messageBody = message.trim();
      setMessage('');
      setSending(true);

      try {
        const response = await api.sendMessageApi({
          body: messageBody,
          conversationId: selectedTicket.id,
          attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
        });
        if (pendingAttachments.length > 0) setPendingAttachments([]);
        if (response?.data?.status && response?.data?.data) {
          const msg = response.data.data;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [
              ...prev,
              {
                id: msg.id,
                body: msg.body,
                senderId: msg.senderId,
                senderName: msg.senderName || user?.username || 'You',
                senderAvatar: msg.senderAvatar,
                createdAt: new Date(msg.createdAt || Date.now()),
                isAdmin: Boolean(msg.isAdmin),
                attachments: msg.attachments || [],
              },
            ];
          });
        }
      } catch {
        setMessage(messageBody);
        toast.error('Failed to send message');
      } finally {
        setSending(false);
      }
    },
    [message, sending, selectedTicket, api, pendingAttachments, user?.username]
  );

  const handleSendClick = useCallback(() => {
    if (message.trim() && !sending && selectedTicket) {
      const event = { key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>;
      handleSendMessage(event);
    }
  }, [message, sending, selectedTicket, handleSendMessage]);

  const uploadAttachments = useCallback(
    async (files: FileList | null, target: 'detail' | 'create') => {
      if (!files || files.length === 0) return;
      try {
        setUploading(true);
        const fileArray = Array.from(files);
        const uploadResponse = await api.uploadFilesApi(fileArray, { folder: 'support' });
        if (uploadResponse?.data?.status && uploadResponse?.data?.data?.files) {
          const uploadedUrls = uploadResponse.data.data.files.map((file: any) => file.url);
          if (target === 'detail') {
            setPendingAttachments((prev) => [...prev, ...uploadedUrls]);
          } else {
            setCreateAttachments((prev) => [...prev, ...uploadedUrls]);
          }
          toast.success(t('customerSupport.filesUploadedSuccess', { count: fileArray.length }) || 'Uploaded');
        } else {
          toast.error(t('customerSupport.failedToUploadFiles') || 'Upload failed');
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('customerSupport.failedToUploadFiles') || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [api, t]
  );

  const handleCloseTicket = useCallback(async () => {
    if (!selectedTicket || selectedTicket.status === 'closed') return;
    try {
      setClosing(true);
      const res = await api.closeConversationApi(selectedTicket.id);
      if (res?.data?.status) {
        toast.success('Ticket closed');
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'closed' } : prev));
        setTickets((prev) =>
          prev.map((tkt) => (tkt.id === selectedTicket.id ? { ...tkt, status: 'closed' } : tkt))
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to close ticket');
    } finally {
      setClosing(false);
    }
  }, [api, selectedTicket]);

  const handleCreateTicket = useCallback(async () => {
    const subject = createSubject.trim();
    const body = createBody.trim();
    if (!subject) {
      toast.error('Subject is required');
      return;
    }
    if (!body && createAttachments.length === 0) {
      toast.error('Please describe your issue or attach an image');
      return;
    }

    try {
      setCreating(true);
      const res = await api.createTicketApi({
        subject,
        category: createCategory,
        body: body || subject,
        attachments: createAttachments,
      });
      if (res?.data?.status && res?.data?.data) {
        toast.success('Ticket created');
        const ticket = mapTicket(res.data.data);
        setCreateSubject('');
        setCreateCategory('other');
        setCreateBody('');
        setCreateAttachments([]);
        await openTicket(ticket);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  }, [api, createSubject, createCategory, createBody, createAttachments, openTicket]);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedTicket(null);
    setMessages([]);
    setPendingAttachments([]);
    setMessage('');
  }, []);

  // ------------------------------------------------------------------ list
  if (viewMode === 'list') {
    return (
      <UserPageShell contentSx={{ maxWidth: 960, mx: 'auto' }}>
        <SupportHero
          title={t('customerSupport.title') || 'Customer Support'}
          subtitle={t('customerSupport.subtitle') || 'Create a ticket and our team will help you.'}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <UserStatTile
            label="My Tickets"
            value={<UserAnimatedStat value={stats.total} variant="h5" fontWeight={700} />}
            loading={loading}
          />
          <UserStatTile
            label="Open"
            value={<UserAnimatedStat value={stats.open} variant="h5" fontWeight={700} />}
            loading={loading}
          />
          <UserStatTile
            label="Closed"
            value={<UserAnimatedStat value={stats.closed} variant="h5" fontWeight={700} />}
            loading={loading}
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <PlayTabs
              tabs={statusTabs.map((tab) => ({ label: tab.label, value: tab.value }))}
              activeTab={statusFilter}
              onChange={(value) => setStatusFilter(value as typeof statusFilter)}
            />
          </Box>
          <UserActionButton
            actionVariant="gold"
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            onClick={() => setViewMode('create')}
          >
            Create Ticket
          </UserActionButton>
        </Stack>

        {loading ? (
          <SupportPageSkeleton />
        ) : tickets.length === 0 ? (
          <UserEmptyState
            icon="solar:ticket-bold-duotone"
            title="No tickets yet"
            description="Create a support ticket when you need help with payment, matches, or account issues."
            actionLabel="Create Ticket"
            onAction={() => setViewMode('create')}
          />
        ) : (
          <Stack spacing={1.5}>
            {tickets.map((ticket) => {
              const thumb = ticket.previewAttachments?.[0];
              return (
                <UserGlassCard
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  sx={{
                    p: { xs: 1.75, md: 2.25 },
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    transition: 'border-color 0.2s, transform 0.2s',
                    '&:hover': {
                      borderColor: alpha(USER_COLORS.gold, 0.4),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      bgcolor: alpha('#000', 0.45),
                      border: `1px solid ${USER_COLORS.border}`,
                      display: 'grid',
                      placeItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {thumb ? (
                      <Image
                        src={getImageUrl(thumb) || thumb}
                        alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Iconify icon="solar:ticket-bold" width={26} sx={{ color: USER_COLORS.gold }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary, fontSize: 15 }} noWrap>
                        {ticket.subject}
                      </Typography>
                      <Chip label={ticket.category} size="small" sx={{ height: 20, fontSize: 10, ...getUserChipSx('gold') }} />
                      <Chip label={ticket.status} size="small" sx={{ height: 20, fontSize: 10, ...statusChipSx(ticket.status) }} />
                    </Stack>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 13 }} noWrap>
                      {ticket.previewBody || 'No messages yet'}
                    </Typography>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 11, mt: 0.5 }}>
                      Updated {ticket.lastMessageAt.toLocaleString()}
                      {ticket.attachmentCount ? ` · ${ticket.attachmentCount} image(s)` : ''}
                    </Typography>
                  </Box>

                  <Iconify icon="solar:alt-arrow-right-bold" width={18} sx={{ color: USER_COLORS.gold, flexShrink: 0 }} />
                </UserGlassCard>
              );
            })}
          </Stack>
        )}
      </UserPageShell>
    );
  }

  // ------------------------------------------------------------------ create
  if (viewMode === 'create') {
    return (
      <UserPageShell contentSx={{ maxWidth: 720, mx: 'auto' }}>
        <SupportHero title="Create Ticket" subtitle="Tell us what went wrong — include screenshots if you can." />

        <UserGlassCard sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.25}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={backToList} sx={{ color: USER_COLORS.gold }}>
                <Iconify icon="solar:arrow-left-bold" />
              </IconButton>
              <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary }}>New support ticket</Typography>
            </Stack>

            <TextField
              label="Subject"
              value={createSubject}
              onChange={(e) => setCreateSubject(e.target.value)}
              InputLabelProps={userFieldLabelProps}
              sx={userFieldSx}
              placeholder="e.g. Withdrawal pending"
            />

            <TextField
              select
              label="Category"
              value={createCategory}
              onChange={(e) => setCreateCategory(e.target.value as TicketCategory)}
              InputLabelProps={userFieldLabelProps}
              SelectProps={{ MenuProps: userSelectMenuProps }}
              sx={userFieldSx}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Describe your issue"
              value={createBody}
              onChange={(e) => setCreateBody(e.target.value)}
              InputLabelProps={userFieldLabelProps}
              sx={userFieldSx}
              multiline
              minRows={4}
              placeholder="Write details so we can help faster…"
            />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {createAttachments.map((url, idx) => (
                <Box key={`${url}-${idx}`} sx={{ position: 'relative', width: 72, height: 72 }}>
                  <Image
                    src={getImageUrl(url) || url}
                    alt=""
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', border: `1px solid ${USER_COLORS.border}` }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setCreateAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 22,
                      height: 22,
                      bgcolor: alpha('#000', 0.7),
                      color: '#fff',
                    }}
                  >
                    <Iconify icon="solar:close-circle-bold" width={14} />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <input
              ref={createFileRef}
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                uploadAttachments(e.target.files, 'create');
                e.target.value = '';
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button
                onClick={() => createFileRef.current?.click()}
                disabled={uploading}
                startIcon={<Iconify icon="solar:gallery-add-bold" />}
                sx={{
                  color: USER_COLORS.gold,
                  border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                  borderRadius: 0,
                  fontWeight: 700,
                }}
              >
                {uploading ? 'Uploading…' : 'Add images'}
              </Button>
              <UserActionButton
                actionVariant="gold"
                onClick={handleCreateTicket}
                disabled={creating || uploading}
                startIcon={<Iconify icon="solar:ticket-bold" width={18} />}
              >
                {creating ? 'Creating…' : 'Submit Ticket'}
              </UserActionButton>
            </Stack>
          </Stack>
        </UserGlassCard>
      </UserPageShell>
    );
  }

  // ------------------------------------------------------------------ detail
  return (
    <UserPageShell contentSx={{ maxWidth: 960, mx: 'auto' }}>
      <SupportHero
        title={selectedTicket?.subject || 'Ticket'}
        subtitle="Chat with support — replies appear here in real time."
      />

      {detailLoading && messages.length === 0 ? (
        <SupportPageSkeleton />
      ) : (
        <UserGlassCard
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'calc(100vh - 18rem)', md: 'calc(100vh - 16rem)' },
            overflow: 'hidden',
            p: 0,
          }}
        >
          <SupportChatHeader
            onlineLabel={t('customerSupport.online') || 'Online'}
            loading={detailLoading}
            onRefresh={() => selectedTicket && loadTicketMessages(selectedTicket.id)}
            title={selectedTicket?.subject}
            category={selectedTicket?.category}
            status={selectedTicket?.status}
            onBack={backToList}
            onCloseTicket={handleCloseTicket}
            closing={closing}
          />

          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Scrollbar sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
              {messages.length === 0 ? (
                <UserEmptyState
                  icon="solar:chat-round-dots-bold-duotone"
                  title={t('customerSupport.noMessagesYet') || 'No messages yet'}
                  description="Send a message to continue this ticket."
                  sx={{ py: 6, border: 'none', bgcolor: 'transparent' }}
                />
              ) : (
                <>
                  {messages.map((msg) => (
                    <SupportMessageBubble
                      key={msg.id}
                      message={msg}
                      youLabel={t('customerSupport.you') || 'You'}
                      userAvatar={user?.avatar}
                      userInitial={user?.username?.charAt(0) || 'U'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Scrollbar>
          </Box>

          {selectedTicket?.status === 'closed' ? (
            <Box sx={{ p: 2, borderTop: `1px solid ${USER_COLORS.border}` }}>
              <Typography sx={{ ...userMutedTextSx, fontSize: 13, textAlign: 'center' }}>
                This ticket is closed. Create a new ticket if you still need help.
              </Typography>
            </Box>
          ) : (
            <SupportComposer
              message={message}
              placeholder={t('customerSupport.typeYourMessage') || 'Type a message…'}
              sending={sending}
              uploading={uploading}
              disabled={!selectedTicket}
              pendingAttachments={pendingAttachments}
              fileInputRef={fileRef}
              onChangeMessage={handleChangeMessage}
              onSendMessage={handleSendMessage}
              onAttach={() => fileRef.current?.click()}
              onFileChange={(e) => {
                uploadAttachments(e.target.files, 'detail');
                e.target.value = '';
              }}
              onRemoveAttachment={(index) =>
                setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
              }
              onSendClick={handleSendClick}
            />
          )}
        </UserGlassCard>
      )}
    </UserPageShell>
  );
}
