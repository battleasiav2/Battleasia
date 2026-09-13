import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Stack,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';
import { PlayTabs } from 'src/components/play-tabs';
import { Scrollbar } from 'src/components/scrollbar';
import {
  USER_COLORS,
  userFieldSx,
  UserPageShell,
  UserGlassCard,
  UserEmptyState,
  UserActionButton,
  UserAnimatedStat,
  userMutedTextSx,
  userFieldLabelProps,
  goldAlpha,
} from 'src/layouts/user';
import { socketService } from 'src/lib/socket';
import { useTranslate } from 'src/locales/use-locales';
import { useSelector } from 'src/store';
import { getImageUrl } from 'src/utils/get-image-url';

import {
  SupportHero,
  SupportComposer,
  SupportChatHeader,
  SupportPageSkeleton,
  SupportMessageBubble,
} from './components';
import type {
  ChatMessage,
  SupportTicket,
  TicketCategory,
  TicketViewMode,
} from './customer-support-types';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

function ticketStatusColor(status: string) {
  switch (status) {
    case 'closed':
      return alpha('#ffffff', 0.45);
    case 'pending':
      return USER_COLORS.info;
    case 'open':
      return USER_COLORS.success;
    default:
      return GOLD;
  }
}

// ----------------------------------------------------------------------

