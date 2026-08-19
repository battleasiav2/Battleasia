import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Home',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
    ],
  },
];
