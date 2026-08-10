import { useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { USER_COLORS } from './user-theme';

import type { ThemeColorScheme } from 'src/theme/types';

// ----------------------------------------------------------------------

type UserColorModeToggleProps = {
  dense?: boolean;
};

/** Compact dark/light switch for account drawer — keeps MUI + settings in sync. */
export function UserColorModeToggle({ dense = false }: UserColorModeToggleProps) {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const { mode, setMode, systemMode } = useColorScheme();

  const resolved: ThemeColorScheme =
    mode === 'system' ? ((systemMode as ThemeColorScheme) ?? 'dark') : ((mode as ThemeColorScheme) ?? 'dark');
  const isDark = resolved === 'dark';

  const handleToggle = useCallback(() => {
    const next: ThemeColorScheme = isDark ? 'light' : 'dark';
    setMode(next);
    settings.setState({ colorScheme: next });
  }, [isDark, setMode, settings]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.25}
      onClick={handleToggle}
      sx={{
        cursor: 'pointer',
        px: dense ? 1.25 : 1.5,
        py: dense ? 1 : 1.15,
        border: `1px solid var(--ba-fg-12)`,
        bgcolor: 'var(--ba-bg-35)',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        '&:hover': {
          borderColor: alpha(USER_COLORS.gold, 0.35),
          bgcolor: alpha(USER_COLORS.gold, 0.08),
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.1} sx={{ minWidth: 0 }}>
        <Iconify
          icon={isDark ? 'solar:moon-bold' : 'solar:sun-bold'}
          width={20}
          sx={{ color: USER_COLORS.gold, flexShrink: 0 }}
        />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: USER_COLORS.textPrimary,
            lineHeight: 1.2,
          }}
        >
          {isDark ? t('nav.darkMode') : t('nav.lightMode')}
        </Typography>
      </Stack>

      <Switch
        size="small"
        checked={isDark}
        onClick={(e) => e.stopPropagation()}
        onChange={handleToggle}
        inputProps={{ 'aria-label': t('nav.colorMode') }}
        sx={{
          ml: 0.5,
          '& .MuiSwitch-switchBase.Mui-checked': { color: USER_COLORS.gold },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            bgcolor: alpha(USER_COLORS.gold, 0.55),
          },
          '& .MuiSwitch-track': { bgcolor: 'var(--ba-fg-22)' },
        }}
      />
    </Stack>
  );
}
