import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Chip,
  Stack,
  TextField,
  ButtonBase,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';
import { Scrollbar } from 'src/components/scrollbar';
import {
  USER_COLORS,
  userFieldSx,
  getUserChipSx,
  UserPageShell,
  userMutedTextSx,
  userFieldLabelProps,
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

const CATEGORIES: { value: TicketCategory; label: string; icon: string; desc: string }[] = [
  { value: 'payment', label: 'Payment & BAC Wallet', icon: 'solar:wallet-money-bold-duotone', desc: 'Deposits, withdrawals, balance disputes' },
  { value: 'match', label: 'Match & Anti-Cheat', icon: 'solar:shield-check-bold-duotone', desc: 'Score disputes, referee review, anti-cheat' },
  { value: 'account', label: 'Account & Security', icon: 'solar:lock-keyhole-minimalistic-bold-duotone', desc: '2FA reset, credentials, device link' },
  { value: 'other', label: 'VIP / Other Comms', icon: 'solar:headphones-round-sound-bold-duotone', desc: 'General queries, tournaments, partnerships' },
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

const pulseDot = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
`;



// ----------------------------------------------------------------------

export function CustomerSupportView() {
  const theme = useTheme();
  const { t } = useTranslate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const api = useApi();

  const themeAccent = theme.palette.primary.main || USER_COLORS.gold;
  const accentContrast = theme.palette.primary.contrastText || '#081401';

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
      { value: 'all' as const, label: 'All Transmissions' },
      { value: 'open' as const, label: 'Active / Open' },
      { value: 'pending' as const, label: 'Under Review' },
      { value: 'closed' as const, label: 'Resolved' },
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

  // ------------------------------------------------------------------ LIST VIEW
  if (viewMode === 'list') {
    return (
      <UserPageShell contentSx={{ maxWidth: 1120, mx: 'auto' }}>
        {/* Top Hero Command Terminal */}
        <SupportHero
          title={t('customerSupport.title') || 'COMMAND SUPPORT'}
          subtitle={t('customerSupport.subtitle') || 'Direct satellite relay and rapid incident dispatch for BattleAsia operatives.'}
        />

        {/* 3D Tactical Stat HUD */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Stat 1: Total */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#0a0c10',
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: alpha('#ffffff', 0.45), mb: 0.5 }}>
              TOTAL DISPATCHES
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#ffffff', fontFamily: `'Barlow', sans-serif` }}>
              {stats.total}
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: alpha('#ffffff', 0.4), mt: 0.3 }}>
              Lifetime tickets logged
            </Typography>
          </Box>

          {/* Stat 2: Active */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#0a0c10',
              border: `1px solid ${alpha('#22c55e', 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mb: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', animation: `${pulseDot} 1.5s infinite` }} />
              <Typography sx={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#22c55e' }}>
                ACTIVE COMMS
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#22c55e', fontFamily: `'Barlow', sans-serif` }}>
              {stats.open}
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: alpha('#ffffff', 0.4), mt: 0.3 }}>
              Open / In arbitration
            </Typography>
          </Box>

          {/* Stat 3: Resolved */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#0a0c10',
              border: `1px solid ${alpha(themeAccent, 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: themeAccent, mb: 0.5 }}>
              RESOLVED CASES
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: themeAccent, fontFamily: `'Barlow', sans-serif` }}>
              {stats.closed}
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: alpha('#ffffff', 0.4), mt: 0.3 }}>
              Successfully closed
            </Typography>
          </Box>

          {/* Stat 4: Average SLA */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#0a0c10',
              border: `1px solid ${alpha('#3b82f6', 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#3b82f6', mb: 0.5 }}>
              RESPONSE TIME
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#3b82f6', fontFamily: `'Barlow', sans-serif` }}>
              &lt; 5 MINS
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: alpha('#ffffff', 0.4), mt: 0.3 }}>
              Live dispatch SLA
            </Typography>
          </Box>
        </Box>

        {/* Tactical Status Filter Tabs & Deploy Button */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 2.5 }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          {/* Chamfered Filter Tabs */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;

              return (
                <ButtonBase
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: 0.85,
                    clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                    bgcolor: isActive ? themeAccent : alpha('#141720', 0.85),
                    color: isActive ? accentContrast : alpha('#ffffff', 0.65),
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    border: isActive ? 'none' : `1px solid ${alpha('#ffffff', 0.12)}`,
                    boxShadow: isActive ? `0 0 16px ${alpha(themeAccent, 0.45)}` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isActive ? themeAccent : alpha('#202430', 0.95),
                      color: isActive ? accentContrast : '#ffffff',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {tab.label}
                </ButtonBase>
              );
            })}
          </Box>

          {/* Chamfered "Deploy Ticket" Button */}
          <ButtonBase
            onClick={() => setViewMode('create')}
            sx={{
              px: 3,
              py: 1.1,
              clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
              bgcolor: themeAccent,
              color: accentContrast,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              boxShadow: `0 6px 20px ${alpha(themeAccent, 0.45)}`,
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 10px 28px ${alpha(themeAccent, 0.65)}`,
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:ticket-bold" width={16} />
              <span>Deploy New Ticket</span>
            </Stack>
          </ButtonBase>
        </Stack>

        {/* Tickets List or Empty State */}
        {loading ? (
          <SupportPageSkeleton />
        ) : tickets.length === 0 ? (
          <Box
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: '16px',
              bgcolor: '#090b0e',
              border: `1px dashed ${alpha(themeAccent, 0.3)}`,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: alpha(themeAccent, 0.12),
                border: `1.5px solid ${themeAccent}`,
                color: themeAccent,
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 0 20px ${alpha(themeAccent, 0.35)}`,
              }}
            >
              <Iconify icon="solar:ticket-bold-duotone" width={32} />
            </Box>

            <Typography
              sx={{
                fontFamily: `'Barlow', sans-serif`,
                fontSize: 20,
                fontWeight: 800,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              No Transmissions Found
            </Typography>
            <Typography sx={{ fontSize: 13, color: alpha('#ffffff', 0.6), maxWidth: 440, mx: 'auto', mb: 3 }}>
              You currently have no active or historical support tickets. Transmit a new dispatch whenever you need assistance.
            </Typography>

            <ButtonBase
              onClick={() => setViewMode('create')}
              sx={{
                px: 3,
                py: 1.1,
                clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                bgcolor: themeAccent,
                color: accentContrast,
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 0 20px ${alpha(themeAccent, 0.5)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Iconify icon="solar:add-circle-bold" width={16} />
                <span>Create First Ticket</span>
              </Stack>
            </ButtonBase>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {tickets.map((ticket) => {
              const thumb = ticket.previewAttachments?.[0];
              const isClosed = ticket.status === 'closed';
              const isPending = ticket.status === 'pending';

              return (
                <Box
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  sx={{
                    p: { xs: 2, md: 2.4 },
                    borderRadius: '12px',
                    bgcolor: '#0a0c10',
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.005)',
                      borderColor: themeAccent,
                      boxShadow: `0 8px 24px -4px ${alpha(themeAccent, 0.3)}`,
                      '& .ticket-arrow': {
                        transform: 'translateX(4px)',
                        color: themeAccent,
                      },
                    },
                  }}
                >
                  {/* Left Thumbnail or Icon */}
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: '8px',
                      flexShrink: 0,
                      bgcolor: alpha('#000000', 0.6),
                      border: `1px solid ${alpha('#ffffff', 0.12)}`,
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
                      <Iconify icon="solar:ticket-bold" width={24} sx={{ color: themeAccent }} />
                    )}
                  </Box>

                  {/* Main Ticket Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.4 }} flexWrap="wrap" useFlexGap>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: '#ffffff',
                          fontSize: { xs: 14, sm: 15.5 },
                          fontFamily: `'Barlow', sans-serif`,
                        }}
                        noWrap
                      >
                        {ticket.subject}
                      </Typography>

                      <Chip
                        label={ticket.category.toUpperCase()}
                        size="small"
                        sx={{ height: 20, fontSize: 9.5, fontWeight: 800, ...getUserChipSx('gold') }}
                      />

                      <Chip
                        label={ticket.status.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 9.5,
                          fontWeight: 800,
                          ...getUserChipSx(isClosed ? 'neutral' : isPending ? 'info' : 'success'),
                        }}
                      />
                    </Stack>

                    <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }} noWrap>
                      {ticket.previewBody || 'Transmission initiated — click to review full communication'}
                    </Typography>

                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.6 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 10, color: alpha('#ffffff', 0.4) }}>
                        #BAC-TK-{ticket.id.slice(-6).toUpperCase()}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.45) }}>
                        Updated {ticket.lastMessageAt.toLocaleString()}
                        {ticket.attachmentCount ? ` · ${ticket.attachmentCount} image(s)` : ''}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Right Arrow */}
                  <Iconify
                    className="ticket-arrow"
                    icon="solar:arrow-right-bold"
                    width={18}
                    sx={{ color: alpha('#ffffff', 0.4), flexShrink: 0, transition: 'transform 0.2s, color 0.2s' }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}

      </UserPageShell>
    );
  }

  // ------------------------------------------------------------------ CREATE VIEW (INCIDENT REPORT DOSSIER)
  if (viewMode === 'create') {
    return (
      <UserPageShell contentSx={{ maxWidth: 840, mx: 'auto' }}>
        <SupportHero
          title="INCIDENT REPORT DOSSIER"
          subtitle="Submit an encrypted operational dispatch to BattleAsia HQ staff. Include screenshot evidence for expedited resolution."
        />

        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '16px',
            bgcolor: '#090b0e',
            border: `1px solid ${alpha(themeAccent, 0.25)}`,
            boxShadow: `0 12px 36px rgba(0,0,0,0.8), inset 0 1px 0 0 ${alpha('#ffffff', 0.08)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack spacing={3}>
            {/* Top Return Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pb: 2, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }}>
              <IconButton
                onClick={backToList}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  bgcolor: alpha('#ffffff', 0.05),
                  border: `1px solid ${alpha('#ffffff', 0.12)}`,
                  color: themeAccent,
                  '&:hover': { bgcolor: alpha(themeAccent, 0.15) },
                }}
              >
                <Iconify icon="solar:arrow-left-bold" width={18} />
              </IconButton>
              <Box>
                <Typography sx={{ fontFamily: `'Barlow', sans-serif`, fontSize: 17, fontWeight: 900, color: '#ffffff', textTransform: 'uppercase' }}>
                  TRANSMIT INCIDENT DISPATCH
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: alpha('#ffffff', 0.5) }}>
                  Fill out the mission parameters below
                </Typography>
              </Box>
            </Stack>

            {/* Category Selector Cards */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: themeAccent, textTransform: 'uppercase', mb: 1.2 }}>
                SELECT INCIDENT CLASSIFICATION
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 1.5,
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = createCategory === cat.value;

                  return (
                    <ButtonBase
                      key={cat.value}
                      onClick={() => setCreateCategory(cat.value)}
                      sx={{
                        p: 1.8,
                        borderRadius: '10px',
                        bgcolor: isSelected ? alpha(themeAccent, 0.1) : alpha('#ffffff', 0.03),
                        border: `1px solid ${isSelected ? themeAccent : alpha('#ffffff', 0.1)}`,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 0 16px -2px ${alpha(themeAccent, 0.3)}` : 'none',
                        '&:hover': {
                          borderColor: themeAccent,
                          bgcolor: alpha(themeAccent, 0.06),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: isSelected ? themeAccent : alpha('#ffffff', 0.06),
                          color: isSelected ? accentContrast : themeAccent,
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={cat.icon} width={20} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#ffffff' }} noWrap>
                          {cat.label}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.5) }} noWrap>
                          {cat.desc}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            {/* Subject Input */}
            <TextField
              label="Incident Subject / Headline"
              value={createSubject}
              onChange={(e) => setCreateSubject(e.target.value)}
              InputLabelProps={userFieldLabelProps}
              sx={userFieldSx}
              placeholder="e.g. Withdrawal pending on transaction #0981"
            />

            {/* Description Body */}
            <TextField
              label="Incident Detailed Telemetry"
              value={createBody}
              onChange={(e) => setCreateBody(e.target.value)}
              InputLabelProps={userFieldLabelProps}
              sx={userFieldSx}
              multiline
              minRows={5}
              placeholder="Provide exact match IDs, wallet addresses, error codes or details so our tactical operatives can resolve your dispatch rapidly…"
            />

            {/* Cyber Evidence Dropzone & Attachments */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: themeAccent, textTransform: 'uppercase', mb: 1.2 }}>
                SUPPORTING EVIDENCE / SCREENSHOTS
              </Typography>

              {createAttachments.length > 0 && (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {createAttachments.map((url, idx) => (
                    <Box
                      key={`${url}-${idx}`}
                      sx={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `1.5px solid ${themeAccent}`,
                        boxShadow: `0 0 12px ${alpha(themeAccent, 0.3)}`,
                      }}
                    >
                      <Image
                        src={getImageUrl(url) || url}
                        alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                          bgcolor: alpha('#000000', 0.8),
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

              {/* Upload Drop Button */}
              <ButtonBase
                onClick={() => createFileRef.current?.click()}
                disabled={uploading}
                sx={{
                  width: 1,
                  p: 3,
                  borderRadius: '10px',
                  border: `1.5px dashed ${alpha(themeAccent, 0.4)}`,
                  bgcolor: alpha(themeAccent, 0.03),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: themeAccent,
                    bgcolor: alpha(themeAccent, 0.07),
                  },
                }}
              >
                {uploading ? (
                  <CircularProgress size={26} sx={{ color: themeAccent }} />
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: alpha(themeAccent, 0.15),
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Iconify icon="solar:gallery-add-bold" width={22} sx={{ color: themeAccent }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      Click to upload match screenshots or evidence
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.5) }}>
                      Supports PNG, JPG, WebP up to 10MB each
                    </Typography>
                  </>
                )}
              </ButtonBase>

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

            {/* Submit & Cancel Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <ButtonBase
                onClick={handleCreateTicket}
                disabled={creating || uploading}
                sx={{
                  flex: 1,
                  py: 1.35,
                  clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                  bgcolor: themeAccent,
                  color: accentContrast,
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  boxShadow: `0 6px 20px ${alpha(themeAccent, 0.45)}`,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 10px 28px ${alpha(themeAccent, 0.65)}`,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {creating ? (
                    <CircularProgress size={18} sx={{ color: 'inherit' }} />
                  ) : (
                    <>
                      <Iconify icon="solar:plain-bold" width={16} />
                      <span>Transmit Dispatch Report</span>
                    </>
                  )}
                </Stack>
              </ButtonBase>

              <ButtonBase
                onClick={backToList}
                disabled={creating}
                sx={{
                  px: 3,
                  py: 1.35,
                  clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                  bgcolor: alpha('#ffffff', 0.06),
                  border: `1px solid ${alpha('#ffffff', 0.15)}`,
                  color: alpha('#ffffff', 0.8),
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.12),
                    color: '#ffffff',
                  },
                }}
              >
                Cancel / Abort
              </ButtonBase>
            </Stack>
          </Stack>
        </Box>
      </UserPageShell>
    );
  }

  // ------------------------------------------------------------------ DETAIL / COMMS CHAT VIEW
  return (
    <UserPageShell contentSx={{ maxWidth: 1040, mx: 'auto' }}>
      <SupportHero
        title={selectedTicket?.subject || 'OPERATIVE COMMS'}
        subtitle="Live tactical chat with BattleAsia HQ staff. Transmissions stream in real time."
      />

      {detailLoading && messages.length === 0 ? (
        <SupportPageSkeleton />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'calc(100vh - 17rem)', md: 'calc(100vh - 15rem)' },
            borderRadius: '16px',
            bgcolor: '#080a0f',
            border: `1px solid ${alpha(themeAccent, 0.25)}`,
            overflow: 'hidden',
            boxShadow: `0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 ${alpha('#ffffff', 0.08)}`,
          }}
        >
          {/* Tactical Chat Header */}
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

          {/* Messages Scroll Area */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#07080c' }}>
            <Scrollbar sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
              {messages.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: alpha(themeAccent, 0.1),
                      border: `1px solid ${themeAccent}`,
                      color: themeAccent,
                      display: 'grid',
                      placeItems: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <Iconify icon="solar:chat-round-dots-bold-duotone" width={26} />
                  </Box>
                  <Typography sx={{ fontFamily: `'Barlow', sans-serif`, fontSize: 16, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>
                    {t('customerSupport.noMessagesYet') || 'No Messages In Stream'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: alpha('#ffffff', 0.5), mt: 0.5 }}>
                    Transmit your first message below to alert the on-duty operative.
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

          {/* Bottom Composer or Closed Banner */}
          {selectedTicket?.status === 'closed' ? (
            <Box sx={{ p: 2.2, borderTop: `1px solid ${alpha('#ffffff', 0.1)}`, bgcolor: '#0b0d13', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: alpha('#ffffff', 0.6) }}>
                This tactical dispatch is marked as resolved. Deploy a new ticket if you require further assistance.
              </Typography>
            </Box>
          ) : (
            <SupportComposer
              message={message}
              placeholder={t('customerSupport.typeYourMessage') || 'Type tactical transmission…'}
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
        </Box>
      )}
    </UserPageShell>
  );
}
