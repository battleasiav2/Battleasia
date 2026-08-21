import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';

import type { AccountDrawerProps } from './components/account-drawer';

// ----------------------------------------------------------------------

export const _account: AccountDrawerProps['data'] = [
  { labelKey: 'navigation.home', href: '/', icon: <Iconify icon="solar:home-angle-bold-duotone" /> },
  {
    labelKey: 'navigation.profile',
    href: paths.user.account.profile,
    icon: <Iconify icon="solar:user-circle-bold-duotone" />,
  },
  {
    labelKey: 'navigation.myMatches',
    href: paths.user.account.myMatches,
    icon: <Iconify icon="solar:gamepad-bold-duotone" />,
  },
  { labelKey: 'navigation.leaderboard', href: paths.user.account.leaderBoard, icon: <Iconify icon="solar:cup-star-bold-duotone" /> },
  { labelKey: 'navigation.customerSupport', href: paths.user.account.customerSupport, icon: <Iconify icon="solar:chat-round-dots-bold-duotone" /> },
];
