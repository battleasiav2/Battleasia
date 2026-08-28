import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { HOME_ROW_LINE, HomeBlurPanel } from 'src/sections/home/home-blur-panel';

import { USER_COLORS } from 'src/layouts/user';

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
  return (
    <Box>
      <Typography
        className="font-tr"
        sx={{
          fontSize: { xs: 18, md: 22 },
          fontWeight: 800,
          textTransform: 'uppercase',
          color: USER_COLORS.textPrimary,
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>
      <BattleGoldDivider variant="section" sx={{ mt: 0.75, mb: 2, width: 100 }} />

      <HomeBlurPanel>
        <Stack spacing={0}>
          {features.map((feature, index) => (
            <Stack
              key={feature.title}
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{
                py: { xs: 1.35, sm: 1.5 },
                borderBottom: index < features.length - 1 ? HOME_ROW_LINE : 'none',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(USER_COLORS.gold, 0.1),
                  border: `1px solid ${alpha(USER_COLORS.gold, 0.28)}`,
                  color: USER_COLORS.gold,
                }}
              >
                <Iconify icon={feature.icon} width={20} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    color: USER_COLORS.textPrimary,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 12, color: USER_COLORS.textMuted, lineHeight: 1.55 }}>
                  {feature.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </HomeBlurPanel>
    </Box>
  );
}
