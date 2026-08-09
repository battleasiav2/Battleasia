import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { useAppDownload } from 'src/hooks/use-app-download';
import { useTranslate } from 'src/locales/use-locales';

import { USER_COLORS } from '../user/user-theme';

// ----------------------------------------------------------------------

type NavApkBannerProps = {
  compact?: boolean;
};

/**
 * Sidebar APK promo — only renders when app download is enabled in settings.
 */
export function NavApkBanner({ compact = false }: NavApkBannerProps) {
  const { t } = useTranslate();
  const appDownload = useAppDownload();

  if (appDownload.loading || !appDownload.enabled || !appDownload.href) {
    return null;
  }

  if (compact) {
    return (
      <Box sx={{ px: 0.75, pb: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Button
          component="a"
          href={appDownload.href}
          download={appDownload.fileName}
          aria-label={t('navigation.downloadApk')}
          sx={{
            minWidth: 44,
            width: 44,
            height: 44,
            p: 0,
            borderRadius: `${GLASS_CARD_RADIUS}px`,
            border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}`,
            bgcolor: alpha(USER_COLORS.gold, 0.12),
            color: USER_COLORS.gold,
            '&:hover': {
              bgcolor: alpha(USER_COLORS.gold, 0.22),
              borderColor: alpha(USER_COLORS.gold, 0.7),
            },
          }}
        >
          <Iconify icon="solar:download-bold" width={20} />
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mx: 2,
        mb: 1.5,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${GLASS_CARD_RADIUS}px`,
        border: `1px solid ${alpha(USER_COLORS.gold, 0.32)}`,
        background: `
          linear-gradient(145deg, ${alpha(USER_COLORS.gold, 0.16)} 0%, ${alpha('#000000', 0.55)} 42%, ${alpha('#0a0a0a', 0.92)} 100%)
        `,
        boxShadow: `
          inset 0 1px 0 ${alpha('#ffffff', 0.08)},
          0 10px 28px ${alpha('#000000', 0.45)}
        `,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -28,
          right: -24,
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(USER_COLORS.gold, 0.35)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={1.25} sx={{ position: 'relative', p: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: `${GLASS_CARD_RADIUS}px`,
              bgcolor: alpha(USER_COLORS.gold, 0.16),
              border: `1px solid ${alpha(USER_COLORS.gold, 0.4)}`,
              color: USER_COLORS.gold,
            }}
          >
            <Iconify icon="solar:smartphone-2-bold" width={22} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: alpha(USER_COLORS.gold, 0.9),
                lineHeight: 1.2,
              }}
            >
              {t('navigation.apkBannerEyebrow')}
            </Typography>
            <Typography
              className="font-tr"
              sx={{
                mt: 0.35,
                fontSize: 14,
                fontWeight: 800,
                color: USER_COLORS.textPrimary,
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {t('navigation.downloadApk')}
            </Typography>
          </Box>
        </Stack>

        <Typography
          sx={{
            fontSize: 11,
            color: alpha('#ffffff', 0.58),
            lineHeight: 1.45,
          }}
        >
          {t('navigation.apkBannerHint')}
        </Typography>

        <Button
          component="a"
          href={appDownload.href}
          download={appDownload.fileName}
          fullWidth
          startIcon={<Iconify icon="solar:download-bold" width={16} />}
          sx={{
            py: 1,
            minHeight: 36,
            borderRadius: `${GLASS_CARD_RADIUS}px`,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: '#111',
            bgcolor: USER_COLORS.gold,
            border: `1px solid ${alpha('#fff', 0.15)}`,
            boxShadow: `0 6px 18px ${alpha(USER_COLORS.gold, 0.28)}`,
            '&:hover': {
              bgcolor: USER_COLORS.goldLight,
              boxShadow: `0 8px 22px ${alpha(USER_COLORS.gold, 0.38)}`,
            },
          }}
        >
          {t('home.downloadApkButton')}
        </Button>
      </Stack>
    </Box>
  );
}
