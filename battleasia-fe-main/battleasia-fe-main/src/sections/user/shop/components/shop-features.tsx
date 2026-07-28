import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { getGoldTopLineCardSx } from 'src/components/battle-glass-card';

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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {features.map((feature) => (
          <Box
            key={feature.title}
            sx={getGoldTopLineCardSx({
              p: { xs: 1.75, md: 2 },
              pt: { xs: 2.25, md: 2.5 },
              '& > *': { position: 'relative', zIndex: 1 },
            })}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
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
          </Box>
        ))}
      </Box>
    </Box>
  );
}
