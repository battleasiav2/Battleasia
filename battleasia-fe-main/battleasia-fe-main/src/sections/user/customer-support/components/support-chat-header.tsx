import { Box, Stack, Avatar, Typography, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, userMutedTextSx } from 'src/layouts/user';

import { ADMIN_PARTICIPANT } from '../customer-support-constants';

// ----------------------------------------------------------------------

type SupportChatHeaderProps = {
  onlineLabel: string;
  loading: boolean;
  onRefresh: () => void;
};

export function SupportChatHeader({ onlineLabel, loading, onRefresh }: SupportChatHeaderProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box sx={getGlassInnerSx(tokens, { p: 2, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2 })}>
      <Avatar sx={{ width: 48, height: 48, bgcolor: USER_COLORS.gold, color: USER_COLORS.surface, fontWeight: 800 }}>
        {ADMIN_PARTICIPANT.name.charAt(0)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 800, fontSize: 16 }}>
          {ADMIN_PARTICIPANT.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
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
        </Stack>
      </Box>

      <IconButton onClick={onRefresh} disabled={loading} sx={{ color: USER_COLORS.gold }}>
        <Iconify icon="solar:refresh-bold" />
      </IconButton>
    </Box>
  );
}
