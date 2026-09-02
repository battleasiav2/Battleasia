import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { USER_COLORS } from './user-theme';
import { UserActionButton } from './user-action-button';
import { goldAlpha } from 'src/theme/accent-presets';

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
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={[
        {
          py: { xs: 6, md: 8 },
          px: 3,
          textAlign: 'center',
          borderRadius: `${GLASS_CARD_RADIUS}px`,
          border: `1px dashed ${alpha('#ffffff', 0.14)}`,
          bgcolor: alpha('#000000', 0.28),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: `${GLASS_CARD_RADIUS}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: goldAlpha(0.1),
          border: `1px solid ${goldAlpha(0.22)}`,
          color: USER_COLORS.gold,
        }}
      >
        <Iconify icon={icon} width={36} />
      </Box>

      <Box>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 20, md: 24 },
            fontWeight: 800,
            color: USER_COLORS.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
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
  );
}
