import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { useTranslate } from 'src/locales/use-locales';
import { GlassStatTile, getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';

const statIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const goldPulse = keyframes`
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.08); }
`;

export function AuthHeroPanel() {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  const features = [
    { icon: 'solar:cup-star-bold-duotone', text: t('home.stats.matchesPlayed') },
    { icon: 'solar:wallet-money-bold-duotone', text: t('home.stats.totalWon') },
    { icon: 'solar:gamepad-bold-duotone', text: t('home.stats.gamesSupported') },
  ];

  const stats = [
    { label: t('home.stats.totalWon'), value: CONFIG.homeStats.prizeMoney },
    { label: t('home.stats.matchesPlayed'), value: CONFIG.homeStats.tournaments },
    { label: t('home.stats.gamesSupported'), value: CONFIG.homeStats.gamesSupported },
  ];

  return (
    <Stack spacing={{ xs: 2, md: 3 }} sx={{ width: 1, maxWidth: 480, px: { md: 2 } }}>
      <Box
        sx={{
          order: { xs: 2, md: 1 },
          p: { xs: 1.5, md: 0 },
          borderRadius: { xs: '2px', md: 0 },
          bgcolor: { xs: alpha('#000000', 0.38), md: 'transparent' },
          border: { xs: `1px solid ${alpha('#f5c518', 0.18)}`, md: 'none' },
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: alpha('#f5c518', 0.9),
            mb: 1.25,
            textShadow: '0 1px 8px rgba(0,0,0,0.8)',
          }}
        >
          {t('auth.brandTagline')}
        </Typography>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, md: 38, lg: 44 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.08,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.85)',
          }}
        >
          {t('auth.heroHeadline')}
        </Typography>
        <Typography
          sx={{
            mt: 1.25,
            fontSize: { xs: 14, md: 16, lg: 17 },
            fontWeight: 700,
            color: alpha('#ffffff', 0.92),
            lineHeight: 1.4,
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.85)',
          }}
        >
          {t('auth.heroSubhead')}
        </Typography>
        <Typography
          sx={{
            mt: 0.75,
            fontSize: { xs: 13, md: 15 },
            color: alpha('#f5c518', 0.95),
            fontWeight: 700,
            letterSpacing: 0.3,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)',
          }}
        >
          {t('auth.heroDaily')}
        </Typography>
        <BattleGoldDivider variant="hero" sx={{ mt: 2, width: 200 }} />

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.25, mt: 2 }}>
          {features.map((item) => (
            <Stack
              key={item.text}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.25,
                py: 0.85,
                borderRadius: '2px',
                bgcolor: alpha('#000000', 0.45),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Iconify icon={item.icon} width={18} sx={{ color: '#f59e0b' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: alpha('#fff', 0.9) }}>
                {item.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          order: { xs: 1, md: 2 },
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.25,
        }}
      >
        {stats.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              animation: `${statIn} 0.4s ease-out ${index * 80}ms both, ${goldPulse} 3.4s ease-in-out ${0.6 + index * 0.25}s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <GlassStatTile label={item.label} value={item.value} tokens={glassTokens} />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
