import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
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
    <Box>
      <Typography
        sx={{
          fontSize: { xs: 18, md: 22 },
          fontWeight: 800,
          textTransform: 'uppercase',
          color: USER_COLORS.textPrimary,
          letterSpacing: 0.4,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.25, md: 1.5 },
        }}
      >
        {features.map((feature) => (
          <Box
            key={feature.title}
            sx={{
              minWidth: 0,
              p: { xs: 1.75, md: 2 },
              borderRadius: '12px',
              bgcolor: '#161618',
              border: `1px solid ${alpha('#ffffff', 0.08)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.1} sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  bgcolor: goldAlpha(0.12),
                  border: `1px solid ${goldAlpha(0.28)}`,
                  color: GOLD,
                }}
              >
                <Iconify icon={feature.icon} width={18} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: 13, md: 13.5 },
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  lineHeight: 1.3,
                  minWidth: 0,
                }}
              >
                {feature.title}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12.5, color: alpha('#ffffff', 0.62), lineHeight: 1.55 }}>
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
