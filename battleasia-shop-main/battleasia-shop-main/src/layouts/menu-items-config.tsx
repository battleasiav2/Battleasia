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
  href: string;
  scrollTarget: string;
  isActive: (currentPath: string) => boolean;
};

export const menuItems: MenuItem[] = [
  {
    label: 'Shop',
    href: paths.user.shop,
    scrollTarget: '',
    isActive: (currentPath: string) => currentPath.startsWith(paths.user.shop) || currentPath === paths.user.root,
  },
] as const;

// ----------------------------------------------------------------------

export type AccountMenuItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  mobileMenu?: boolean;
  children?: AccountMenuItem[];
};

export const accountMenuItems: AccountMenuItem[] = [
  {
    label: 'Shop',
    href: paths.user.shop,
    icon: <Iconify icon="solar:shop-bold" />,
    mobileMenu: true,
  },
  {
    label: 'Wallet',
    href: paths.user.account.wallet,
    icon: <Iconify icon="solar:wallet-bold" />,
    mobileMenu: true,
  },
];

// ----------------------------------------------------------------------

/**
 * Shared menu click handler for both dashboard and user layouts
 * Handles navigation to dashboard and scrolling to target section
 */
export function createMenuClickHandler(
  pathname: string,
  router?: Router
): (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => void {
  return (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => {
    const isHomePage = pathname === '/dashboard' || pathname === '/dashboard/';

    if (item.scrollTarget) {
      e.preventDefault();

      const scrollToTarget = (scrollTarget: string) => {
        const targetElement = document.getElementById(scrollTarget);
        if (targetElement) {
          const headerOffset = 100; // Adjust based on your header height
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      };

      // If not on dashboard page, navigate first then scroll
      if (!isHomePage && router) {
        router.push(paths.dashboard.root);
        
        // Wait for navigation and DOM to be ready, then scroll
        // Use multiple attempts to ensure the element is available
        let attempts = 0;
        const maxAttempts = 20; // Try for up to 2 seconds (20 * 100ms)
        
        const tryScroll = () => {
          attempts++;
          const targetElement = document.getElementById(item.scrollTarget);
          
          if (targetElement) {
            scrollToTarget(item.scrollTarget);
          } else if (attempts < maxAttempts) {
            setTimeout(tryScroll, 100);
          }
        };
        
        // Start trying after a short delay
        setTimeout(tryScroll, 200);
      } else {
        // Already on dashboard, just scroll
        scrollToTarget(item.scrollTarget);
      }
    }
  };
}

