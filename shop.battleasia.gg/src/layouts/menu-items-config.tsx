import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Router = {
  back: () => void;
  forward: () => void;
  refresh: () => void;
  push: (href: string) => void;
  replace: (href: string) => void;
};

// ----------------------------------------------------------------------

export type MenuItem = {
  label: string;
  labelKey: string;
  href: string;
  scrollTarget: string;
  isActive: (currentPath: string) => boolean;
};

export const menuItems: MenuItem[] = [
  {
    label: 'Shop',
    labelKey: 'nav.shop',
    href: paths.user.shop,
    scrollTarget: '',
    isActive: (currentPath: string) =>
      currentPath.startsWith(paths.user.shop) || currentPath === paths.user.root,
  },
];

// ----------------------------------------------------------------------

export type AccountMenuItem = {
  /** i18n key (account drawer calls t(label)) */
  label: string;
  labelKey: string;
  href?: string;
  icon: React.ReactNode;
  mobileMenu?: boolean;
  children?: AccountMenuItem[];
};

export const accountMenuItems: AccountMenuItem[] = [
  {
    label: 'nav.shop',
    labelKey: 'nav.shop',
    href: paths.user.shop,
    icon: <Iconify icon="solar:shop-bold" />,
    mobileMenu: true,
  },
  {
    label: 'nav.wallet',
    labelKey: 'nav.wallet',
    href: paths.user.account.wallet,
    icon: <Iconify icon="solar:wallet-bold" />,
    mobileMenu: true,
  },
  {
    label: 'nav.withdrawal',
    labelKey: 'nav.withdrawal',
    href: paths.user.account.withdrawal,
    icon: <Iconify icon="solar:card-send-bold" />,
    mobileMenu: true,
  },
];

// ----------------------------------------------------------------------

export function createMenuClickHandler(
  pathname: string,
  router?: Router
): (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => void {
  return (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => {
    if (!item.scrollTarget) return;

    e.preventDefault();
    const targetElement = document.getElementById(item.scrollTarget);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (router && item.href) {
      router.push(item.href);
    }
  };
}
