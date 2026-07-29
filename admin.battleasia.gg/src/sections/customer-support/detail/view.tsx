import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Stack,
  Avatar,
  Typography,
  Container,
  InputBase,
  IconButton,
  Divider,
  CircularProgress,
  Link,
  Chip,
  Button,
} from '@mui/material';

import { fToNow } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import toast from 'react-hot-toast';
import { API_URL } from 'src/config-global';
import { socketService } from 'src/utils/socket';

// ----------------------------------------------------------------------

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

export default function CustomerSupportDetailView() {
  const settings = useSettingsContext();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  // Load conversation and messages
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      // Get conversation details from list (we'll need to fetch it)
      const conversationsResponse = await api.getAllConversationsApi({ limit: 1000 });
      if (conversationsResponse?.data?.status && conversationsResponse?.data?.data?.results) {
        const foundConv = conversationsResponse.data.data.results.find(
          (conv: any) => (conv.id || conv._id) === conversationId
        );
        if (foundConv) {
          setConversation(foundConv);
        }
      }

      // Load messages
      const messagesResponse = await api.getConversationMessagesApi(conversationId, { limit: 100 });
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
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [conversationId, api]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    const serverUrl = API_URL || '';
    
    if (!serverUrl || !conversationId) {
      return undefined;
    }
    
    socketService.connect(serverUrl);
    socketService.offNewMessage();
    socketService.offUserTyping();
    
    const handleNewMessage = (newMessage: any) => {
      setMessages((prev) => {
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [...prev, {
          id: newMessage.id,
          body: newMessage.body,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          senderAvatar: newMessage.senderAvatar,
          createdAt: new Date(newMessage.createdAt),
          isAdmin: newMessage.isAdmin,
          attachments: newMessage.attachments || [],
        }];
      });
    };
    
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping((data: any) => {
      // Handle typing indicator if needed
    });
    
    socketService.joinConversation(conversationId);
    
    return () => {
      socketService.leaveConversation(conversationId);
      socketService.offNewMessage();
      socketService.offUserTyping();
    };
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollableParent = messagesEndRef.current.closest('.simplebar-content-wrapper');
      if (scrollableParent) {
        scrollableParent.scrollTop = scrollableParent.scrollHeight;
      }
    }
  }, [messages]);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(
    async (event?: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event && event.key !== 'Enter') return;
      if (!message.trim() || sending || !conversationId) return;

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
          // Prefer socket; also merge from HTTP so sender sees reply immediately
          const msg = response.data.data;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, {
              id: msg.id,
              body: msg.body,
              senderId: msg.senderId,
              senderName: msg.senderName,
              senderAvatar: msg.senderAvatar,
              createdAt: new Date(msg.createdAt),
              isAdmin: msg.isAdmin,
              attachments: msg.attachments || [],
            }];
          });
          toast.success('Message sent');
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to send message');
        setMessage(messageBody);
      } finally {
        setSending(false);
      }
    },
    [message, sending, conversationId, api, pendingAttachments]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
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
          toast.success(`${fileArray.length} file(s) uploaded successfully`);
        } else {
          toast.error('Failed to upload files');
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to upload files');
      } finally {
        setUploading(false);
        if (fileRef.current) {
          fileRef.current.value = '';
        }
      }
    },
    [api]
  );

  const handleRemoveAttachment = useCallback((index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCloseConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      const response = await api.closeConversationApi(conversationId);
      if (response?.data?.status) {
        toast.success('Conversation closed');
        navigate(paths.customerSupport.list);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to close conversation');
    }
  }, [conversationId, api, navigate]);

  const renderMessage = (msg: ChatMessage) => {
    const isAdmin = msg.isAdmin;

    return (
      <Box
        key={msg.id}
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: isAdmin ? 'flex-end' : 'flex-start',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-start"
          sx={{ maxWidth: '70%', flexDirection: isAdmin ? 'row-reverse' : 'row' }}
        >
          {!isAdmin && (
            <Avatar
              src={conversation?.userId?.avatar}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              {conversation?.userId?.username?.charAt(0) || 'U'}
            </Avatar>
          )}

          <Stack alignItems={isAdmin ? 'flex-end' : 'flex-start'}>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, color: 'text.secondary', px: 1 }}
            >
              {isAdmin ? 'You (Admin)' : conversation?.userId?.username || 'User'} • {fToNow(msg.createdAt)}
            </Typography>

            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: isAdmin ? 'primary.main' : 'background.neutral',
                color: isAdmin ? 'common.white' : 'text.primary',
                maxWidth: '100%',
                wordBreak: 'break-word',
              }}
            >
              {msg.body && (
                <Typography variant="body2" sx={{ mb: msg.attachments && msg.attachments.length > 0 ? 1 : 0 }}>
                  {msg.body}
                </Typography>
              )}
              {msg.attachments && msg.attachments.length > 0 && (
                <Stack spacing={1} sx={{ mt: msg.body ? 1 : 0 }}>
                  {msg.attachments.map((attachment, idx) => {
                    const fileUrl = attachment.startsWith('http') ? attachment : `${API_URL}${attachment}`;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                    const fileName = attachment.split('/').pop() || `Attachment ${idx + 1}`;

                    const openInNewTab = (url: string) => {
                      const anchor = document.createElement('a');
                      anchor.href = url;
                      anchor.target = '_blank';
                      anchor.rel = 'noopener noreferrer';
                      document.body.appendChild(anchor);
                      anchor.click();
                      anchor.remove();
                    };

                    return (
                      <Box key={idx}>
                        {isImage ? (
                          <Box
                            component="img"
                            src={fileUrl}
                            alt={fileName}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: 200,
                              borderRadius: 1,
                              cursor: 'pointer',
                              objectFit: 'contain',
                            }}
                            onClick={() => openInNewTab(fileUrl)}
                          />
                        ) : (
                          <Link
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: isAdmin ? 'common.white' : 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            <Iconify icon="eva:attach-2-fill" width={16} />
                            <Typography variant="caption">{fileName}</Typography>
                          </Link>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Stack>

          {isAdmin && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              A
            </Avatar>
          )}
        </Stack>
      </Box>
    );
  };

  if (!conversationId) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography>Conversation not found</Typography>
      </Container>
    );
  }

  const user = conversation?.userId || {};

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Card sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', mt: 3 }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(paths.customerSupport.list)}
            sx={{ mr: 'auto' }}
          >
            Back
          </Button>

          <Avatar
            src={user.avatar}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
            }}
          >
            {user.username?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {conversation?.subject || 'Support Ticket'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user.username || 'Unknown User'}
                {user.email ? ` · ${user.email}` : ''}
              </Typography>
              {conversation?.category ? (
                <Chip label={conversation.category} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Box>
          <Chip
            label={conversation?.status || 'unknown'}
            color={
              (() => {
                if (conversation?.status === 'open') return 'success';
                if (conversation?.status === 'closed') return 'default';
                return 'warning';
              })()
            }
            size="small"
          />
          {conversation?.status !== 'closed' && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCloseConversation}
              startIcon={<Iconify icon="solar:close-circle-bold" />}
            >
              Close Ticket
            </Button>
          )}
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Scrollbar sx={{ flex: 1, p: 3 }}>
            {(() => {
              if (loading) {
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                  </Box>
                );
              }
              if (messages.length === 0) {
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No messages yet.
                    </Typography>
                  </Box>
                );
              }
              return (
                <>
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              );
            })()}
          </Scrollbar>
        </Box>

        <Divider />

        {/* Input */}
        <Box
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handleAttach} disabled={uploading || conversation?.status === 'closed'}>
              {uploading ? (
                <CircularProgress size={20} />
              ) : (
                <Iconify icon="solar:gallery-add-bold" />
              )}
            </IconButton>
            <IconButton onClick={handleAttach} disabled={uploading || conversation?.status === 'closed'}>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>

            <InputBase
              fullWidth
              value={message}
              onChange={handleChangeMessage}
              onKeyUp={(e) => handleSendMessage(e)}
              placeholder="Type your message..."
              disabled={sending || conversation?.status === 'closed'}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: 'background.neutral',
              }}
            />

            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || sending || conversation?.status === 'closed'}
              color="primary"
            >
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <Iconify icon="solar:plain-2-bold" />
              )}
            </IconButton>
          </Stack>

          <input
            type="file"
            ref={fileRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />

          {/* Pending attachments */}
          {pendingAttachments.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {pendingAttachments.map((attachment, idx) => {
                const fileName = attachment.split('/').pop() || `Attachment ${idx + 1}`;
                return (
                  <Chip
                    key={idx}
                    label={fileName}
                    onDelete={() => handleRemoveAttachment(idx)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
}

