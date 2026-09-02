import type { ColorSystem } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

import { setFont, hexToRgbChannel, createPaletteChannel } from 'minimal-shared/utils';

import { withNonLatin } from '../core/typography';
import { primaryColorPresets } from './color-presets';
import { createShadowColor } from '../core/custom-shadows';
import { resolveAccentId } from '../accent-presets';

import type { ThemeOptions, ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

/**
 * Update the core theme with the settings state.
 * @contrast
 * @primaryColor
 */

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

  const lightPalette = theme.colorSchemes?.light.palette as ColorSystem['palette'];

  const updatedPrimaryColor = createPaletteChannel(primaryColorPresets[accentId]);
  // const updatedSecondaryColor = createPaletteChannel(SECONDARY_COLORS[primaryColor!]);

  const updateColorScheme = (scheme: ThemeColorScheme) => {
    const colorSchemes = theme.colorSchemes?.[scheme];

    const updatedPalette = {
      ...colorSchemes?.palette,
      primary: updatedPrimaryColor,
      ...(scheme === 'light' && {
        background: {
          ...lightPalette?.background,
          ...(!isDefaultContrast && {
            default: lightPalette.grey[200],
            defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
          }),
        },
      }),
    };

    const updatedCustomShadows = {
      ...colorSchemes?.customShadows,
      primary: createShadowColor(updatedPrimaryColor.mainChannel),
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
      fontFamily: withNonLatin(setFont(fontFamily)),
    },
  };
}
