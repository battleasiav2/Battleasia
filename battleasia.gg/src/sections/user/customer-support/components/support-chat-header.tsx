import { Box, Chip, Stack, Avatar, Button, IconButton, Typography, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS, getUserChipSx, userMutedTextSx, goldAlpha } from 'src/layouts/user';

import { ADMIN_PARTICIPANT } from '../customer-support-constants';

// ----------------------------------------------------------------------

type SupportChatHeaderProps = {
  onlineLabel: string;
  loading: boolean;
  onRefresh: () => void;
  title?: string;
  category?: string;
  status?: string;
  onBack?: () => void;
  onCloseTicket?: () => void;
  closing?: boolean;
};

export function SupportChatHeader({
  onlineLabel,
  loading,
  onRefresh,
  title,
  category,
  status,
  onBack,
  onCloseTicket,
  closing,
}: SupportChatHeaderProps) {
  const isClosed = status === 'closed';

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 1.75 },
        bgcolor: alpha('#06090e', 0.92),
        borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      {onBack && (
        <IconButton
          onClick={onBack}
          size="small"
          sx={{
            color: USER_COLORS.gold,
            border: `1px solid ${goldAlpha(0.28)}`,
            borderRadius: '8px',
            '&:hover': { bgcolor: goldAlpha(0.1) },
          }}
        >
          <Iconify icon="solar:arrow-left-bold" width={18} />
        </IconButton>
      )}

      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: goldAlpha(0.12),
          border: `1px solid ${goldAlpha(0.35)}`,
          color: USER_COLORS.gold,
        }}
      >
        <Iconify icon="solar:headphones-round-sound-bold" width={20} />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          className="font-tr"
          sx={{
            color: USER_COLORS.textPrimary,
            fontWeight: 800,
            fontSize: { xs: 14, sm: 15 },
          }}
          noWrap
        >
          {title || ADMIN_PARTICIPANT.name}
        </Typography>

        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.35 }}>
          {!isClosed && (
            <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
              <Box component="span" sx={{ color: '#22c55e', fontWeight: 800 }}>
                ●
              </Box>{' '}
              {onlineLabel}
            </Typography>
          )}

          {category && (
            <Chip
              label={category}
              size="small"
              sx={{ height: 18, fontSize: 9, fontWeight: 700, textTransform: 'capitalize', ...getUserChipSx('gold') }}
            />
          )}

          {status && (
            <Chip
              label={status}
              size="small"
              sx={{
                height: 18,
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'capitalize',
                ...getUserChipSx(status === 'closed' ? 'neutral' : status === 'pending' ? 'info' : 'success'),
              }}
            />
          )}
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.75}>
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={loading}
          sx={{ color: alpha('#ffffff', 0.55), '&:hover': { color: '#ffffff' } }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: USER_COLORS.gold }} />
          ) : (
            <Iconify icon="solar:restart-bold" width={16} />
          )}
        </IconButton>

        {onCloseTicket && !isClosed && (
          <Button
            size="small"
            onClick={onCloseTicket}
            disabled={closing || loading}
            sx={{
              color: '#ef4444',
              border: `1px solid ${alpha('#ef4444', 0.35)}`,
              bgcolor: alpha('#ef4444', 0.08),
              fontWeight: 700,
              fontSize: 11,
              textTransform: 'none',
              px: 1.25,
              minHeight: 32,
              '&:hover': { bgcolor: alpha('#ef4444', 0.16) },
            }}
          >
            {closing ? '…' : 'Close'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
