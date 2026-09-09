import { Box, Stack, Typography, Grid2 as Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { USER_COLORS, goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

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
    <Box sx={{ mt: { xs: 1, md: 2 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 20, md: 24 },
            fontWeight: 900,
            textTransform: 'uppercase',
            color: USER_COLORS.textPrimary,
            letterSpacing: 0.8,
          }}
        >
          {title}
        </Typography>
      </Stack>

      <BattleGoldDivider variant="section" sx={{ mt: 0.5, mb: 3, width: 120 }} />

      <Grid container spacing={2.5} alignItems="stretch">
        {features.map((feature, index) => (
          <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                position: 'relative',
                height: 1,
                p: { xs: 2.25, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                bgcolor: alpha('#06090e', 0.7),
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: `1px solid ${goldAlpha(0.22)}`,
                borderTop: `2px solid ${GOLD}`,
                boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: GOLD,
                  bgcolor: alpha('#06090e', 0.88),
                  boxShadow: `0 16px 36px ${alpha('#000000', 0.75)}, 0 0 20px ${goldAlpha(0.2)}`,
                  '& .feature-icon-box': {
                    bgcolor: goldAlpha(0.25),
                    borderColor: GOLD,
                    boxShadow: `0 0 16px ${goldAlpha(0.4)}`,
                    transform: 'scale(1.05)',
                  },
                },
              }}
            >
              {/* Feature Step Number Pill */}
              <Typography
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  fontSize: 11,
                  fontWeight: 900,
                  color: goldAlpha(0.4),
                  letterSpacing: 1,
                }}
              >
                0{index + 1}
              </Typography>

              {/* Icon Container */}
              <Box
                className="feature-icon-box"
                sx={{
                  width: 48,
                  height: 48,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: goldAlpha(0.12),
                  border: `1px solid ${goldAlpha(0.35)}`,
                  color: GOLD,
                  transition: 'all 0.3s ease',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                }}
              >
                <Iconify icon={feature.icon} width={24} />
              </Box>

              {/* Title & Description */}
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {feature.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12.5,
                  color: alpha('#ffffff', 0.65),
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