const CATEGORIES: { value: TicketCategory; label: string; icon: string; desc: string }[] = [
  { value: 'payment', label: 'Payment & Wallet', icon: 'solar:wallet-money-bold-duotone', desc: 'Deposits, withdrawals, balance' },
  { value: 'match', label: 'Match & Fair Play', icon: 'solar:shield-check-bold-duotone', desc: 'Scores, disputes, anti-cheat' },
  { value: 'account', label: 'Account & Security', icon: 'solar:lock-keyhole-minimalistic-bold-duotone', desc: 'Login, 2FA, profile' },
  { value: 'other', label: 'Other', icon: 'solar:headphones-round-sound-bold-duotone', desc: 'General questions' },
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

  const newTicketBtn = (
    <UserActionButton
      size="small"
      actionVariant="solidGold"
      startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
      onClick={() => setViewMode('create')}
      sx={{ py: 0.75, px: 1.5, fontSize: 12 }}
    >
      New ticket
    </UserActionButton>
  );

  const listPanelSx = {
    bgcolor: alpha('#06090e', 0.72),
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${goldAlpha(0.28)}`,
    borderTop: `2px solid ${GOLD}`,
    boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
    clipPath: {
      xs: 'none',
      md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
    },
    overflow: 'hidden',
  } as const;

  if (viewMode === 'list') {
    const statCells = [
      { label: 'Tickets', value: stats.total },
      { label: 'Open', value: stats.open },
      { label: 'Closed', value: stats.closed },
    ];

    return (
      <UserPageShell>
        <SupportHero
          title={t('customerSupport.title') || 'Customer Support'}
          action={<Box sx={{ display: { xs: 'none', md: 'block' } }}>{newTicketBtn}</Box>}
        />

        <Stack sx={{ mb: 2, display: { xs: 'flex', md: 'none' } }}>{newTicketBtn}</Stack>

        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))' },
              width: 1,
              bgcolor: alpha('#06090e', 0.72),
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: `1px solid ${goldAlpha(0.28)}`,
              borderTop: `2px solid ${GOLD}`,
              boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
              clipPath: {
                xs: 'none',
                md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              },
            }}
          >
            {statCells.map((cell, index) => (
              <Box
                key={cell.label}
                sx={{
                  minWidth: 0,
                  px: { xs: 1.25, md: 2.25 },
                  py: { xs: 1.5, md: 2 },
                  borderRight:
                    index < statCells.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: alpha('#ffffff', 0.45),
                    mb: 0.75,
                  }}
                >
                  {cell.label}
                </Typography>
                <Box sx={{ color: USER_COLORS.textPrimary }}>
                  <UserAnimatedStat value={cell.value} variant="h5" fontWeight={700} />
                </Box>
              </Box>
            ))}
          </Box>

          <PlayTabs
            tabs={statusTabs.map((tab) => ({ label: tab.label, value: tab.value }))}
            activeTab={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as 'all' | 'open' | 'closed' | 'pending')
            }
          />

          {loading ? (
            <SupportPageSkeleton />
          ) : tickets.length === 0 ? (
            <UserEmptyState
              icon="solar:ticket-bold-duotone"
              title="No tickets yet"
              description="Create a ticket when you need help with payments, matches, or your account."
              actionLabel="New ticket"
              onAction={() => setViewMode('create')}
            />
          ) : (
            <Box sx={listPanelSx}>
              {tickets.map((ticket, index) => {
                const thumb = ticket.previewAttachments?.[0];
                const isLast = index === tickets.length - 1;
                const meta = [
                  ticket.category,
                  `Updated ${ticket.lastMessageAt.toLocaleString()}`,
                  ticket.attachmentCount ? `${ticket.attachmentCount} image(s)` : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Box
                    key={ticket.id}
                    component="button"
                    type="button"
                    onClick={() => openTicket(ticket)}
                    sx={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 1.25, sm: 1.75 },
                      width: 1,
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1.25, sm: 1.5 },
                      cursor: 'pointer',
                      borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: goldAlpha(0.06),
                        '& .ticket-title': { color: GOLD },
                        '& .ticket-chevron': { color: GOLD, transform: 'translateX(3px)' },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 44, sm: 52 },
                        height: { xs: 44, sm: 52 },
                        flexShrink: 0,
                        bgcolor: '#0a0a0a',
                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                        display: 'grid',
                        placeItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {thumb ? (
                        <Image
                          src={getImageUrl(thumb) || thumb}
                          alt=""
                          sx={{ width: 1, height: 1, objectFit: 'cover' }}
                        />
                      ) : (
                        <Iconify
                          icon="solar:ticket-bold"
                          width={20}
                          sx={{ color: GOLD }}
                        />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography
                          className="ticket-title font-tr"
                          sx={{
                            fontSize: { xs: 13, sm: 15 },
                            fontWeight: 800,
                            color: USER_COLORS.textPrimary,
                            textTransform: 'uppercase',
                            lineHeight: 1.2,
                            transition: 'color 0.2s ease',
                          }}
                          noWrap
                        >
                          {ticket.subject}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                            color: ticketStatusColor(ticket.status),
                          }}
                        >
                          {ticket.status}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: { xs: 11, sm: 12 },
                          color: alpha('#ffffff', 0.5),
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ticket.previewBody || meta}
                      </Typography>
                      {ticket.previewBody ? (
                        <Typography
                          sx={{
                            mt: 0.25,
                            fontSize: 11,
                            color: alpha('#ffffff', 0.4),
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {meta}
                        </Typography>
                      ) : null}
                    </Box>

                    <Iconify
                      className="ticket-chevron"
                      icon="solar:alt-arrow-right-bold"
                      width={16}
                      sx={{
                        flexShrink: 0,
                        color: alpha('#ffffff', 0.35),
                        transition: 'color 0.2s ease, transform 0.2s ease',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Stack>
      </UserPageShell>
    );
  }

  if (viewMode === 'create') {
    return (
      <UserPageShell contentSx={{ maxWidth: 720, mx: 'auto' }}>
        <SupportHero
          title="New ticket"
          action={
            <UserActionButton
              size="small"
              actionVariant="ghost"
              startIcon={<Iconify icon="solar:arrow-left-bold" width={16} />}
              onClick={backToList}
            >
              Back
            </UserActionButton>
          }
        />

        <UserGlassCard sx={{ p: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2.25}>
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  color: alpha('#ffffff', 0.55),
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                Category
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 1,
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = createCategory === cat.value;
                  return (
                    <Box
                      key={cat.value}
                      component="button"
                      type="button"
                      onClick={() => setCreateCategory(cat.value)}
                      sx={{
                        p: 1.25,
                        borderRadius: '10px',
                        bgcolor: isSelected ? goldAlpha(0.1) : alpha('#ffffff', 0.03),
                        border: `1px solid ${isSelected ? goldAlpha(0.55) : alpha('#ffffff', 0.1)}`,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        cursor: 'pointer',
                        color: 'inherit',
                        font: 'inherit',
                        '&:hover': { borderColor: goldAlpha(0.4) },
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: isSelected ? USER_COLORS.gold : alpha('#ffffff', 0.06),
                          color: isSelected ? '#081401' : USER_COLORS.gold,
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={cat.icon} width={18} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 800, color: USER_COLORS.textPrimary }}
                          noWrap
                        >
                          {cat.label}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.5) }} noWrap>
                          {cat.desc}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <TextField
              label="Subject"
              value={createSubject}
              onChange={(e) => setCreateSubject(e.target.value)}
              InputLabelProps={userFieldLabelProps}
              sx={userFieldSx}
              placeholder="Short summary of your issue"
            />

            <TextField
              label="Description"
              value={createBody}
              onChange={(e) => setCreateBody(e.target.value)}
              InputLabelProps={userFieldLabelProps}
              sx={userFieldSx}
              multiline
              minRows={4}
              placeholder="Share match IDs, transaction details, or anything that helps us help you"
            />

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  color: alpha('#ffffff', 0.55),
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                Attachments
              </Typography>

              {createAttachments.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
                  {createAttachments.map((url, idx) => (
                    <Box
                      key={`${url}-${idx}`}
                      sx={{
                        position: 'relative',
                        width: 72,
                        height: 72,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `1px solid ${goldAlpha(0.35)}`,
                      }}
                    >
                      <Image
                        src={getImageUrl(url) || url}
                        alt=""
                        sx={{ width: 1, height: 1, objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCreateAttachments((prev) => prev.filter((_, i) => i !== idx))
                        }
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: 22,
                          height: 22,
                          bgcolor: alpha('#000000', 0.75),
                          color: '#ffffff',
                          '&:hover': { bgcolor: '#ef4444' },
                        }}
                      >
                        <Iconify icon="solar:close-circle-bold" width={14} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}

              <UserActionButton
                fullWidth
                actionVariant="ghost"
                disabled={uploading}
                startIcon={
                  uploading ? (
                    <CircularProgress size={16} sx={{ color: USER_COLORS.gold }} />
                  ) : (
                    <Iconify icon="solar:gallery-add-bold" width={18} />
                  )
                }
                onClick={() => createFileRef.current?.click()}
                sx={{ py: 1.5, borderStyle: 'dashed' }}
              >
                {uploading ? 'Uploading…' : 'Add screenshots'}
              </UserActionButton>

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
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <UserActionButton
                actionVariant="solidGold"
                disabled={creating || uploading}
                onClick={handleCreateTicket}
                startIcon={
                  creating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Iconify icon="solar:plain-bold" width={16} />
                  )
                }
                sx={{ flex: 1 }}
              >
                {creating ? 'Submitting…' : 'Submit ticket'}
              </UserActionButton>
              <UserActionButton actionVariant="ghost" disabled={creating} onClick={backToList}>
                Cancel
              </UserActionButton>
            </Stack>
          </Stack>
        </UserGlassCard>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell contentSx={{ maxWidth: 960, mx: 'auto' }}>
      <SupportHero title={selectedTicket?.subject || 'Support chat'} />

      {detailLoading && messages.length === 0 ? (
        <SupportPageSkeleton />
      ) : (
        <UserGlassCard
          noPadding
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'calc(100vh - 16rem)', md: 'calc(100vh - 14rem)' },
            overflow: 'hidden',
            '&:hover': { transform: 'none', boxShadow: 'none' },
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

          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: alpha('#07080c', 0.85),
            }}
          >
            <Scrollbar sx={{ flex: 1, p: { xs: 1.75, md: 2.25 } }}>
              {messages.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary, mb: 0.5 }}>
                    {t('customerSupport.noMessagesYet') || 'No messages yet'}
                  </Typography>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 13 }}>
                    Send the first message below.
                  </Typography>
                </Box>
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
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 13, color: alpha('#ffffff', 0.6) }}>
                This ticket is closed. Open a new one if you still need help.
              </Typography>
            </Box>
          ) : (
            <SupportComposer
              message={message}
              placeholder={t('customerSupport.typeYourMessage') || 'Type your message…'}
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
