import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { USER_COLORS, userMutedTextSx, userPageTitleSx } from './user-theme';

// ----------------------------------------------------------------------

type UserPageTitleProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function UserPageTitle({ title, subtitle, badge, action, sx }: UserPageTitleProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      justifyContent="space-between"
      spacing={2}
      sx={[{ mb: { xs: 2.5, md: 3.5 } }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      <Box sx={{ minWidth: 0 }}>
        {badge ? (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: alpha(USER_COLORS.gold, 0.9),
              mb: 0.75,
            }}
          >
            {badge}
          </Typography>
        ) : null}

        <Typography className="font-tr" sx={userPageTitleSx}>
          {title}
        </Typography>

        {subtitle ? (
          <Typography
            className="font-tr"
            sx={{ ...userMutedTextSx, mt: 0.75, fontSize: { xs: 13, md: 15 }, maxWidth: 640 }}
          >
            {subtitle}
          </Typography>
        ) : null}

        <BattleGoldDivider variant="title" />
      </Box>

      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  );
}
