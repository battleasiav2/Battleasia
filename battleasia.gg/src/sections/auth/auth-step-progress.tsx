import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const GOLD = '#f5c518';

export type AuthStepItem = {
  key: string;
  label: string;
};

type AuthStepProgressProps = {
  steps: AuthStepItem[];
  activeStep: number;
};

/** Modern step indicator for multi-step auth forms */
export function AuthStepProgress({ steps, activeStep }: AuthStepProgressProps) {
  return (
    <Stack spacing={1.25} sx={{ mb: 2.5 }}>
      <Stack direction="row" alignItems="center" sx={{ width: 1 }}>
        {steps.map((step, index) => {
          const done = index < activeStep;
          const active = index === activeStep;
          const isLast = index === steps.length - 1;

          return (
            <Box key={step.key} sx={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1, minWidth: 0 }}>
              <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 72, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: done || active ? '#111111' : alpha('#ffffff', 0.55),
                    bgcolor: done || active ? GOLD : alpha('#ffffff', 0.08),
                    border: `1.5px solid ${done || active ? GOLD : alpha('#ffffff', 0.18)}`,
                    boxShadow: active ? `0 0 14px ${alpha(GOLD, 0.35)}` : 'none',
                    transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  {done ? '✓' : index + 1}
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: active ? 700 : 600,
                    letterSpacing: 0.1,
                    color: active ? '#ffffff' : alpha('#ffffff', 0.52),
                    textAlign: 'center',
                    lineHeight: 1.25,
                    maxWidth: 96,
                  }}
                >
                  {step.label}
                </Typography>
              </Stack>
              {!isLast ? (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    mx: 1,
                    borderRadius: 1,
                    bgcolor: alpha('#ffffff', 0.08),
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: done ? '100%' : active ? '50%' : '0%',
                      bgcolor: GOLD,
                      transition: 'width 0.35s ease',
                    }}
                  />
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
