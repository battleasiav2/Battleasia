import {
  Box,
  Stack,
  Button,
  Dialog,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales/use-locales';

import {
  getDefaultGlassTokens,
  getGlassInnerSx,
  GLASS_CARD_RADIUS,
} from 'src/components/battle-glass-card';
import CoinValue from 'src/components/coin-value';

import {
  USER_COLORS,
  userGlassDialogPaperSx,
  userGoldButtonSx,
  userGhostButtonSx,
} from 'src/layouts/user';

import type { IMatch } from '../match-types';

// ----------------------------------------------------------------------

type MatchJoinDialogProps = {
  match: IMatch | null;
  balance: number;
  joining: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function MatchJoinDialog({
  match,
  balance,
  joining,
  onClose,
  onConfirm,
}: MatchJoinDialogProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();
  const insufficient = (match?.entryFee ?? 0) > balance;

  return (
    <Dialog
      open={!!match}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: userGlassDialogPaperSx }}
    >
      {match ? (
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography
            className="font-tr"
            sx={{
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: USER_COLORS.textPrimary,
              mb: 0.5,
            }}
          >
            {t('match.confirmEntry')}
          </Typography>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 14, color: USER_COLORS.textMuted }}>
              {t('match.joinMatchFor', { name: match.matchName })}
            </Typography>
            <CoinValue value={match.entryFee ?? 0} size={18} />
            <Typography sx={{ fontSize: 14, color: USER_COLORS.textMuted }}>?</Typography>
          </Stack>

          {match.map ? (
            <Box
              sx={{
                width: 1,
                height: 200,
                borderRadius: `${GLASS_CARD_RADIUS}px`,
                overflow: 'hidden',
                position: 'relative',
                mb: 2,
              }}
            >
              <Box
                component="img"
                src={`/assets/images/map/${match.map}.webp`}
                alt={match.map}
                sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: alpha('#000000', 0.65),
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                  {match.map}
                </Typography>
              </Box>
            </Box>
          ) : null}

          <Stack spacing={1} sx={getGlassInnerSx(tokens, { p: 2, mb: 2 })}>
            {[
              { label: t('match.game'), value: match.gameName || '-' },
              { label: t('match.schedule'), value: match.matchSchedule ? fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a') : '-' },
              { label: t('match.teamType'), value: match.teamType || '-' },
              { label: t('match.players'), value: String(match.totalPlayer ?? '-') },
              { label: t('match.map'), value: match.map || '-' },
              { label: t('match.type'), value: match.matchType || '-' },
            ].map((row) => (
              <Stack key={row.label} direction="row" justifyContent="space-between" spacing={2}>
                <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: USER_COLORS.textPrimary, textAlign: 'right' }}>
                  {row.value}
                </Typography>
              </Stack>
            ))}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{t('match.entryFee')}</Typography>
              <CoinValue value={match.entryFee ?? 0} size={18} />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{t('match.perKill')}</Typography>
              <CoinValue value={match.perKill ?? 0} size={18} />
            </Stack>

            {match.prizeDescription ? (
              <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{t('match.prize')}</Typography>
                <Typography sx={{ fontSize: 13, color: USER_COLORS.textPrimary }}>{match.prizeDescription}</Typography>
              </Stack>
            ) : null}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 1.5,
              py: 1.25,
              mb: 2.5,
              borderRadius: `${GLASS_CARD_RADIUS}px`,
              bgcolor: insufficient ? alpha(USER_COLORS.error, 0.12) : alpha(USER_COLORS.success, 0.12),
              border: `1px solid ${insufficient ? alpha(USER_COLORS.error, 0.35) : alpha(USER_COLORS.success, 0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{t('match.yourBalance')}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <CoinValue value={balance} size={16} />
              {insufficient ? (
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: USER_COLORS.error }}>
                  {t('match.insufficient')}
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose} sx={userGhostButtonSx}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              disabled={joining || insufficient}
              sx={userGoldButtonSx}
            >
              {t('match.joinMatch')}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Dialog>
  );
}
