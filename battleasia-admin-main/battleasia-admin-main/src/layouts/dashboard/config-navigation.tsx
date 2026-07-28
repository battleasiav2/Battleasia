import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
// import SvgColor from 'src/components/svg-color';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
// hooks
import { usePermissions } from 'src/hooks/use-permissions';
import { useSocket } from 'src/contexts/SocketContext';
// constants
import { PERMISSIONS } from 'src/constants/permissions';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  // <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  <Iconify icon={name} />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  dashboard: icon('clarity:dashboard-line'),
  user: icon('mdi:users'),
  game: icon('simple-icons:pubg'),
  balance: icon('solar:dollar-bold'),
  payment: icon('solar:wallet-bold'),
  notification: icon('solar:bell-bing-bold-duotone'),
  feed: icon('solar:document-text-bold'),
  customerSupport: icon('solar:headphones-round-sound-bold'),
  shop: icon('iconoir:shopping-bag-check'),
  system: icon('solar:settings-bold-duotone'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { isAdmin, hasPermission } = usePermissions();
  const { pendingDepositsCount, pendingWithdrawalsCount } = useSocket();

  const data = useMemo(
    () => {
      const allItems = [
        // OVERVIEW
        // ----------------------------------------------------------------------
        {
          subheader: '',
          items: [
            { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
          ],
        },

        // MANAGEMENT
        // ----------------------------------------------------------------------
        {
          subheader: 'management',
          items: [
            {
              title: 'user',
              path: paths.users.root,
              icon: ICONS.user,
              requiredPermission: PERMISSIONS.USERS.VIEW,
              children: [
                { title: 'List', path: paths.users.list, requiredPermission: PERMISSIONS.USERS.VIEW },
                { title: 'Role', path: paths.users.role, requiredPermission: null }, // Admin only
                { title: 'History', path: paths.users.history, requiredPermission: PERMISSIONS.USERS.VIEW },
                { title: 'Online', path: paths.users.online, requiredPermission: PERMISSIONS.USERS.VIEW },
                { title: 'Premium', path: paths.users.premium, requiredPermission: PERMISSIONS.USERS.VIEW },
                { title: 'Referral Settings', path: paths.users.referralSettings, requiredPermission: PERMISSIONS.USERS.VIEW },
                { title: 'Referral History', path: paths.users.referralHistory, requiredPermission: PERMISSIONS.USERS.VIEW },
              ],
            },
            {
              title: 'games',
              path: paths.games.root,
              icon: ICONS.game,
              requiredPermission: PERMISSIONS.MATCHES.VIEW,
              children: [
                { title: 'List', path: paths.games.list, requiredPermission: PERMISSIONS.MATCHES.VIEW },
                { title: 'Match', path: paths.games.matches, requiredPermission: PERMISSIONS.MATCHES.VIEW },
                { title: 'Participants history', path: paths.games.participantsHistory, requiredPermission: PERMISSIONS.MATCHES.VIEW },
              ],
            },
            {
              title: 'balance',
              path: paths.balance.root,
              icon: ICONS.balance,
              requiredPermission: PERMISSIONS.PAYMENTS.VIEW,
              children: [{ title: 'Balance histories', path: paths.balance.balanceHistories, requiredPermission: PERMISSIONS.PAYMENTS.VIEW }],
            },
            {
              title: 'payment',
              path: paths.payments.root,
              icon: ICONS.payment,
              requiredPermission: PERMISSIONS.PAYMENTS.VIEW,
              info: (pendingDepositsCount + pendingWithdrawalsCount) > 0 ? (
                <Label color="error" sx={{ bgcolor: '#1b5e20', color: '#fff' }}>{pendingDepositsCount + pendingWithdrawalsCount}</Label>
              ) : undefined,
              children: [
                { title: 'Wallet', path: paths.payments.wallet, requiredPermission: PERMISSIONS.PAYMENTS.VIEW },
                { title: 'Deposit', path: paths.payments.deposit, requiredPermission: PERMISSIONS.PAYMENTS.MANAGE },
                { title: 'Withdrawal', path: paths.payments.withdrawal, requiredPermission: PERMISSIONS.PAYMENTS.MANAGE },
              ],
            },
            {
              title: 'notifications',
              path: paths.notifications.root,
              icon: ICONS.notification,
              requiredPermission: PERMISSIONS.NOTIFICATIONS.SEND,
            },
            {
              title: 'feed',
              path: paths.feed.root,
              icon: ICONS.feed,
              requiredPermission: PERMISSIONS.FEED.VIEW,
              children: [
                { title: 'Categories', path: paths.feed.categories, requiredPermission: PERMISSIONS.FEED.VIEW },
                { title: 'List', path: paths.feed.list, requiredPermission: PERMISSIONS.FEED.VIEW },
                { title: 'Profile Social', path: paths.feed.profileSocialSettings, requiredPermission: PERMISSIONS.FEED.VIEW },
                { title: 'Social Reports', path: paths.feed.socialReports, requiredPermission: PERMISSIONS.FEED.VIEW },
                { title: 'Reels Moderation', path: paths.feed.reelsModeration, requiredPermission: PERMISSIONS.FEED.VIEW },
              ],
            },
            {
              title: 'customer support',
              path: paths.customerSupport.root,
              icon: ICONS.customerSupport,
              requiredPermission: PERMISSIONS.CUSTOMER_SUPPORT.VIEW,
              children: [
                { title: 'List', path: paths.customerSupport.list, requiredPermission: PERMISSIONS.CUSTOMER_SUPPORT.VIEW },
                { title: 'Live Chat Settings', path: paths.customerSupport.liveChatSettings, requiredPermission: PERMISSIONS.CUSTOMER_SUPPORT.VIEW },
                { title: 'Messaging Providers', path: paths.customerSupport.messagingProviderSettings, requiredPermission: PERMISSIONS.CUSTOMER_SUPPORT.VIEW },
              ],
            },
            {
              title: 'shop',
              path: paths.shop.root,
              icon: ICONS.shop,
              requiredPermission: PERMISSIONS.SHOP.VIEW,
              children: [
                { title: 'Coin List', path: paths.shop.coinlist, requiredPermission: PERMISSIONS.SHOP.VIEW },
                { title: 'Coin Rate', path: paths.shop.coinrate, requiredPermission: PERMISSIONS.SHOP.VIEW },
              ],
            },
            {
              title: 'system',
              path: paths.system.root,
              icon: ICONS.system,
              requiredPermission: null,
              children: [
                { title: 'Mail Settings', path: paths.system.mailSettings, requiredPermission: null },
                { title: 'App Download', path: paths.system.appDownload, requiredPermission: null },
              ],
            },
          ],
        },
      ];

      // Filter items based on permissions
      return allItems.map((section) => ({
        ...section,
        items: section.items
          .map((item: any) => {
            const requiredPermission = (item as any).requiredPermission;
            const { requiredPermission: _, ...itemWithoutPermission } = item;
            
            // Check if main item is accessible
            if (requiredPermission && !isAdmin && !hasPermission(requiredPermission)) {
              return null;
            }

            // For items with children, filter children
            const children = (item as any).children;
            if (children) {
              const filteredChildren = children
                .filter((child: any) => {
                  const childPermission = child.requiredPermission;
                  // Admin can see all, or check permission
                  if (childPermission === null) {
                    return isAdmin; // Admin-only items
                  }
                  return isAdmin || hasPermission(childPermission);
                })
                .map((child: any) => {
                  const { requiredPermission: __, ...childWithoutPermission } = child;
                  return childWithoutPermission;
                });

              // If no children are accessible, hide the parent item
              if (filteredChildren.length === 0) {
                return null;
              }

              return {
                ...itemWithoutPermission,
                children: filteredChildren,
              };
            }

            // For items without children, check if it's admin-only
            if (requiredPermission === null) {
              return isAdmin ? itemWithoutPermission : null;
            }

            return itemWithoutPermission;
          })
          .filter((item: any) => item !== null),
      })).filter((section) => section.items.length > 0);
    },
    [isAdmin, hasPermission, pendingDepositsCount, pendingWithdrawalsCount]
  );

  return data;
}
