import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
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
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

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

type DetailRow = {
  label: string;
  value: string;
};

function DetailGrid({ rows }: { rows: DetailRow[] }) {
  return (
    <Grid container spacing={1.25}>
      {rows.map((row) => (
        <Grid key={row.label} size={{ xs: 6 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: USER_COLORS.textMuted, mb: 0.35 }}>
            {row.label}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.textPrimary, lineHeight: 1.35 }}>
            {row.value}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
}

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

  const detailRows: DetailRow[] = match
    ? [
        { label: t('match.game'), value: match.gameName || '-' },
        {
          label: t('match.schedule'),
          value: match.matchSchedule ? fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a') : '-',
        },
        { label: t('match.teamType'), value: match.teamType || '-' },
        { label: t('match.players'), value: String(match.totalPlayer ?? '-') },
        { label: t('match.map'), value: match.map || '-' },
        { label: t('match.typeLabel'), value: match.matchType || '-' },
      ]
    : [];

  return (
    <Dialog
      open={!!match}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          ...userGlassDialogPaperSx,
          maxWidth: 480,
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {match ? (
        <>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1.5,
              px: { xs: 2.5, md: 3 },
              pt: { xs: 2.5, md: 3 },
              pb: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 18, sm: 22 },
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  lineHeight: 1.15,
                }}
              >
                {t('match.confirmEntry')}
              </Typography>
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 13,
                  color: USER_COLORS.textMuted,
                  lineHeight: 1.5,
                }}
              >
                {t('match.joinMatchFor', { name: match.matchName })}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: USER_COLORS.textMuted, mt: -0.5, mr: -0.5 }}>
              <Iconify icon="eva:close-fill" width={22} />
            </IconButton>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{
              px: { xs: 2.5, md: 3 },
              py: 2,
              borderColor: alpha('#ffffff', 0.08),
              flex: 1,
              minHeight: 0,
            }}
          >
            <Scrollbar sx={{ maxHeight: { xs: 'calc(100vh - 280px)', sm: 420 } }}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.75,
                    py: 1.25,
                    borderRadius: `${GLASS_CARD_RADIUS}px`,
                    bgcolor: alpha(USER_COLORS.gold, 0.1),
                    border: `1px solid ${alpha(USER_COLORS.gold, 0.28)}`,
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
                    {t('match.entryFee')}
                  </Typography>
                  <CoinValue value={match.entryFee ?? 0} size={20} textSx={{ fontWeight: 800, color: USER_COLORS.gold, fontSize: 16 }} />
                </Stack>

                {match.map ? (
                  <Box
                    sx={{
                      width: 1,
                      height: { xs: 150, sm: 168 },
                      borderRadius: `${GLASS_CARD_RADIUS}px`,
                      overflow: 'hidden',
                      position: 'relative',
                      border: `1px solid ${alpha('#ffffff', 0.08)}`,
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
                        inset: 0,
                        background: `linear-gradient(180deg, transparent 45%, ${alpha('#000000', 0.82)} 100%)`,
                      }}
                    />
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, px: 1.5, py: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: alpha('#ffffff', 0.72), textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {t('match.map')}
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                        {match.map}
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                <Box sx={getGlassInnerSx(tokens, { p: 1.75 })}>
                  <DetailGrid rows={detailRows} />
                </Box>

                <Stack
                  spacing={1.25}
                  sx={{
                    p: 1.75,
                    borderRadius: `${GLASS_CARD_RADIUS}px`,
                    bgcolor: alpha('#ffffff', 0.03),
                    border: `1px solid ${alpha('#ffffff', 0.08)}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
                      {t('match.perKill')}
                    </Typography>
                    <CoinValue value={match.perKill ?? 0} size={18} textSx={{ fontWeight: 700, color: USER_COLORS.textPrimary }} />
                  </Stack>

                  {match.prizeDescription ? (
                    <>
                      <Divider sx={{ borderColor: alpha('#ffffff', 0.08) }} />
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: USER_COLORS.textMuted, textTransform: 'uppercase', mb: 0.5 }}>
                          {t('match.prize')}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: USER_COLORS.textPrimary, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                          {match.prizeDescription}
                        </Typography>
                      </Box>
                    </>
                  ) : null}
                </Stack>
              </Stack>
            </Scrollbar>
          </DialogContent>

          <DialogActions
            sx={{
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 1.5,
              px: { xs: 2.5, md: 3 },
              py: { xs: 2, md: 2.5 },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: `${GLASS_CARD_RADIUS}px`,
                bgcolor: insufficient ? alpha(USER_COLORS.error, 0.12) : alpha(USER_COLORS.success, 0.12),
                border: `1px solid ${insufficient ? alpha(USER_COLORS.error, 0.35) : alpha(USER_COLORS.success, 0.35)}`,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
                {t('match.yourBalance')}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CoinValue value={balance} size={16} textSx={{ fontWeight: 700 }} />
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
                variant="outlined"
                disableElevation
                onClick={onConfirm}
                disabled={joining || insufficient}
                sx={userGoldButtonSx}
              >
                {t('match.joinMatch')}
              </Button>
            </Stack>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
