import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { GlassStatTile, getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { useTranslate } from 'src/locales/use-locales';
import { userPageDividerSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

export function AuthHeroPanel() {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  const features = [
    { icon: 'solar:bolt-bold-duotone', text: t('shop.authFeatureInstant') },
    { icon: 'solar:shield-check-bold-duotone', text: t('shop.authFeatureSecure') },
    { icon: 'solar:wallet-money-bold-duotone', text: t('shop.authFeaturePayments') },
  ];

  return (
    <Stack
      spacing={3}
      sx={{
        width: 1,
        maxWidth: 480,
        px: { md: 2 },
        animation: `${fadeUp} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
        animationDelay: '0.12s',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: alpha('#f5c518', 0.9),
            mb: 1.5,
          }}
        >
          {t('shop.authHeroTagline')}
        </Typography>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { md: 40, lg: 48 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.05,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.85)',
          }}
        >
          {t('shop.authHeroTitle')}
        </Typography>
        <Typography
          sx={{
            mt: 1.75,
            fontSize: { md: 16, lg: 17 },
            color: alpha('#ffffff', 0.86),
            lineHeight: 1.5,
            maxWidth: 420,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)',
          }}
        >
          {t('shop.authHeroSubtitle')}
        </Typography>
        <Box sx={{ ...userPageDividerSx, mt: 2.5, width: 200 }} />
      </Box>

      <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {features.map((item) => (
          <Stack
            key={item.text}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 0,
              bgcolor: alpha('#000000', 0.45),
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Iconify icon={item.icon} width={18} sx={{ color: '#f5c518' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: alpha('#fff', 0.9) }}>
              {item.text}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
        }}
      >
        <GlassStatTile icon="solar:wallet-money-bold" label={t('shop.authStatCoins')} value="BAC" tokens={glassTokens} />
        <GlassStatTile icon="solar:card-transfer-bold" label={t('shop.authStatMethods')} value="5+" tokens={glassTokens} />
        <GlassStatTile icon="solar:clock-circle-bold" label={t('shop.authStatDelivery')} value="24/7" tokens={glassTokens} />
      </Box>
    </Stack>
  );
}
