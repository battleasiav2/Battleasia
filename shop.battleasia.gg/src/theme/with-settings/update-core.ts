import type { ColorSystem } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

import { setFont, hexToRgbChannel, createPaletteChannel } from 'minimal-shared/utils';

import { themeConfig } from '../theme-config';
import { primaryColorPresets } from './color-presets';
import { createShadowColor } from '../core/custom-shadows';
import { resolveAccentId } from '../accent-presets';

import type { ThemeOptions, ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

export function updateCoreWithSettings(
  theme: ThemeOptions,
  settingsState?: SettingsState
): ThemeOptions {
  const {
    direction,
    fontFamily,
    contrast = 'default',
    primaryColor = 'gold',
  } = settingsState ?? {};

  const isDefaultContrast = contrast === 'default';
  const accentId = resolveAccentId(primaryColor);
  const primaryPreset =
    primaryColorPresets[accentId] || primaryColorPresets.default || primaryColorPresets.gold;

  const lightPalette = theme.colorSchemes?.light?.palette as ColorSystem['palette'] | undefined;

  const updatedPrimaryColor = createPaletteChannel(primaryPreset);

  const updateColorScheme = (scheme: ThemeColorScheme) => {
    const colorSchemes = theme.colorSchemes?.[scheme];

    const updatedPalette = {
      ...colorSchemes?.palette,
      primary: updatedPrimaryColor,
      ...(scheme === 'light' && lightPalette
        ? {
            background: {
              ...lightPalette.background,
              ...(!isDefaultContrast && lightPalette.grey?.[200]
                ? {
                    default: lightPalette.grey[200],
                    defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
                  }
                : null),
            },
          }
        : null),
    };

    const updatedCustomShadows = {
      ...colorSchemes?.customShadows,
      ...(updatedPrimaryColor.mainChannel
        ? { primary: createShadowColor(updatedPrimaryColor.mainChannel) }
        : null),
    };

    return {
      ...colorSchemes,
      palette: updatedPalette,
      customShadows: updatedCustomShadows,
    };
  };

  return {
    ...theme,
    direction,
    colorSchemes: {
      light: updateColorScheme('light'),
      dark: updateColorScheme('dark'),
    },
    typography: {
      ...theme.typography,
      fontFamily: setFont(fontFamily || themeConfig.fontFamily.primary),
    },
  };
}
