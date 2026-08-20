import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import {
  Box,
  Fab,
  Stack,
  Avatar,
  Paper,
  Typography,
  IconButton,
  InputBase,
  CircularProgress,
  Button,
  Grow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks/use-router';
import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import useApi from 'src/hooks/use-api';
import { CONFIG } from 'src/global-config';
import { socketService } from 'src/lib/socket';
import axios from 'src/lib/axios';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';
const FAB_SIZE = 52;
const POS_STORAGE_KEY = 'ba-support-chat-pos';
const DRAG_THRESHOLD_PX = 8;
/** Floating footer / public mobile nav sits ~bottom 12 + ~64 bar height */
const MOBILE_BOTTOM_NAV_CLEARANCE = 84;
const MAX_ATTACHMENTS = 4;

type FabPos = { x: number; y: number };

function getMobileBottomClearance() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth < 1200 ? MOBILE_BOTTOM_NAV_CLEARANCE : 0;
}

function getDefaultFabPos(): FabPos {
  if (typeof window === 'undefined') return { x: 24, y: 24 };
  const margin = window.innerWidth < 1200 ? 16 : 28;
  const bottomClearance = getMobileBottomClearance();
  return {
    x: window.innerWidth - FAB_SIZE - margin,
    y: window.innerHeight - FAB_SIZE - margin - bottomClearance,
  };
}

function clampFabPos(pos: FabPos): FabPos {
  if (typeof window === 'undefined') return pos;
  const pad = 8;
  const bottomClearance = getMobileBottomClearance();
  return {
    x: Math.min(Math.max(pad, pos.x), window.innerWidth - FAB_SIZE - pad),
    y: Math.min(
      Math.max(pad, pos.y),
      window.innerHeight - FAB_SIZE - pad - bottomClearance
    ),
  };
}

function loadFabPos(): FabPos {
  if (typeof window === 'undefined') return getDefaultFabPos();
  try {
    const raw = window.localStorage.getItem(POS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FabPos;
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        return clampFabPos(parsed);
      }
    }
  } catch {
    // ignore
  }
  return getDefaultFabPos();
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || url.includes('/uploads/');
}

type LiveChatSocialLink = {
  label: string;
  icon: string;
  color: string;
  href: string;
};

type LiveChatSettings = {
  enabled: boolean;
  agentName: string;
  agentTitle: string;
  agentAvatar: string;
  logoUrl: string;
  welcomeMessage: string;
  socialLinks: LiveChatSocialLink[];
};

type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: Date;
  isAdmin: boolean;
  attachments?: string[];
};

const DEFAULT_SETTINGS: LiveChatSettings = {
  enabled: true,
  agentName: 'BattleAsia Support',
  agentTitle: 'Live Support',
  agentAvatar: '',
  logoUrl: '/logo/logo.webp',
  welcomeMessage: 'Hi! How can we help you today?',
  socialLinks: [],
};

