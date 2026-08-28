import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { useTranslate } from 'src/locales/use-locales';

const statIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GOLD = '#f5c518';

export function AuthHeroPanel() {
  const { t } = useTranslate();

  const stats = [
    { label: t('shop.authStatCoins'), value: 'BAC' },
    { label: t('shop.authStatMethods'), value: '5+' },
    { label: t('shop.authStatDelivery'), value: '24/7' },
  ];

  return (
    <Stack spacing={{ xs: 2.5, md: 4 }} sx={{ width: 1, maxWidth: 520, px: { md: 1 } }}>
      <Box>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: GOLD,
            textShadow: '0 1px 8px rgba(0,0,0,0.8)',
          }}
        >
          {t('shop.authHeroTagline')}
        </Typography>
        <Typography
          className="font-tr"
          sx={{
            mt: 2,
            fontSize: { xs: 32, md: 40, lg: 48 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: -0.5,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.85)',
          }}
        >
          {t('shop.authHeroTitle')}
        </Typography>
        <Typography
          sx={{
            mt: 2,
            maxWidth: 420,
            fontSize: { xs: 14, md: 15 },
            color: alpha('#ffffff', 0.58),
            lineHeight: 1.65,
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.85)',
          }}
        >
          {t('shop.authHeroSubtitle')}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          maxWidth: 420,
        }}
      >
        {stats.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: '8px',
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              bgcolor: alpha('#161618', 0.45),
              backdropFilter: 'blur(12px)',
              animation: `${statIn} 0.4s ease-out ${index * 80}ms both`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {item.value}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 11, color: alpha('#fff', 0.5) }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
