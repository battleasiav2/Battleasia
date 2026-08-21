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
  labelKey: string; // Translation key for i18n
  href: string;
  scrollTarget: string;
  isActive: (currentPath: string) => boolean;
};

export const menuItems: MenuItem[] = [
  {
    labelKey: 'navigation.home',
    href: '/dashboard',
    scrollTarget: 'home',
    isActive: (currentPath: string) => currentPath === '/dashboard' || currentPath === '/dashboard/',
  },
  {
    labelKey: 'navigation.aboutUs',
    href: '/dashboard/about-us',
    scrollTarget: 'about-us',
    isActive: (currentPath: string) => currentPath.startsWith('/dashboard/about-us'),
  },
  {
    labelKey: 'navigation.howToPlay',
    href: '/dashboard/how-to-play',
    scrollTarget: 'how-to-play',
    isActive: (currentPath: string) => currentPath.startsWith('/dashboard/how-to-play'),
  },
  {
    labelKey: 'navigation.rules',
    href: '/dashboard/rules',
    scrollTarget: 'rules',
    isActive: (currentPath: string) => currentPath.startsWith('/dashboard/rules'),
  },
] as const;

// ----------------------------------------------------------------------

export type AccountMenuItem = {
  labelKey: string; // Translation key for i18n
  href?: string;
  icon: React.ReactNode;
  mobileMenu?: boolean;
  children?: AccountMenuItem[];
};

export const accountMenuItems: AccountMenuItem[] = [
  {
    labelKey: 'navigation.account',
    icon: <Iconify icon="solar:user-id-bold" />,
    href: paths.user.account.root,
    children: [
      {
        labelKey: 'navigation.profile',
        href: paths.user.account.profile,
        icon: <Iconify icon="solar:user-bold" />,
      },
      {
        labelKey: 'navigation.myMatches',
        href: paths.user.account.myMatches,
        icon: <Iconify icon="solar:gamepad-bold" />,
      },
      {
        labelKey: 'navigation.myOrders',
        href: paths.user.account.myOrders,
        icon: <Iconify icon="solar:bag-heart-bold" />,
      },
      {
        labelKey: 'navigation.myStatistics',
        href: paths.user.account.myStatistics,
        icon: <Iconify icon="solar:chart-2-bold" />,
      },
      {
        labelKey: 'navigation.myReferrals',
        href: paths.user.account.myReferrals,
        icon: <Iconify icon="solar:users-group-rounded-bold" />,
      },
      {
        labelKey: 'navigation.notifications',
        href: paths.user.account.notifications,
        icon: <Iconify icon="solar:bell-bing-bold-duotone" />,
      },
      {
        labelKey: 'navigation.leaderboard',
        href: paths.user.account.leaderBoard,
        icon: <Iconify icon="game-icons:podium-winner" />,
      },
      {
        labelKey: 'navigation.customerSupport',
        href: paths.user.account.customerSupport,
        icon: <Iconify icon="solar:chat-round-bold" />,
      },
    ],
  },
  // {
  //   labelKey: 'navigation.earn',
  //   href: paths.user.earn,
  //   icon: <Iconify icon="solar:wallet-money-bold" />,
  // },
  {
    labelKey: 'navigation.play',
    href: paths.user.play,
    icon: <Iconify icon="solar:gamepad-bold" />,
    mobileMenu: true,
  },
  {
    labelKey: 'navigation.shop',
    href: paths.user.shop,
    icon: <Iconify icon="solar:shop-bold" />,
    mobileMenu: true,
  },
  {
    labelKey: 'navigation.referral',
    href: paths.user.referral,
    icon: <Iconify icon="solar:users-group-rounded-bold" />,
    mobileMenu: true,
  },
  {
    labelKey: 'navigation.feed',
    href: paths.user.feed,
    icon: <Iconify icon="solar:document-bold" />,
    mobileMenu: true,
  },
];

/** Desktop sidebar extras — shown below primary arena links (fills empty sidebar height). */
export const sidebarSecondaryItems: AccountMenuItem[] = [
  {
    labelKey: 'navigation.leaderboard',
    href: paths.user.account.leaderBoard,
    icon: <Iconify icon="game-icons:podium-winner" />,
  },
  {
    labelKey: 'navigation.settings',
    href: paths.user.account.profile,
    icon: <Iconify icon="solar:settings-bold-duotone" />,
  },
  {
    labelKey: 'navigation.customerSupport',
    href: paths.user.account.customerSupport,
    icon: <Iconify icon="solar:chat-round-bold" />,
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

