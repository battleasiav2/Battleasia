import { useState } from 'react';

import {
  Box,
  Stack,
  Dialog,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { toast } from 'react-hot-toast';

import { Iconify } from 'src/components/iconify';
import {
  GLASS_CARD_RADIUS,
  getDefaultGlassTokens,
  getGlassInnerSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS, userGlassDialogPaperSx, userGoldButtonSx } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { getMatchRoomCredentialsApi } from 'src/contexts/api/games';

import type { IMatch } from '../match-types';

// ----------------------------------------------------------------------

type MatchRoomDialogProps = {
  match: IMatch;
  trigger: React.ReactNode;
};

type RoomCredentials = {
  roomId: string;
  password: string;
  matchName: string;
  map?: string;
};

export function MatchRoomDialog({ match, trigger }: MatchRoomDialogProps) {
  const { t } = useTranslate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<RoomCredentials | null>(null);
  const tokens = getDefaultGlassTokens();

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    setLoading(true);
    setCredentials(null);

    try {
      const response = await getMatchRoomCredentialsApi(match.id);
      const data = response?.data?.data;
      if (!response?.data?.status || !data) {
        throw new Error(response?.data?.message || t('match.notJoined'));
      }
      setCredentials({
        roomId: data.roomId || '',
        password: data.password || '',
        matchName: data.matchName || match.matchName,
        map: data.map || match.map,
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('match.notJoined');
      toast.error(message);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (value: string | undefined, label: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success(t('match.labelCopied', { label }));
  };

  const handleCopyAll = () => {
    if (!credentials) return;
    const text = `${t('match.roomId')}: ${credentials.roomId || '-'}\n${t('match.password')}: ${credentials.password || '-'}`;
    navigator.clipboard.writeText(text);
    toast.success(t('match.labelCopied', { label: t('match.roomCredentials') }));
  };

  return (
    <>
      <Box component="span" onClick={handleOpen} sx={{ display: 'inline-flex' }}>
        {trigger}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            ...userGlassDialogPaperSx,
            maxWidth: 420,
            overflow: 'hidden',
            border: `1px solid ${alpha(USER_COLORS.gold, 0.28)}`,
            backgroundImage: `
              linear-gradient(180deg, ${alpha(USER_COLORS.gold, 0.08)} 0%, transparent 28%),
              linear-gradient(180deg, ${alpha('#0a0a0a', 0.96)} 0%, #050505 100%)
            `,
          },
        }}
      >
        <Box
          sx={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${USER_COLORS.gold}, transparent)`,
          }}
        />

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.25 }}>
            <Box sx={{ minWidth: 0, pr: 1 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: alpha(USER_COLORS.gold, 0.9),
                  mb: 0.5,
                }}
              >
                {t('match.joinedAccess')}
              </Typography>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 20, sm: 22 },
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  letterSpacing: 0.4,
                  lineHeight: 1.15,
                }}
              >
                {t('match.roomCredentials')}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                color: alpha('#ffffff', 0.7),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                borderRadius: `${GLASS_CARD_RADIUS}px`,
                '&:hover': { bgcolor: alpha('#ffffff', 0.08) },
              }}
            >
              <Iconify icon="solar:close-circle-bold" width={20} />
            </IconButton>
          </Stack>

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={32} sx={{ color: USER_COLORS.gold }} />
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  ...getGlassInnerSx(tokens, { p: 1.75 }),
                  borderColor: alpha(USER_COLORS.gold, 0.22),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: USER_COLORS.textMuted,
                    textTransform: 'uppercase',
                    mb: 0.5,
                  }}
                >
                  {t('match.title')}
                </Typography>
                <Typography
                  className="font-tr"
                  sx={{ fontSize: 16, fontWeight: 800, color: USER_COLORS.gold, lineHeight: 1.3 }}
                >
                  {credentials?.matchName || match.matchName}
                </Typography>
                {credentials?.map ? (
                  <Typography sx={{ mt: 0.5, fontSize: 12, color: USER_COLORS.textMuted }}>
                    {t('match.map')}: {credentials.map}
                  </Typography>
                ) : null}
              </Box>

              {(
                [
                  { label: t('match.roomId'), value: credentials?.roomId, icon: 'solar:gameboy-bold' },
                  { label: t('match.password'), value: credentials?.password, icon: 'solar:lock-password-bold' },
                ] as const
              ).map((field) => (
                <Box
                  key={field.label}
                  sx={{
                    p: 1.75,
                    borderRadius: `${GLASS_CARD_RADIUS}px`,
                    bgcolor: alpha('#000000', 0.45),
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                    <Iconify icon={field.icon} width={14} sx={{ color: USER_COLORS.gold }} />
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        color: USER_COLORS.textMuted,
                        textTransform: 'uppercase',
                      }}
                    >
                      {field.label}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography
                      sx={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 18,
                        fontWeight: 700,
                        color: field.value ? USER_COLORS.textPrimary : USER_COLORS.textMuted,
                        wordBreak: 'break-all',
                        letterSpacing: 0.4,
                      }}
                    >
                      {field.value || t('match.notAvailable')}
                    </Typography>
                    <IconButton
                      size="small"
                      disabled={!field.value}
                      onClick={() => handleCopy(field.value, field.label)}
                      sx={{
                        flexShrink: 0,
                        color: USER_COLORS.gold,
                        border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                        borderRadius: `${GLASS_CARD_RADIUS}px`,
                        bgcolor: alpha(USER_COLORS.gold, 0.08),
                        '&:hover': { bgcolor: alpha(USER_COLORS.gold, 0.16) },
                        '&.Mui-disabled': { opacity: 0.35 },
                      }}
                    >
                      <Iconify icon="solar:copy-bold" width={16} />
                    </IconButton>
                  </Stack>
                </Box>
              ))}

              <Button
                fullWidth
                variant="outlined"
                disableElevation
                onClick={handleCopyAll}
                disabled={!credentials?.roomId && !credentials?.password}
                startIcon={<Iconify icon="solar:copy-bold" width={16} />}
                sx={{ ...userGoldButtonSx, mt: 0.5, py: 1.1 }}
              >
                {t('match.copyAllCredentials')}
              </Button>

              <Typography
                sx={{
                  fontSize: 11,
                  color: alpha('#ffffff', 0.45),
                  textAlign: 'center',
                  lineHeight: 1.45,
                }}
              >
                {t('match.roomPrivateHint')}
              </Typography>
            </Stack>
          )}
        </Box>
      </Dialog>
    </>
  );
}
