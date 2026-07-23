import { Box, Stack, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { toast } from 'react-hot-toast';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassShellSx, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

import { useTranslate } from 'src/locales/use-locales';

import type { MatchDetailData } from '../match-types';

// ----------------------------------------------------------------------

type MatchDetailRoomPanelProps = {
  match: MatchDetailData;
  title: string;
};

export function MatchDetailRoomPanel({ match, title }: MatchDetailRoomPanelProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  const handleCopy = (value: string | undefined, label: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success(t('match.labelCopied', { label }));
  };

  return (
    <Box sx={getGlassShellSx(tokens, { p: 2 })}>
      <Typography
        className="font-tr"
        sx={{
          fontSize: 16,
          fontWeight: 800,
          textTransform: 'uppercase',
          color: USER_COLORS.gold,
          letterSpacing: 0.5,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        {[
          { label: t('match.roomId'), value: match.roomId },
          { label: t('match.password'), value: match.password },
        ].map((field) => (
          <Box key={field.label} sx={{ ...getGlassInnerSx(tokens, { p: 1.5, flex: 1 }) }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.7, color: USER_COLORS.textMuted, textTransform: 'uppercase', mb: 0.75 }}>
              {field.label}
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600, color: USER_COLORS.textPrimary, wordBreak: 'break-all' }}>
                {field.value || t('match.notAvailable')}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleCopy(field.value, field.label)}
                sx={{ color: USER_COLORS.info, flexShrink: 0 }}
              >
                <Iconify icon="solar:copy-bold" width={16} />
              </IconButton>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
