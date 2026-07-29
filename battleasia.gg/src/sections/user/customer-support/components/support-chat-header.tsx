import { Box, Stack, Avatar, Typography, IconButton, Button, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, userMutedTextSx, userErrorButtonSx, getUserChipSx } from 'src/layouts/user';

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
  const tokens = getDefaultGlassTokens();
  const isClosed = status === 'closed';

  return (
    <Box sx={getGlassInnerSx(tokens, { p: 2, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1.5 })}>
      {onBack ? (
        <IconButton onClick={onBack} sx={{ color: USER_COLORS.gold }}>
          <Iconify icon="solar:arrow-left-bold" />
        </IconButton>
      ) : (
        <Avatar sx={{ width: 48, height: 48, bgcolor: USER_COLORS.gold, color: USER_COLORS.surface, fontWeight: 800 }}>
          {ADMIN_PARTICIPANT.name.charAt(0)}
        </Avatar>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 800, fontSize: 15 }} noWrap>
          {title || ADMIN_PARTICIPANT.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {!isClosed && (
            <>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: USER_COLORS.success,
                  boxShadow: `0 0 8px ${alpha(USER_COLORS.success, 0.7)}`,
                }}
              />
              <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>{onlineLabel}</Typography>
            </>
          )}
          {category ? (
            <Chip label={category} size="small" sx={{ height: 20, fontSize: 10, ...getUserChipSx('gold') }} />
          ) : null}
          {status ? (
            <Chip
              label={status}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                ...getUserChipSx(status === 'closed' ? 'neutral' : status === 'pending' ? 'info' : 'success'),
              }}
            />
          ) : null}
        </Stack>
      </Box>

      {onCloseTicket && !isClosed ? (
        <Button
          size="small"
          variant="outlined"
          disableElevation
          onClick={onCloseTicket}
          disabled={closing || loading}
          startIcon={<Iconify icon="solar:close-circle-bold" width={16} />}
          sx={{
            ...userErrorButtonSx,
            textTransform: 'none',
            minWidth: 0,
            px: 1.25,
            py: 0.65,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Close
        </Button>
      ) : null}

      <IconButton onClick={onRefresh} disabled={loading} sx={{ color: USER_COLORS.gold }}>
        <Iconify icon="solar:refresh-bold" />
      </IconButton>
    </Box>
  );
}
