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


      {/* One merged panel â€” 4 features, no separate cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
          width: 1,
          bgcolor: alpha('#06090e', 0.72),
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: `1px solid ${goldAlpha(0.28)}`,
          borderTop: `2px solid ${GOLD}`,
          boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
          clipPath: {
            xs: 'none',
            md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
          },
        }}
      >
        {features.map((feature, index) => (
          <Box
            key={feature.title}
            sx={{
              minWidth: 0,
              p: { xs: 2.25, md: 2.5 },
              borderRight: {
                xs: 'none',
                sm: index % 2 === 0 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                md: index < features.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
              },
              borderBottom: {
                xs: index < features.length - 1 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                sm: index < 2 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                md: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.35 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: goldAlpha(0.12),
                  border: `1px solid ${goldAlpha(0.35)}`,
                  color: GOLD,
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                }}
              >
                <Iconify icon={feature.icon} width={20} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: 13, md: 14 },
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  lineHeight: 1.3,
                  minWidth: 0,
                }}
              >
                {feature.title}
              </Typography>
            </Stack>

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
        ))}
      </Box>
    </Box>
  );
}
