import { Box, Link, Stack, Avatar, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { USER_COLORS, userMutedTextSx } from 'src/layouts/user';
import { fToNow } from 'src/utils/format-time';

import { ADMIN_PARTICIPANT } from '../customer-support-constants';
import type { ChatMessage } from '../customer-support-types';

// ----------------------------------------------------------------------

type SupportMessageBubbleProps = {
  message: ChatMessage;
  youLabel: string;
  userAvatar?: string;
  userInitial?: string;
};

const openInNewTab = (url: string) => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

export function SupportMessageBubble({
  message,
  youLabel,
  userAvatar,
  userInitial = 'U',
}: SupportMessageBubbleProps) {
  const theme = useTheme();
  const themeAccent = theme.palette.primary.main || USER_COLORS.gold;
  const isMe = !message.isAdmin;

  return (
    <Box
      sx={{
        mb: 2.5,
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="flex-start"
        sx={{ maxWidth: { xs: '94%', sm: '78%' }, flexDirection: isMe ? 'row-reverse' : 'row' }}
      >
        {/* Avatar */}
        {!isMe ? (
          <Avatar
            sx={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              bgcolor: alpha(themeAccent, 0.15),
              border: `1px solid ${themeAccent}`,
              color: themeAccent,
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            <Iconify icon="solar:headphones-round-sound-bold" width={18} />
          </Avatar>
        ) : (
          <Avatar
            src={userAvatar}
            sx={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              bgcolor: alpha('#ffffff', 0.1),
              border: `1px solid ${alpha(themeAccent, 0.4)}`,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {userInitial}
          </Avatar>
        )}

        {/* Message Content */}
        <Stack alignItems={isMe ? 'flex-end' : 'flex-start'} sx={{ minWidth: 0 }}>
          {/* Telemetry Header */}
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.4, px: 0.5 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 800,
                color: isMe ? themeAccent : alpha('#ffffff', 0.75),
                letterSpacing: 0.6,
              }}
            >
              {isMe ? `[${youLabel.toUpperCase()}]` : `[${ADMIN_PARTICIPANT.name.toUpperCase()}]`}
            </Typography>
            <Typography sx={{ ...userMutedTextSx, fontSize: 10 }}>
              · {fToNow(message.createdAt)}
            </Typography>
          </Stack>

          {/* Tactical Bubble */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: '12px',
              maxWidth: '100%',
              wordBreak: 'break-word',
              bgcolor: isMe ? alpha(themeAccent, 0.12) : '#10131a',
              border: `1px solid ${isMe ? alpha(themeAccent, 0.35) : alpha('#ffffff', 0.1)}`,
              boxShadow: isMe
                ? `0 4px 16px -4px ${alpha(themeAccent, 0.25)}`
                : '0 4px 16px -4px rgba(0,0,0,0.6)',
              position: 'relative',
              '&::before': isMe
                ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    borderTop: `2px solid ${themeAccent}`,
                    borderRight: `2px solid ${themeAccent}`,
                    opacity: 0.8,
                  }
                : {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 8,
                    height: 8,
                    borderTop: `2px solid ${alpha('#ffffff', 0.3)}`,
                    borderLeft: `2px solid ${alpha('#ffffff', 0.3)}`,
                  },
            }}
          >
            {message.body && (
              <Typography
                sx={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: isMe ? '#ffffff' : alpha('#ffffff', 0.88),
                  mb: message.attachments?.length ? 1.5 : 0,
                }}
              >
                {message.body}
              </Typography>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <Stack spacing={1} sx={{ mt: message.body ? 1.5 : 0 }}>
                {message.attachments.map((attachment, idx) => {
                  const fileUrl = attachment.startsWith('http')
                    ? attachment
                    : `${CONFIG.serverUrl}${attachment}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                  const fileName = attachment.split('/').pop() || `Evidence_${idx + 1}`;

                  return (
                    <Box key={idx}>
                      {isImage ? (
                        <Box
                          component="img"
                          src={fileUrl}
                          alt={fileName}
                          onClick={() => openInNewTab(fileUrl)}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 220,
                            borderRadius: '8px',
                            border: `1px solid ${alpha('#ffffff', 0.15)}`,
                            cursor: 'pointer',
                            objectFit: 'cover',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: themeAccent,
                              transform: 'scale(1.01)',
                            },
                          }}
                        />
                      ) : (
                        <Link
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            bgcolor: alpha('#000000', 0.3),
                            border: `1px solid ${alpha('#ffffff', 0.1)}`,
                            borderRadius: '6px',
                            color: themeAccent,
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          <Iconify icon="solar:document-bold" width={16} />
                          <span>{fileName}</span>
                        </Link>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
