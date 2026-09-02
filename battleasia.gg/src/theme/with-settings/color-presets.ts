import type { PaletteColorNoChannels } from '../core';

import { ACCENT_PALETTES, type AccentId } from '../accent-presets';

import { secondary } from '../core/palette';

// ----------------------------------------------------------------------

export const primaryColorPresets: Record<string, PaletteColorNoChannels> = {
  default: ACCENT_PALETTES.gold.primary,
  gold: ACCENT_PALETTES.gold.primary,
  ember: ACCENT_PALETTES.ember.primary,
  jade: ACCENT_PALETTES.jade.primary,
  cyan: ACCENT_PALETTES.cyan.primary,
  violet: ACCENT_PALETTES.violet.primary,
  rose: ACCENT_PALETTES.rose.primary,
  sky: ACCENT_PALETTES.sky.primary,
  preset1: ACCENT_PALETTES.sky.primary,
  preset2: ACCENT_PALETTES.violet.primary,
  preset3: ACCENT_PALETTES.cyan.primary,
  preset4: ACCENT_PALETTES.ember.primary,
  preset5: ACCENT_PALETTES.rose.primary,
};

export const ACCENT_PRESET_OPTIONS: { name: AccentId; value: string }[] = (
  Object.keys(ACCENT_PALETTES) as AccentId[]
).map((id) => ({
  name: id,
  value: ACCENT_PALETTES[id].gold,
}));

export const secondaryColorPresets: Record<string, PaletteColorNoChannels> = {
  default: {
    lighter: secondary.lighter,
    light: secondary.light,
    main: secondary.main,
    dark: secondary.dark,
    darker: secondary.darker,
    contrastText: secondary.contrastText,
  },
};
