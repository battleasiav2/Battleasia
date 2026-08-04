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
  Collapse,
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
const FAB_SIZE = 56;
const POS_STORAGE_KEY = 'ba-support-chat-pos';
const DRAG_THRESHOLD_PX = 8;

type FabPos = { x: number; y: number };

function getDefaultFabPos(): FabPos {
  if (typeof window === 'undefined') return { x: 24, y: 24 };
  const margin = window.innerWidth < 900 ? 16 : 28;
  return {
    x: window.innerWidth - FAB_SIZE - margin,
    y: window.innerHeight - FAB_SIZE - margin,
  };
}

function clampFabPos(pos: FabPos): FabPos {
  if (typeof window === 'undefined') return pos;
  const pad = 8;
  return {
    x: Math.min(Math.max(pad, pos.x), window.innerWidth - FAB_SIZE - pad),
    y: Math.min(Math.max(pad, pos.y), window.innerHeight - FAB_SIZE - pad),
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
  const [fabPos, setFabPos] = useState<FabPos>(getDefaultFabPos);
  const [dragging, setDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
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
    // Note: don't gate on `token` — redux-persist strips it on page reload,
    // auth is carried by axios (session cookie / interceptor) instead.
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
  }, [messages, open, scrollToBottom]);

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
      toast('Live chat is currently offline', { id: 'live-chat-offline' });
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
    typeof window !== 'undefined' ? Math.min(380, Math.max(280, window.innerWidth - 32)) : 380;
  const fabRight = fabPos.x + FAB_SIZE;
  const panelAbsLeft =
    typeof window !== 'undefined'
      ? Math.min(Math.max(8, fabRight - panelWidth), window.innerWidth - panelWidth - 8)
      : fabPos.x + FAB_SIZE - panelWidth;
  const panelLeftOffset = panelAbsLeft - fabPos.x;

  const handleSend = async () => {
    const body = message.trim();
    if (!body || sending) return;

    if (!isLoggedIn) {
      toast(t('auth.signInToAccount') || 'Please sign in to use live chat', {
        id: 'support-chat-login',
      });
      router.push(paths.auth.signIn);
      return;
    }

    try {
      setSending(true);

      // API requires a conversationId — create/fetch the conversation first if we don't have one yet
      let convId = conversationId;
      if (!convId) {
        const conversationResponse = await api.getOrCreateConversationApi();
        convId = conversationResponse?.data?.data?.id || null;
        if (!convId) {
          toast.error('Failed to start conversation');
          return;
        }
        setConversationId(convId);
      }

      const res = await api.sendMessageApi({
        body,
        conversationId: convId,
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
              attachments: msg.attachments || [],
            },
          ];
        });
        setMessage('');
      }
    } catch {
      toast.error('Failed to send message');
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
      <Collapse
        in={open}
        timeout={220}
        unmountOnExit
        sx={{
          position: 'absolute',
          pointerEvents: 'auto',
          ...(openPanelUpward
            ? { bottom: FAB_SIZE + 12, left: panelLeftOffset }
            : { top: FAB_SIZE + 12, left: panelLeftOffset }),
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: { xs: 'min(100vw - 32px, 380px)', sm: 380 },
            height: { xs: 'min(70vh, 520px)', sm: 540 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 0,
            bgcolor: alpha('#0c0c0e', 0.96),
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            boxShadow: `
              0 0 0 1px ${alpha(GOLD, 0.18)},
              0 20px 50px ${alpha('#000000', 0.55)}
            `,
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              px: 1.75,
              py: 1.5,
              borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
              bgcolor: alpha('#161618', 0.95),
            }}
          >
            <Avatar
              src={logoSrc}
              alt={settings.agentName}
              sx={{
                width: 42,
                height: 42,
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
                  fontSize: 16,
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                }}
              >
                {settings.agentName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.35 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                    boxShadow: `0 0 8px ${alpha('#22c55e', 0.8)}`,
                  }}
                />
                <Typography sx={{ color: alpha('#ffffff', 0.55), fontSize: 12, lineHeight: 1 }}>
                  {settings.agentTitle}
                </Typography>
              </Stack>
            </Box>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: alpha('#ffffff', 0.7), '&:hover': { color: GOLD } }}
            >
              <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
          </Stack>

          {/* Body */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 1.75,
              py: 1.75,
              backgroundImage: `
                radial-gradient(ellipse 60% 40% at 80% 0%, ${alpha(GOLD, 0.06)} 0%, transparent 55%),
                linear-gradient(180deg, ${alpha('#000000', 0.2)} 0%, transparent 30%)
              `,
            }}
          >
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: alpha('#ffffff', 0.04),
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
              }}
            >
              <Typography sx={{ color: alpha('#ffffff', 0.8), fontSize: 13, lineHeight: 1.55 }}>
                {settings.welcomeMessage}
              </Typography>
            </Box>

            {!isLoggedIn ? (
              <Stack spacing={1.5} alignItems="center" sx={{ py: 2 }}>
                <Typography sx={{ color: alpha('#ffffff', 0.55), fontSize: 13, textAlign: 'center' }}>
                  Sign in to chat with our support team in real time.
                </Typography>
                <Button
                  onClick={() => router.push(paths.auth.signIn)}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 1,
                    fontWeight: 800,
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
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={28} sx={{ color: GOLD }} />
              </Stack>
            ) : (
              <Stack spacing={1.25}>
                {messages.map((msg) => {
                  const isMe = !msg.isAdmin;
                  return (
                    <Stack
                      key={msg.id}
                      direction="row"
                      justifyContent={isMe ? 'flex-end' : 'flex-start'}
                    >
                      <Box
                        sx={{
                          maxWidth: '82%',
                          px: 1.4,
                          py: 1,
                          bgcolor: isMe ? alpha(GOLD, 0.16) : alpha('#ffffff', 0.06),
                          border: `1px solid ${isMe ? alpha(GOLD, 0.35) : alpha('#ffffff', 0.1)}`,
                        }}
                      >
                        {!isMe && (
                          <Typography
                            sx={{ color: GOLD, fontSize: 11, fontWeight: 700, mb: 0.4 }}
                          >
                            {msg.senderName || settings.agentName}
                          </Typography>
                        )}
                        <Typography sx={{ color: '#fff', fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                          {msg.body}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            )}

            {!!settings.socialLinks?.length && (
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2.5, flexWrap: 'wrap' }}>
                {settings.socialLinks.map((link) => (
                  <IconButton
                    key={`${link.label}-${link.href}`}
                    component="a"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 0,
                      bgcolor: alpha(link.color || GOLD, 0.15),
                      border: `1px solid ${alpha(link.color || GOLD, 0.35)}`,
                      color: link.color || GOLD,
                      '&:hover': { bgcolor: alpha(link.color || GOLD, 0.25) },
                    }}
                  >
                    <Iconify icon={link.icon as any} width={18} />
                  </IconButton>
                ))}
              </Stack>
            )}
          </Box>

          {/* Composer */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 1.5,
              py: 1.25,
              borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
              bgcolor: alpha('#000000', 0.35),
            }}
          >
            <Box
              sx={{
                flex: 1,
                bgcolor: alpha('#ffffff', 0.05),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
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
                  px: 1.5,
                  py: 1,
                  color: '#fff',
                  fontSize: 13,
                  '& input::placeholder': { color: alpha('#ffffff', 0.4), opacity: 1 },
                }}
              />
            </Box>
            <IconButton
              onClick={handleSend}
              disabled={!message.trim() || sending}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 0,
                color: '#111',
                bgcolor: GOLD,
                '&:hover': { bgcolor: '#fbbf24' },
                '&.Mui-disabled': { bgcolor: alpha('#ffffff', 0.08), color: alpha('#ffffff', 0.3) },
              }}
            >
              {sending ? <CircularProgress size={16} sx={{ color: '#111' }} /> : <Iconify icon="solar:plain-bold" width={18} />}
            </IconButton>
          </Stack>
        </Paper>
      </Collapse>

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
          transition: dragging ? 'none' : 'background-color 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            bgcolor: alpha(GOLD, 0.16),
            borderColor: alpha(GOLD, 0.55),
          },
        }}
      >
        <Iconify icon={open ? 'solar:close-circle-bold' : 'solar:chat-round-call-bold'} width={28} />
      </Fab>
    </Box>
  );
}
