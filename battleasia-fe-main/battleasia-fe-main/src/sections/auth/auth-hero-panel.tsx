import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { useTranslate } from 'src/locales/use-locales';
import { GlassStatTile, getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AuthHeroPanel() {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  const features = [
    { icon: 'solar:cup-star-bold-duotone', text: t('home.stats.tournaments') },
    { icon: 'solar:wallet-money-bold-duotone', text: t('home.stats.prizeMoney') },
    { icon: 'solar:users-group-rounded-bold-duotone', text: t('home.stats.activePlayers') },
  ];

  return (
    <Stack spacing={3} sx={{ width: 1, maxWidth: 480, px: { md: 2 } }}>
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
          {t('common.brandTagline')}
        </Typography>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { md: 38, lg: 46 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.08,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.85)',
          }}
        >
          {t('home.title')}
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            fontSize: { md: 16, lg: 18 },
            color: alpha('#ffffff', 0.88),
            lineHeight: 1.45,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)',
          }}
        >
          {t('home.subtitle')}
        </Typography>
        <BattleGoldDivider variant="hero" sx={{ mt: 2.5, width: 200 }} />
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
        {features.map((item) => (
          <Stack
            key={item.text}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: '2px',
              bgcolor: alpha('#000000', 0.45),
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Iconify icon={item.icon} width={20} sx={{ color: '#f59e0b' }} />
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
        <GlassStatTile label={t('home.stats.activePlayers')} value="10K+" tokens={glassTokens} />
        <GlassStatTile label={t('home.stats.prizeMoney')} value="BAC" tokens={glassTokens} />
        <GlassStatTile label={t('home.stats.gamesSupported')} value="5+" tokens={glassTokens} />
      </Box>
    </Stack>
  );
}
