import { Box, Link, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, userMutedTextSx, goldAlpha } from 'src/layouts/user';

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

export function SupportMessageBubble({ message, youLabel, userAvatar, userInitial = 'U' }: SupportMessageBubbleProps) {
  const tokens = getDefaultGlassTokens();
  const isMe = !message.isAdmin;

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        sx={{ maxWidth: { xs: '92%', sm: '75%' }, flexDirection: isMe ? 'row-reverse' : 'row' }}
      >
        {!isMe ? (
          <Avatar sx={{ width: 40, height: 40, bgcolor: USER_COLORS.gold, color: USER_COLORS.surface, fontWeight: 800 }}>
            {ADMIN_PARTICIPANT.name.charAt(0)}
          </Avatar>
        ) : null}

        <Stack alignItems={isMe ? 'flex-end' : 'flex-start'} sx={{ minWidth: 0 }}>
          <Typography sx={{ mb: 0.5, ...userMutedTextSx, fontSize: 11, px: 0.5 }}>
            {isMe ? youLabel : ADMIN_PARTICIPANT.name} · {fToNow(message.createdAt)}
          </Typography>

          <Box
            sx={getGlassInnerSx(tokens, {
              px: 2,
              py: 1.5,
              maxWidth: '100%',
              wordBreak: 'break-word',
              borderColor: isMe ? goldAlpha(0.35) : undefined,
              bgcolor: isMe ? goldAlpha(0.16) : alpha('#ffffff', 0.05),
            })}
          >
            {message.body ? (
              <Typography sx={{ fontSize: 14, color: isMe ? USER_COLORS.textPrimary : USER_COLORS.textSubtle, mb: message.attachments?.length ? 1 : 0 }}>
                {message.body}
              </Typography>
            ) : null}

            {message.attachments && message.attachments.length > 0 ? (
              <Stack spacing={1} sx={{ mt: message.body ? 1 : 0 }}>
                {message.attachments.map((attachment, idx) => {
                  const fileUrl = attachment.startsWith('http') ? attachment : `${CONFIG.serverUrl}${attachment}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                  const fileName = attachment.split('/').pop() || `Attachment ${idx + 1}`;

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
                            color: USER_COLORS.gold,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          <Iconify icon="eva:attach-2-fill" width={16} />
                          <Typography sx={{ fontSize: 12 }}>{fileName}</Typography>
                        </Link>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            ) : null}
          </Box>
        </Stack>

        {isMe ? (
          <Avatar
            src={userAvatar}
            sx={{
              width: 40,
              height: 40,
              bgcolor: goldAlpha(0.2),
              border: `1px solid ${goldAlpha(0.4)}`,
              fontWeight: 700,
            }}
          >
            {userInitial}
          </Avatar>
        ) : null}
      </Stack>
    </Box>
  );
}
