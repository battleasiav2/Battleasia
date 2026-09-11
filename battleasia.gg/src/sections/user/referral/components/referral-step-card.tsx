import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type ReferralStepsFlowProps = {
  title: string;
  steps: Array<{ icon: string; label: string }>;
};

/** One merged “How it works” strip — no separate step cards. */
export function ReferralStepsFlow({ title, steps }: ReferralStepsFlowProps) {
  return (
    <Box>
      <Typography
        className="font-tr"
        sx={{
          mb: 1.25,
          color: GOLD,
          fontWeight: 800,
          fontSize: { xs: 15, md: 16 },
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: `repeat(${steps.length}, minmax(0, 1fr))` },
          width: 1,
          bgcolor: alpha('#06090e', 0.55),
          border: `1px solid ${goldAlpha(0.22)}`,
          borderTop: `2px solid ${GOLD}`,
        }}
      >
        {steps.map((step, index) => (
          <Box
            key={step.label}
            sx={{
              minWidth: 0,
              p: { xs: 1.5, md: 1.75 },
              borderRight: {
                xs: 'none',
                sm: index < steps.length - 1 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
              },
              borderBottom: {
                xs: index < steps.length - 1 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                sm: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: goldAlpha(0.12),
                  border: `1px solid ${goldAlpha(0.35)}`,
                  color: GOLD,
                }}
              >
                <Iconify icon={step.icon} width={18} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: goldAlpha(0.75),
                    textTransform: 'uppercase',
                    mb: 0.25,
                  }}
                >
                  Step {index + 1}
                </Typography>
                <Typography
                  className="font-tr"
                  sx={{
                    color: USER_COLORS.textPrimary,
                    fontWeight: 700,
                    fontSize: { xs: 12.5, md: 13 },
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
