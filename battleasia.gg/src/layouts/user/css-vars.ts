import { alpha } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';
import type { Theme, CSSObject } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import { bulletColor } from 'src/components/nav-section';
import { goldAlpha } from 'src/theme/accent-presets';

import { USER_COLORS } from './user-theme';

// ----------------------------------------------------------------------

export function userLayoutVars(theme: Theme) {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-mini-width': '88px',
    '--layout-nav-vertical-width': '280px',
    '--layout-nav-horizontal-height': '72px',
    '--layout-user-content-pt': theme.spacing(1),
    '--layout-user-content-pb': theme.spacing(8),
    '--layout-user-content-px': theme.spacing(5),
    // UserPageShell owns padding — prevent DashboardContent default gaps
    '--layout-dashboard-content-pt': '0px',
    '--layout-dashboard-content-pb': '0px',
    '--layout-dashboard-content-px': '0px',
    '--layout-main-margin-top': '0px',
    '--layout-main-mobile-margin-top': '0px',
    backgroundColor: USER_COLORS.pageBg,
  };
}

// ----------------------------------------------------------------------

/** Dark glass nav tokens — homepage black-shimmer aesthetic */
export function userBattleNavColorVars(
  theme: Theme,
  navLayout: SettingsState['navLayout'] = 'vertical'
): Record<'layout' | 'section', CSSObject> {
  const {
    vars: { palette },
  } = theme;

  const gold = USER_COLORS.gold;

  return {
    layout: {
      '--layout-nav-bg': alpha('#000000', 0.82),
      '--layout-nav-horizontal-bg': alpha('#000000', 0.88),
      '--layout-nav-border-color': varAlpha(palette.common.whiteChannel, 0.1),
      '--layout-nav-text-primary-color': palette.common.white,
      '--layout-nav-text-secondary-color': varAlpha(palette.common.whiteChannel, 0.55),
      '--layout-nav-text-disabled-color': varAlpha(palette.common.whiteChannel, 0.35),
    },
    section: {
      '--nav-item-caption-color': varAlpha(palette.common.whiteChannel, 0.4),
      '--nav-subheader-color': varAlpha(palette.common.whiteChannel, 0.45),
      '--nav-subheader-hover-color': palette.common.white,
      '--nav-item-color': varAlpha(palette.common.whiteChannel, 0.62),
      '--nav-item-hover-bg': goldAlpha(0.08),
      '--nav-item-root-active-color': gold,
      '--nav-item-root-active-color-on-dark': gold,
      '--nav-item-root-active-bg': goldAlpha(0.14),
      '--nav-item-root-active-hover-bg': goldAlpha(0.2),
      '--nav-item-root-open-color': palette.common.white,
      '--nav-item-root-open-bg': varAlpha(palette.common.whiteChannel, 0.06),
      '--nav-bullet-light-color': bulletColor.dark,
      ...(navLayout === 'vertical' && {
        '--nav-item-sub-active-color': gold,
        '--nav-item-sub-active-bg': goldAlpha(0.1),
        '--nav-item-sub-open-color': palette.common.white,
        '--nav-item-sub-open-bg': varAlpha(palette.common.whiteChannel, 0.06),
      }),
    },
  };
}

// Legacy export kept for compatibility
export function userNavColorVars(
  theme: Theme,
  navColor: SettingsState['navColor'] = 'integrate',
  navLayout: SettingsState['navLayout'] = 'vertical'
): Record<'layout' | 'section', CSSObject | undefined> {
  return userBattleNavColorVars(theme, navLayout);
}
