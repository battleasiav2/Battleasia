import { Box, Stack, Avatar, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fToNow } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';
import { USER_COLORS, userMutedTextSx, goldAlpha } from 'src/layouts/user';

import type { DmConversation } from '../messages-types';

// ----------------------------------------------------------------------

type ConversationListProps = {
  conversations: DmConversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversation: DmConversation) => void;
};

export function ConversationList({ conversations, loading, selectedId, onSelect }: ConversationListProps) {
  if (loading) {
    return (
      <Stack spacing={1} sx={{ p: 1.5 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Stack key={index} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="90%" />
            </Box>
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.5} sx={{ p: 1 }}>
      {conversations.map((conversation) => {
        const selected = conversation.id === selectedId;
        return (
          <Stack
            key={conversation.id}
            direction="row"
            spacing={1.5}
            alignItems="center"
            onClick={() => onSelect(conversation)}
            sx={{
              p: 1.25,
              cursor: 'pointer',
              border: `1px solid ${selected ? goldAlpha(0.35) : alpha('#ffffff', 0.08)}`,
              bgcolor: selected ? goldAlpha(0.08) : alpha('#000000', 0.25),
              transition: 'border-color 0.2s, background-color 0.2s',
              '&:hover': {
                borderColor: goldAlpha(0.28),
                bgcolor: goldAlpha(0.05),
              },
            }}
          >
            <Avatar
              src={getImageUrl(conversation.participant.avatar)}
              alt={conversation.participant.username}
              sx={{
                width: 44,
                height: 44,
                border: `1px solid ${goldAlpha(0.25)}`,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: USER_COLORS.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {conversation.participant.username}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 10, flexShrink: 0 }}>
                  {fToNow(conversation.lastMessageAt)}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  ...userMutedTextSx,
                  fontSize: 12,
                  mt: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {conversation.lastMessagePreview || '—'}
              </Typography>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}