function resolveAsset(url?: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url;
  const base = CONFIG.serverUrl || '';
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

// ----------------------------------------------------------------------

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<LiveChatSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [fabPos, setFabPos] = useState<FabPos>(getDefaultFabPos);
  const [dragging, setDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const router = useRouter();
  const { t } = useTranslate();
  const api = useApi();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  useEffect(() => {
    setFabPos(loadFabPos());
  }, []);

  useEffect(() => {
    const onResize = () => setFabPos((prev) => clampFabPos(prev));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const logoSrc = useMemo(
    () => resolveAsset(settings.logoUrl || settings.agentAvatar) || '/logo/logo.webp',
    [settings.logoUrl, settings.agentAvatar]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get('api/v2/customer-support/live-chat-settings');
        if (active && res?.data?.status && res?.data?.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...res.data.data });
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadConversation = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const conversationResponse = await api.getOrCreateConversationApi();
      if (conversationResponse?.data?.status && conversationResponse?.data?.data) {
        const convId = conversationResponse.data.data.id;
        setConversationId(convId);
        const messagesResponse = await api.getMessagesApi(convId, { limit: 40 });
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
        }
      }
    } catch {
      toast.error(t('customerSupport.failedToLoadConversation') || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, [api, isLoggedIn, t]);

  useEffect(() => {
    if (open && isLoggedIn) {
      loadConversation();
    }
  }, [open, isLoggedIn, loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, pendingAttachments, scrollToBottom]);

  useEffect(() => {
    if (!conversationId || !open) return undefined;
    const serverUrl = CONFIG.serverUrl || '';
    if (!serverUrl) return undefined;

    socketService.connect(serverUrl);
    socketService.offNewMessage();

    const handleNewMessage = (payload: any) => {
      if (!payload?.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            body: payload.body,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            createdAt: new Date(payload.createdAt || Date.now()),
            isAdmin: Boolean(payload.isAdmin),
            attachments: payload.attachments || [],
          },
        ];
      });
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.joinConversation(conversationId);

    return () => {
      socketService.offNewMessage();
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId, open]);

  const handleToggle = () => {
    if (!settings.enabled) {
      toast(t('common.liveChatOffline'), { id: 'live-chat-offline' });
      return;
    }
    setOpen((prev) => !prev);
  };

  const handleFabPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: fabPos.x,
      originY: fabPos.y,
      moved: false,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFabPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

    drag.moved = true;
    setFabPos(clampFabPos({ x: drag.originX + dx, y: drag.originY + dy }));
  };

  const finishFabDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const wasDrag = drag.moved;
    drag.pointerId = null;
    setDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }

    if (wasDrag) {
      setFabPos((prev) => {
        const next = clampFabPos(prev);
        try {
          window.localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      return;
    }

    handleToggle();
  };

  const openPanelUpward = typeof window !== 'undefined' ? fabPos.y > window.innerHeight * 0.45 : true;
  const panelWidth =
    typeof window !== 'undefined' ? Math.min(300, Math.max(260, window.innerWidth - 28)) : 300;
  const fabRight = fabPos.x + FAB_SIZE;
  const panelAbsLeft =
    typeof window !== 'undefined'
      ? Math.min(Math.max(8, fabRight - panelWidth), window.innerWidth - panelWidth - 8)
      : fabPos.x + FAB_SIZE - panelWidth;
  const panelLeftOffset = panelAbsLeft - fabPos.x;

  const canSend =
    (Boolean(message.trim()) || pendingAttachments.length > 0) && !sending && !uploading && settings.enabled;

  const handleUploadImages = async (files: FileList | null) => {
    if (!files?.length) return;

    if (!isLoggedIn) {
      toast(t('auth.signInToAccount') || 'Please sign in to use live chat', {
        id: 'support-chat-login',
      });
      router.push(paths.auth.signIn);
      return;
    }

    const remaining = MAX_ATTACHMENTS - pendingAttachments.length;
    if (remaining <= 0) {
      toast.error(`Max ${MAX_ATTACHMENTS} images`);
      return;
    }

    const imageFiles = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remaining);

    if (!imageFiles.length) {
      toast.error('Please select image files');
      return;
    }

    try {
      setUploading(true);
      const uploadResponse = await api.uploadFilesApi(imageFiles, { folder: 'support' });
      if (uploadResponse?.data?.status && uploadResponse?.data?.data?.files) {
        const uploadedUrls = uploadResponse.data.data.files.map((file: any) => file.url as string);
        setPendingAttachments((prev) => [...prev, ...uploadedUrls].slice(0, MAX_ATTACHMENTS));
        toast.success(
          t('customerSupport.filesUploadedSuccess', { count: imageFiles.length }) || 'Uploaded'
        );
      } else {
        toast.error(t('customerSupport.failedToUploadFiles') || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t('customerSupport.failedToUploadFiles') || 'Upload failed'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    const body = message.trim();
    if ((!body && pendingAttachments.length === 0) || sending || uploading) return;

    if (!isLoggedIn) {
      toast(t('auth.signInToAccount') || 'Please sign in to use live chat', {
        id: 'support-chat-login',
      });
      router.push(paths.auth.signIn);
      return;
    }

    try {
      setSending(true);

      let convId = conversationId;
      if (!convId) {
        const conversationResponse = await api.getOrCreateConversationApi();
        convId = conversationResponse?.data?.data?.id || null;
        if (!convId) {
          toast.error(t('common.failedToStartConversation'));
          return;
        }
        setConversationId(convId);
      }

      const attachments = [...pendingAttachments];
      const res = await api.sendMessageApi({
        body: body || ' ',
        conversationId: convId,
        attachments: attachments.length ? attachments : undefined,
      });
      if (res?.data?.status && res?.data?.data) {
        const msg = res.data.data;
        setConversationId((prev) => prev || msg.conversationId || prev);
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
              isAdmin: false,
              attachments: msg.attachments || attachments,
            },
          ];
        });
        setMessage('');
        setPendingAttachments([]);
      }
    } catch {
      toast.error(t('common.failedToSendMessage'));
    } finally {
      setSending(false);
    }
  };

  if (!settings.enabled && !open) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        left: fabPos.x,
        top: fabPos.y,
        zIndex: 1400,
        width: FAB_SIZE,
        height: FAB_SIZE,
        pointerEvents: 'none',
      }}
    >
      <Grow
        in={open}
        timeout={{ enter: 260, exit: 180 }}
        style={{
          transformOrigin: openPanelUpward ? 'bottom right' : 'top right',
        }}
        unmountOnExit
      >
        <Box
          sx={{
            position: 'absolute',
            pointerEvents: 'auto',
            ...(openPanelUpward
              ? { bottom: FAB_SIZE + 10, left: panelLeftOffset }
              : { top: FAB_SIZE + 10, left: panelLeftOffset }),
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: { xs: 'min(100vw - 28px, 300px)', sm: 300 },
              height: { xs: 'min(52vh, 360px)', sm: 380 },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 1.25,
              bgcolor: alpha('#0c0c0e', 0.97),
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              boxShadow: `
                0 0 0 1px ${alpha(GOLD, 0.16)},
                0 16px 40px ${alpha('#000000', 0.55)}
              `,
              transition: 'box-shadow 0.25s ease',
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                px: 1.25,
                py: 1,
                borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
                bgcolor: alpha('#161618', 0.95),
              }}
            >
              <Avatar
                src={logoSrc}
                alt={settings.agentName}
                sx={{
                  width: 32,
                  height: 32,
                  border: `1px solid ${alpha(GOLD, 0.45)}`,
                  bgcolor: alpha('#000000', 0.5),
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  className="font-tr"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 12.5,
                    lineHeight: 1.1,
                    textTransform: 'uppercase',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {settings.agentName}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mt: 0.25 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      boxShadow: `0 0 8px ${alpha('#22c55e', 0.8)}`,
                    }}
                  />
                  <Typography sx={{ color: alpha('#ffffff', 0.55), fontSize: 10.5, lineHeight: 1 }}>
                    {settings.agentTitle}
                  </Typography>
                </Stack>
              </Box>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{
                  color: alpha('#ffffff', 0.7),
                  p: 0.5,
                  transition: 'color 0.2s ease, transform 0.2s ease',
                  '&:hover': { color: GOLD, transform: 'scale(1.06)' },
                }}
              >
                <Iconify icon="mingcute:close-line" width={18} />
              </IconButton>
            </Stack>

            {/* Body */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 1.25,
                py: 1.25,
                backgroundImage: `
                  radial-gradient(ellipse 60% 40% at 80% 0%, ${alpha(GOLD, 0.06)} 0%, transparent 55%),
                  linear-gradient(180deg, ${alpha('#000000', 0.2)} 0%, transparent 30%)
                `,
                scrollbarWidth: 'thin',
              }}
            >
              <Box
                sx={{
                  mb: 1.25,
                  p: 1.1,
                  bgcolor: alpha('#ffffff', 0.04),
                  border: `1px solid ${alpha('#ffffff', 0.08)}`,
                  borderRadius: 0.75,
                }}
              >
                <Typography sx={{ color: alpha('#ffffff', 0.8), fontSize: 12, lineHeight: 1.45 }}>
                  {settings.welcomeMessage}
                </Typography>
              </Box>

              {!isLoggedIn ? (
                <Stack spacing={1.25} alignItems="center" sx={{ py: 1.5 }}>
                  <Typography sx={{ color: alpha('#ffffff', 0.55), fontSize: 12, textAlign: 'center' }}>
                    Sign in to chat with our support team in real time.
                  </Typography>
                  <Button
                    onClick={() => router.push(paths.auth.signIn)}
                    sx={{
                      borderRadius: 0.75,
                      px: 2,
                      py: 0.75,
                      fontWeight: 800,
                      fontSize: 12,
                      color: '#111',
                      bgcolor: GOLD,
                      textTransform: 'uppercase',
                      '&:hover': { bgcolor: '#fbbf24' },
                    }}
                  >
                    {t('auth.signIn') || 'Sign In'}
                  </Button>
                </Stack>
              ) : loading ? (
                <Stack alignItems="center" sx={{ py: 3 }}>
                  <CircularProgress size={22} sx={{ color: GOLD }} />
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {messages.map((msg) => {
                    const isMe = !msg.isAdmin;
                    const attachments = msg.attachments || [];
                    const showBody = Boolean(msg.body?.trim());
                    return (
                      <Stack
                        key={msg.id}
                        direction="row"
                        justifyContent={isMe ? 'flex-end' : 'flex-start'}
                      >
                        <Box
                          sx={{
                            maxWidth: '84%',
                            px: 1.15,
                            py: 0.85,
                            borderRadius: 0.75,
                            bgcolor: isMe ? alpha(GOLD, 0.16) : alpha('#ffffff', 0.06),
                            border: `1px solid ${isMe ? alpha(GOLD, 0.35) : alpha('#ffffff', 0.1)}`,
                          }}
                        >
                          {!isMe && (
                            <Typography
                              sx={{ color: GOLD, fontSize: 10, fontWeight: 700, mb: 0.3 }}
                            >
                              {msg.senderName || settings.agentName}
                            </Typography>
                          )}
                          {showBody && (
                            <Typography
                              sx={{
                                color: '#fff',
                                fontSize: 12.5,
                                lineHeight: 1.4,
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {msg.body}
                            </Typography>
                          )}
                          {attachments.length > 0 && (
                            <Stack spacing={0.6} sx={{ mt: showBody ? 0.75 : 0 }}>
                              {attachments.map((attachment, idx) => {
                                const fileUrl = resolveAsset(attachment);
                                if (!isImageUrl(attachment)) {
                                  return (
                                    <Typography
                                      key={`${msg.id}-att-${idx}`}
                                      component="a"
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ color: GOLD, fontSize: 11 }}
                                    >
                                      Attachment {idx + 1}
                                    </Typography>
                                  );
                                }
                                return (
                                  <Box
                                    key={`${msg.id}-att-${idx}`}
                                    component="img"
                                    src={fileUrl}
                                    alt=""
                                    loading="lazy"
                                    onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
                                    sx={{
                                      display: 'block',
                                      width: 1,
                                      maxWidth: 160,
                                      maxHeight: 120,
                                      objectFit: 'cover',
                                      borderRadius: 0.5,
                                      cursor: 'pointer',
                                      border: `1px solid ${alpha('#ffffff', 0.12)}`,
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Stack>
              )}

              {!!settings.socialLinks?.length && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  justifyContent="center"
                  sx={{ mt: 1.5, flexWrap: 'wrap' }}
                >
                  {settings.socialLinks.map((link) => {
                    const brand = link.color || GOLD;
                    const isDarkBrand = /^#0{3,6}$/i.test(brand) || /^#111(111)?$/i.test(brand);
                    const iconColor = isDarkBrand ? '#ffffff' : brand;
                    return (
                      <IconButton
                        key={`${link.label}-${link.href}`}
                        component="a"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label || 'Social link'}
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 0.75,
                          bgcolor: alpha(isDarkBrand ? '#ffffff' : brand, 0.15),
                          border: `1px solid ${alpha(isDarkBrand ? '#ffffff' : brand, 0.35)}`,
                          color: iconColor,
                          transition: 'background-color 0.2s ease, transform 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(isDarkBrand ? '#ffffff' : brand, 0.25),
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Iconify icon={link.icon as any} width={15} />
                      </IconButton>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Composer */}
            <Box
              sx={{
                px: 1.15,
                pt: pendingAttachments.length ? 0.85 : 0.9,
                pb: 0.9,
                borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                bgcolor: alpha('#000000', 0.35),
              }}
            >
              {pendingAttachments.length > 0 && (
                <Stack direction="row" spacing={0.75} sx={{ mb: 0.85, overflowX: 'auto' }}>
                  {pendingAttachments.map((url, idx) => (
                    <Box key={`${url}-${idx}`} sx={{ position: 'relative', flexShrink: 0 }}>
                      <Box
                        component="img"
                        src={resolveAsset(url)}
                        alt=""
                        sx={{
                          width: 44,
                          height: 44,
                          objectFit: 'cover',
                          borderRadius: 0.75,
                          border: `1px solid ${alpha(GOLD, 0.35)}`,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                        }
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          p: 0,
                          bgcolor: alpha('#000000', 0.85),
                          color: '#fff',
                          border: `1px solid ${alpha('#ffffff', 0.2)}`,
                          '&:hover': { bgcolor: alpha('#ef4444', 0.9) },
                        }}
                      >
                        <Iconify icon="mingcute:close-line" width={12} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={0.75} alignItems="center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleUploadImages(e.target.files)}
                />

                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending || !settings.enabled}
                  aria-label="Upload image"
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 0.75,
                    color: GOLD,
                    bgcolor: alpha(GOLD, 0.1),
                    border: `1px solid ${alpha(GOLD, 0.28)}`,
                    transition: 'background-color 0.2s ease, transform 0.2s ease',
                    '&:hover': { bgcolor: alpha(GOLD, 0.18), transform: 'scale(1.04)' },
                    '&.Mui-disabled': {
                      color: alpha('#ffffff', 0.25),
                      bgcolor: alpha('#ffffff', 0.04),
                      borderColor: alpha('#ffffff', 0.08),
                    },
                  }}
                >
                  {uploading ? (
                    <CircularProgress size={14} sx={{ color: GOLD }} />
                  ) : (
                    <Iconify icon="solar:gallery-add-bold" width={16} />
                  )}
                </IconButton>

                <Box
                  sx={{
                    flex: 1,
                    bgcolor: alpha('#ffffff', 0.05),
                    border: `1px solid ${alpha('#ffffff', 0.12)}`,
                    borderRadius: 0.75,
                  }}
                >
                  <InputBase
                    fullWidth
                    value={message}
                    disabled={sending || !settings.enabled}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isLoggedIn ? 'Type a message…' : 'Sign in to chat…'}
                    sx={{
                      px: 1.15,
                      py: 0.75,
                      color: '#fff',
                      fontSize: 12.5,
                      '& input::placeholder': { color: alpha('#ffffff', 0.4), opacity: 1 },
                    }}
                  />
                </Box>

                <IconButton
                  onClick={handleSend}
                  disabled={!canSend}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 0.75,
                    color: '#111',
                    bgcolor: GOLD,
                    transition: 'background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
                    '&:hover': { bgcolor: '#fbbf24', transform: 'scale(1.04)' },
                    '&.Mui-disabled': {
                      bgcolor: alpha('#ffffff', 0.08),
                      color: alpha('#ffffff', 0.3),
                    },
                  }}
                >
                  {sending ? (
                    <CircularProgress size={14} sx={{ color: '#111' }} />
                  ) : (
                    <Iconify icon="solar:plain-bold" width={16} />
                  )}
                </IconButton>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Grow>

      <Fab
        onPointerDown={handleFabPointerDown}
        onPointerMove={handleFabPointerMove}
        onPointerUp={finishFabDrag}
        onPointerCancel={finishFabDrag}
        aria-label="Open live chat"
        title="Drag to move · Click to open"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          width: FAB_SIZE,
          height: FAB_SIZE,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          bgcolor: alpha('#0a0a0a', 0.9),
          color: GOLD,
          border: `1px solid ${alpha(GOLD, 0.4)}`,
          boxShadow: `0 10px 28px ${alpha('#000000', 0.5)}`,
          transition: dragging
            ? 'none'
            : 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            bgcolor: alpha(GOLD, 0.16),
            borderColor: alpha(GOLD, 0.55),
            transform: dragging ? 'none' : 'scale(1.04)',
          },
        }}
      >
        <Iconify icon={open ? 'solar:close-circle-bold' : 'solar:chat-round-call-bold'} width={26} />
      </Fab>
    </Box>
  );
}
