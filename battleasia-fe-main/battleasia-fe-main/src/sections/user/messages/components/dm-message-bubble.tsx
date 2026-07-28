import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fToNow } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';
import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { USER_COLORS, userMutedTextSx } from 'src/layouts/user';

import type { DmMessage } from '../messages-types';

// ----------------------------------------------------------------------

type DmMessageBubbleProps = {
  message: DmMessage;
  youLabel: string;
};

export function DmMessageBubble({ message, youLabel }: DmMessageBubbleProps) {
  const tokens = getDefaultGlassTokens();
  const isMe = message.isMine;

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="flex-start"
        sx={{ maxWidth: { xs: '92%', sm: '78%' }, flexDirection: isMe ? 'row-reverse' : 'row' }}
      >
        <Avatar
          src={getImageUrl(message.senderAvatar)}
          alt={message.senderName}
          sx={{
            width: 36,
            height: 36,
            bgcolor: alpha(USER_COLORS.gold, isMe ? 0.2 : 0.1),
            border: `1px solid ${alpha(USER_COLORS.gold, 0.3)}`,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {message.senderName?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Stack alignItems={isMe ? 'flex-end' : 'flex-start'} sx={{ minWidth: 0 }}>
          <Typography sx={{ mb: 0.5, ...userMutedTextSx, fontSize: 11, px: 0.5 }}>
            {isMe ? youLabel : message.senderName} · {fToNow(message.createdAt)}
          </Typography>

          <Box
            sx={getGlassInnerSx(tokens, {
              px: 1.75,
              py: 1.25,
              maxWidth: '100%',
              wordBreak: 'break-word',
              borderColor: isMe ? alpha(USER_COLORS.gold, 0.35) : undefined,
              bgcolor: isMe ? alpha(USER_COLORS.gold, 0.14) : alpha('#ffffff', 0.05),
            })}
          >
            {message.body ? (
              <Typography sx={{ fontSize: 14, color: USER_COLORS.textSubtle }}>{message.body}</Typography>
            ) : null}

            {message.attachments?.length ? (
              <Stack spacing={1} sx={{ mt: message.body ? 1 : 0 }}>
                {message.attachments.map((attachment, idx) => {
                  const fileUrl = attachment.startsWith('http') ? attachment : `${CONFIG.serverUrl}${attachment}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                  const fileName = attachment.split('/').pop() || `Attachment ${idx + 1}`;

                  return isImage ? (
                    <Box
                      key={idx}
                      component="img"
                      src={fileUrl}
                      alt={fileName}
                      sx={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 0 }}
                    />
                  ) : (
                    <Typography
                      key={idx}
                      component="a"
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: 12, color: USER_COLORS.gold, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Iconify icon="eva:attach-2-fill" width={14} />
                      {fileName}
                    </Typography>
                  );
                })}
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
