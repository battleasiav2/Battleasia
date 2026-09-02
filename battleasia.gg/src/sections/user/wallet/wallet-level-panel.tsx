import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { UserGlassCard, USER_COLORS, userMutedTextSx, getUserChipSx, goldAlpha } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

import { EARN_HUB_GOLD } from './wallet-earn-hub-styles';

export type LevelTitleState = {
  level: number;
  title: string;
  icon: string;
};

export type LevelState = {
  enabled: boolean;
  xp?: number;
  level?: number;
  xpIntoLevel?: number;
  xpToNext?: number;
  progressPct?: number;
  title?: LevelTitleState;
  nextTitle?: LevelTitleState | null;
};

type Props = {
  level: LevelState | null;
};

export function WalletLevelPanel({ level }: Props) {
  const { t } = useTranslate();

  if (!level?.enabled) return null;

  const currentLevel = level.level ?? 1;
  const xpInto = level.xpIntoLevel ?? 0;
  const xpToNext = level.xpToNext ?? 0;
  const percent = level.progressPct ?? (xpToNext > 0 ? Math.min((xpInto / xpToNext) * 100, 100) : 100);
  const title = level.title?.title || t('wallet.levelDefaultTitle');
  const icon = level.title?.icon || 'solar:user-bold';

  return (
    <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.25,
              display: 'grid',
              placeItems: 'center',
              bgcolor: goldAlpha( 0.12),
              border: `1px solid ${goldAlpha( 0.28)}`,
              color: EARN_HUB_GOLD,
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={22} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                className="font-tr"
                sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}
              >
                {t('wallet.levelTitle')}
              </Typography>
              <Box
                component="span"
                sx={{
                  ...getUserChipSx('gold'),
                  fontSize: 10,
                  px: 0.75,
                  py: 0.15,
                  height: 'auto',
                }}
              >
                {t('wallet.levelBadge', { level: currentLevel })}
              </Box>
            </Stack>
            <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.25 }}>
              {title}
              {level.nextTitle
                ? ` · ${t('wallet.levelNextTitle', { title: level.nextTitle.title, level: level.nextTitle.level })}`
                : ''}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: EARN_HUB_GOLD, whiteSpace: 'nowrap' }}>
            {t('wallet.levelXpTotal', { xp: level.xp ?? 0 })}
          </Typography>
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
              {xpToNext > 0
                ? t('wallet.levelXpProgress', { current: xpInto, target: xpToNext })
                : t('wallet.levelMax')}
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: USER_COLORS.textPrimary }}>
              {Math.round(percent)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: alpha('#ffffff', 0.08),
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                bgcolor: EARN_HUB_GOLD,
              },
            }}
          />
        </Box>
      </Stack>
    </UserGlassCard>
  );
}
