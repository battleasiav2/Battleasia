import type { SxProps, Theme } from '@mui/material/styles';

import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { useAppDownload } from 'src/hooks/use-app-download';
import { useTranslate } from 'src/locales/use-locales';
import { startAppDownload } from 'src/utils/app-download-url';

import { USER_COLORS } from '../user/user-theme';

// ----------------------------------------------------------------------

const LOGO_SRC = `${CONFIG.assetsDir}/logo/logo.webp`;

type NavApkBannerProps = {
  /** Close parent drawer/menu after tap */
  onNavigate?: () => void;
  sx?: SxProps<Theme>;
};

/**
 * APK promo banner — only renders when app download is enabled in settings.
 */
export function NavApkBanner({ onNavigate, sx }: NavApkBannerProps) {
  const { t } = useTranslate();
  const appDownload = useAppDownload();

  if (appDownload.loading || !appDownload.enabled || !appDownload.href) {
    return null;
  }

  return (
    <Box
      sx={[
        {
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
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
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
              bgcolor: alpha(USER_COLORS.gold, 0.1),
              border: `1px solid ${alpha(USER_COLORS.gold, 0.4)}`,
              overflow: 'hidden',
              p: 0.4,
            }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt="BattleAsia"
              width={32}
              height={32}
              sx={{ width: 1, height: 1, objectFit: 'contain', display: 'block' }}
            />
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
          onClick={(event) => {
            event.preventDefault();
            startAppDownload(appDownload.href, appDownload.fileName);
            onNavigate?.();
          }}
          startIcon={<Iconify icon="solar:download-bold" width={16} />}
          sx={{
            py: 1,
            minHeight: 36,
            borderRadius: 0,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: USER_COLORS.gold,
            bgcolor: alpha('#0a0a0c', 0.72),
            border: `1.5px solid ${USER_COLORS.gold}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.05)}, 0 6px 18px ${alpha('#000000', 0.35)}`,
            '&:hover': {
              color: USER_COLORS.goldLight,
              bgcolor: alpha('#121214', 0.88),
              borderColor: USER_COLORS.goldLight,
              boxShadow: `0 0 18px ${alpha(USER_COLORS.gold, 0.18)}`,
            },
          }}
        >
          {t('home.downloadApkButton')}
        </Button>
      </Stack>
    </Box>
  );
}
