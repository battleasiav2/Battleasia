import { useState } from 'react';

import {
  Box,
  Stack,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { toast } from 'react-hot-toast';

import { Iconify } from 'src/components/iconify';
import {
  GLASS_CARD_RADIUS,
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassInnerSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS, userGlassDialogPaperSx } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { checkMatchJoinApi } from 'src/contexts/api/games';

import type { IMatch } from '../match-types';

// ----------------------------------------------------------------------

type MatchRoomDialogProps = {
  match: IMatch;
  trigger: React.ReactNode;
};

export function MatchRoomDialog({ match, trigger }: MatchRoomDialogProps) {
  const { t } = useTranslate();
  const [open, setOpen] = useState(false);
  const tokens = getDefaultGlassTokens();

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await checkMatchJoinApi(match.id);
    if (response?.data?.data?.isJoined) {
      setOpen(true);
    } else {
      toast.error(t('match.notJoined'));
    }
  };

  const handleCopy = (value: string | undefined, label: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success(t('match.labelCopied', { label }));
  };

  return (
    <>
      <Box component="span" onClick={handleOpen} sx={{ display: 'inline-flex' }}>
        {trigger}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: userGlassDialogPaperSx }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography
              className="font-tr"
              sx={{
                fontSize: 22,
                fontWeight: 800,
                textTransform: 'uppercase',
                color: USER_COLORS.textPrimary,
                letterSpacing: 0.5,
              }}
            >
              {t('match.roomCredentials')}
            </Typography>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                color: alpha('#ffffff', 0.7),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                '&:hover': { bgcolor: alpha('#ffffff', 0.08) },
              }}
            >
              <Iconify icon="solar:close-circle-bold" width={22} />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            {[
              { label: t('match.roomId'), value: match.roomId },
              { label: t('match.password'), value: match.password },
            ].map((field) => (
              <Box key={field.label} sx={getGlassInnerSx(tokens, { p: 2 })}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: USER_COLORS.textMuted, textTransform: 'uppercase', mb: 1 }}>
                  {field.label}
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 18,
                      fontWeight: 600,
                      color: USER_COLORS.textPrimary,
                      wordBreak: 'break-all',
                    }}
                  >
                    {field.value || t('match.notAvailable')}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(field.value, field.label)}
                    sx={{ color: USER_COLORS.info, flexShrink: 0 }}
                  >
                    <Iconify icon="solar:copy-bold" width={18} />
                  </IconButton>
                </Stack>
              </Box>
            ))}

            <Box
              sx={getGlassShellSx(tokens, {
                p: 2,
                textAlign: 'center',
                borderColor: alpha(USER_COLORS.gold, 0.28),
              })}
            >
              <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {t('match.title')}
              </Typography>
              <Typography className="font-tr" sx={{ mt: 0.5, fontSize: 18, fontWeight: 800, color: USER_COLORS.gold }}>
                {match.matchName}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
}
