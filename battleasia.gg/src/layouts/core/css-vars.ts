import type { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function layoutSectionVars(theme: Theme) {
  return {
    '--layout-nav-zIndex': theme.zIndex.drawer + 1,
    '--layout-nav-mobile-width': '288px',
    '--layout-header-blur': '8px',
    '--layout-header-zIndex': theme.zIndex.appBar + 1,
    '--layout-header-mobile-height': '54px',
    '--layout-header-desktop-height': '58px',
    '--layout-main-margin-top': '0px',
    '--layout-main-mobile-margin-top': '0px',
  };
}
