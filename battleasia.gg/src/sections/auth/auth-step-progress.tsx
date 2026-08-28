import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

const GOLD = '#f5c518';

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
  return (
    <Box component="ol" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5, listStyle: 'none', m: 0, p: 0 }}>
      {steps.map((step, index) => {
        const active = currentStep === step.id;
        const done = currentStep > step.id;

        return (
          <Box
            component="li"
            key={step.id}
            sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 1.25, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: `1px solid ${done || active ? GOLD : alpha('#fff', 0.14)}`,
                bgcolor: done ? GOLD : 'transparent',
                color: done ? '#111' : active ? GOLD : alpha('#fff', 0.45),
                fontSize: 12,
                fontWeight: 700,
                transition: 'all 0.25s ease',
              }}
            >
              {done ? <Iconify icon="eva:checkmark-fill" width={14} /> : step.id}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: active || done ? '#fff' : alpha('#fff', 0.45),
                }}
              >
                {step.title}
              </Typography>
              <Typography
                noWrap
                sx={{
                  display: 'block',
                  fontSize: 11,
                  color: alpha('#fff', 0.38),
                }}
              >
                {step.hint}
              </Typography>
            </Box>
            {index === 0 && (
              <Box sx={{ ml: 'auto', height: '1px', flex: 1, minWidth: 12, bgcolor: alpha('#fff', 0.1) }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
