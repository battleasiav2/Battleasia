import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { AUTH_TEXT_MUTED } from './auth-form-styles';

// ----------------------------------------------------------------------

export type AuthStep = {
  id: number;
  title: string;
  hint: string;
};

type AuthStepProgressProps = {
  steps: readonly AuthStep[];
  currentStep: number;
};

export function AuthStepProgress({ steps, currentStep }: AuthStepProgressProps) {
  const theme = useTheme();
  const accentColor = theme.palette.primary.main || '#cbfb24';
  const accentContrast = theme.palette.primary.contrastText || '#081401';

  return (
    <Box
      component="ol"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2.5,
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
    >
      {steps.map((step, index) => {
        const active = currentStep === step.id;
        const done = currentStep > step.id;

        return (
          <Box
            component="li"
            key={step.id}
            sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 1.25, minWidth: 0 }}
          >
            {/* Chamfered Step Number Node */}
            <Box
              sx={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                bgcolor: done ? accentColor : active ? alpha(accentColor, 0.18) : alpha('#ffffff', 0.05),
                border: `1.5px solid ${done || active ? accentColor : alpha('#ffffff', 0.15)}`,
                color: done ? accentContrast : active ? accentColor : AUTH_TEXT_MUTED,
                boxShadow: active || done ? `0 0 12px ${alpha(accentColor, 0.45)}` : 'none',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 900,
                transition: 'all 0.3s ease',
              }}
            >
              {done ? <Iconify icon="eva:checkmark-fill" width={16} /> : `0${step.id}`}
            </Box>

            {/* Step Label and Hint */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: active || done ? '#ffffff' : AUTH_TEXT_MUTED,
                  transition: 'color 0.2s ease',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                noWrap
                sx={{
                  display: 'block',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: active ? accentColor : AUTH_TEXT_MUTED,
                  transition: 'color 0.2s ease',
                }}
              >
                {step.hint}
              </Typography>
            </Box>

            {/* Connecting Laser Line */}
            {index === 0 && (
              <Box
                sx={{
                  ml: 'auto',
                  height: '2px',
                  flex: 1,
                  minWidth: 16,
                  bgcolor: currentStep > 1 ? accentColor : alpha('#ffffff', 0.12),
                  boxShadow: currentStep > 1 ? `0 0 8px ${accentColor}` : 'none',
                  transition: 'all 0.4s ease',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
