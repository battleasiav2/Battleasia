import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { UserGlassCard, USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

type ShopFeature = {
  icon: string;
  title: string;
  description: string;
};

type ShopFeaturesProps = {
  title: string;
  features: ShopFeature[];
};

export function ShopFeatures({ title, features }: ShopFeaturesProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 2.5 }, height: 1 }}>
      <Typography
        className="font-tr"
        sx={{
          fontSize: 16,
          fontWeight: 800,
          textTransform: 'uppercase',
          color: USER_COLORS.gold,
          letterSpacing: 0.5,
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <Stack spacing={1.25}>
        {features.map((feature) => (
          <Box
            key={feature.title}
            sx={getGlassInnerSx(tokens, {
              p: 1.5,
              display: 'flex',
              gap: 1.25,
              alignItems: 'flex-start',
            })}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '6px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(USER_COLORS.gold, 0.1),
                border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
                color: USER_COLORS.gold,
              }}
            >
              <Iconify icon={feature.icon} width={20} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                {feature.title}
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: 12, color: USER_COLORS.textMuted, lineHeight: 1.5 }}>
                {feature.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </UserGlassCard>
  );
}
