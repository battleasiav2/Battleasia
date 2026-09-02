import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

type ReferralStepCardProps = {
  icon: string;
  label: string;
  step: number;
};

export function ReferralStepCard({ icon, label, step }: ReferralStepCardProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box sx={getGlassInnerSx(tokens, { p: { xs: 2, md: 2.5 }, height: 1, textAlign: 'center' })}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 1.2,
          color: goldAlpha(0.8),
          textTransform: 'uppercase',
          mb: 1.5,
        }}
      >
        Step {step}
      </Typography>

      <Box
        sx={{
          width: { xs: 64, md: 72 },
          height: { xs: 64, md: 72 },
          borderRadius: '50%',
          mx: 'auto',
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: goldAlpha(0.12),
          border: `2px solid ${goldAlpha(0.35)}`,
          boxShadow: `0 0 24px ${goldAlpha(0.12)}`,
        }}
      >
        <Iconify icon={icon} sx={{ color: USER_COLORS.gold, width: { xs: 30, md: 34 }, height: { xs: 30, md: 34 } }} />
      </Box>

      <Typography
        className="font-tr"
        sx={{
          color: USER_COLORS.textPrimary,
          fontWeight: 700,
          fontSize: { xs: 13, md: 14 },
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          lineHeight: 1.35,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

type ReferralStepsFlowProps = {
  title: string;
  steps: Array<{ icon: string; label: string }>;
};

export function ReferralStepsFlow({ title, steps }: ReferralStepsFlowProps) {
  return (
    <Stack spacing={2.5}>
      <Typography
        className="font-tr"
        sx={{
          color: USER_COLORS.gold,
          fontWeight: 800,
          textAlign: 'center',
          fontSize: { xs: 18, md: 22 },
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="stretch"
        spacing={{ xs: 1.5, md: 1 }}
      >
        {steps.map((step, index) => (
          <Stack
            key={step.label}
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Box sx={{ flex: 1, width: 1 }}>
              <ReferralStepCard icon={step.icon} label={step.label} step={index + 1} />
            </Box>

            {index < steps.length - 1 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 0, md: 0.5 },
                  py: { xs: 0.5, md: 0 },
                  transform: { xs: 'rotate(90deg)', md: 'none' },
                }}
              >
                <Iconify
                  icon="eva:arrow-ios-forward-fill"
                  sx={{ color: USER_COLORS.gold, width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }}
                />
              </Box>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
