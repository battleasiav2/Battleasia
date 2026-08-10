import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { GLASS_CARD_RADIUS, getGoldTopLineShellSx, mergeGlassSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from './user-theme';
import { UserActionButton } from './user-action-button';

// ----------------------------------------------------------------------

type UserEmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  sx?: SxProps<Theme>;
};

export function UserEmptyState({
  icon = 'solar:inbox-line-bold-duotone',
  title,
  description,
  actionLabel,
  onAction,
  sx,
}: UserEmptyStateProps) {
  return (
    <Box
      sx={mergeGlassSx(
        getGoldTopLineShellSx({
          width: 1,
          py: { xs: 6, md: 8 },
          px: 3,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderColor: alpha('#ffffff', 0.14),
        }),
        sx
      )}
    >
      <Stack alignItems="center" justifyContent="center" spacing={2}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: `${GLASS_CARD_RADIUS}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(USER_COLORS.gold, 0.1),
            border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
            color: USER_COLORS.gold,
          }}
        >
          <Iconify icon={icon} width={36} />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: { xs: 20, md: 24 },
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              letterSpacing: 0.02,
            }}
          >
            {title}
          </Typography>

          {description ? (
            <Typography sx={{ mt: 1, color: USER_COLORS.textMuted, maxWidth: 420, mx: 'auto' }}>
              {description}
            </Typography>
          ) : null}
        </Box>

        {actionLabel && onAction ? (
          <UserActionButton actionVariant="gold" onClick={onAction}>
            {actionLabel}
          </UserActionButton>
        ) : null}
      </Stack>
    </Box>
  );
}
