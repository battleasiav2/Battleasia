export type NavItem = {
  to: string;
  label: string;
  perm?: string | null;
  icon?: string;
  badge?: 'deposits' | 'withdrawals';
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type ListSpec = {
  title: string;
  api: string;
  columns: string[];
  perm?: string | null;
  includeInactive?: boolean;
};

export type SettingsSpec = {
  title: string;
  get: string;
  put?: string;
  wrap?: string;
  perm?: string | null;
  testPath?: string;
};

export const NAV: NavGroup[] = [
  { label: 'nav.overview', items: [{ to: '/dashboard', label: 'nav.dashboard', icon: 'dash' }] },
  {
    label: 'nav.users',
    items: [
      { to: '/users/list', label: 'nav.list', perm: 'users.view', icon: 'users' },
      { to: '/users/role', label: 'nav.roles', perm: 'users.view', icon: 'roles' },
      { to: '/users/history', label: 'nav.history', perm: 'users.view', icon: 'history' },
      { to: '/users/online', label: 'nav.online', perm: 'users.view', icon: 'online' },
      { to: '/users/premium', label: 'nav.premium', perm: 'users.view', icon: 'premium' },
      { to: '/users/referral-settings', label: 'nav.referralSettings', perm: 'users.edit', icon: 'referral' },
      { to: '/users/transfer-settings', label: 'nav.transferSettings', perm: 'users.edit', icon: 'transfer' },
      { to: '/users/referral-history', label: 'nav.referralHistory', perm: 'users.view', icon: 'history' },
    ],
  },
  {
    label: 'nav.games',
    items: [
      { to: '/games/list', label: 'nav.games', perm: 'matches.view', icon: 'games' },
      { to: '/games/matches', label: 'nav.matches', perm: 'matches.view', icon: 'matches' },
      { to: '/games/participants-history', label: 'nav.participants', perm: 'matches.view', icon: 'people' },
    ],
  },
  {
    label: 'nav.money',
    items: [
      { to: '/balance/balance-histories', label: 'nav.ledger', perm: 'payments.view', icon: 'ledger' },
      { to: '/payments/wallet', label: 'nav.wallets', perm: 'payments.view', icon: 'wallet' },
      { to: '/payments/deposit', label: 'nav.deposits', perm: 'payments.manage', icon: 'deposit', badge: 'deposits' },
      { to: '/payments/withdrawal', label: 'nav.withdrawals', perm: 'payments.manage', icon: 'withdraw', badge: 'withdrawals' },
      { to: '/shop/coinlist', label: 'nav.coinPacks', perm: 'shop.view', icon: 'pack' },
      { to: '/shop/coinrate', label: 'nav.coinRates', perm: 'shop.view', icon: 'rate' },
    ],
  },
  {
    label: 'nav.community',
    items: [
      { to: '/notifications', label: 'nav.notifications', perm: 'notifications.send', icon: 'bell' },
      { to: '/feed/list', label: 'nav.feed', perm: 'feed.view', icon: 'feed' },
      { to: '/feed/categories', label: 'nav.categories', perm: 'feed.view', icon: 'tag' },
      { to: '/feed/profile-social-settings', label: 'nav.profileSocial', perm: 'feed.edit', icon: 'social' },
      { to: '/feed/social-reports', label: 'nav.reports', perm: 'feed.view', icon: 'flag' },
      { to: '/feed/reels-moderation', label: 'nav.reels', perm: 'feed.view', icon: 'reel' },
      { to: '/customer-support/list', label: 'nav.support', perm: 'customer-support.view', icon: 'support' },
      { to: '/customer-support/live-chat-settings', label: 'nav.liveChat', perm: 'customer-support.view', icon: 'chat' },
      { to: '/customer-support/messaging-provider-settings', label: 'nav.messaging', perm: 'customer-support.view', icon: 'send' },
    ],
  },
  {
    label: 'nav.engagement',
    items: [
      { to: '/engagement/missions', label: 'nav.missions', perm: 'engagement.view', icon: 'mission' },
      { to: '/engagement/badges', label: 'nav.badges', perm: 'engagement.view', icon: 'badge' },
      { to: '/engagement/settings', label: 'nav.settings', perm: 'engagement.edit', icon: 'sliders' },
      { to: '/feature-flags', label: 'nav.flags', perm: 'engagement.edit', icon: 'toggle' },
    ],
  },
  {
    label: 'nav.system',
    items: [
      { to: '/system/mail-settings', label: 'nav.mail', perm: null, icon: 'mail' },
      { to: '/system/app-download', label: 'nav.appDownload', perm: null, icon: 'download' },
      { to: '/integrity/ledger', label: 'nav.integrityLedger', perm: 'payments.view', icon: 'scale' },
      { to: '/integrity/fraud-holds', label: 'nav.fraudHolds', perm: 'payments.view', icon: 'hold' },
      { to: '/integrity/kyc', label: 'nav.kyc', perm: 'users.view', icon: 'kyc' },
      { to: '/integrity/fingerprints', label: 'nav.fingerprints', perm: 'users.view', icon: 'print' },
      { to: '/integrity/ocr', label: 'nav.ocr', perm: 'matches.view', icon: 'scan' },
      { to: '/integrity/match-reports', label: 'nav.matchReports', perm: 'matches.view', icon: 'report' },
      { to: '/integrity/disputes', label: 'nav.disputes', perm: 'customer-support.view', icon: 'gavel' },
      { to: '/integrity/audit', label: 'nav.audit', perm: null, icon: 'audit' },
      { to: '/profile', label: 'nav.profile', perm: null, icon: 'profile' },
    ],
  },
];

export const LISTS: Record<string, ListSpec> = {
  '/users/list': { title: 'nav.list', api: '/api/v3/users/list', columns: ['username', 'email', 'balance', 'status', 'pubgId', 'gameServer'], perm: 'users.view' },
  '/users/role': { title: 'nav.roles', api: '/api/v3/users/roles', columns: ['name', 'type', 'permissions'], perm: 'users.view' },
  '/users/history': { title: 'page.loginHistory', api: '/api/v3/users/histories', columns: ['username', 'email', 'ip', 'createdAt'], perm: 'users.view' },
  '/users/online': { title: 'page.sessions', api: '/api/v3/users/sessions', columns: ['username', 'email', 'ip', 'expiration'], perm: 'users.view' },
  '/users/premium': { title: 'nav.premium', api: '/api/v3/users/premium', columns: ['username', 'email', 'premium'], perm: 'users.view' },
  '/users/referral-history': { title: 'nav.referralHistory', api: '/api/v3/users/referral-history', columns: ['username', 'referredBy', 'amount', 'createdAt'], perm: 'users.view' },
  '/games/list': { title: 'nav.games', api: '/api/v3/games/list', columns: ['name', 'slug', 'status'], perm: 'matches.view' },
  '/games/matches': { title: 'nav.matches', api: '/api/v3/games/matches', columns: ['matchName', 'status', 'entryFee', 'totalPlayer', 'matchSchedule', 'map'], perm: 'matches.view' },
  '/games/participants-history': { title: 'nav.participants', api: '/api/v3/games/participants-history', columns: ['username', 'matchId', 'status', 'createdAt'], perm: 'matches.view' },
  '/balance/balance-histories': { title: 'page.balanceLedger', api: '/api/v4/payments/balance-histories', columns: ['username', 'email', 'type', 'amount', 'createdAt'], perm: 'payments.view' },
  '/notifications': { title: 'nav.notifications', api: '/api/v3/notifications', columns: ['title', 'category', 'type', 'createdAt'], perm: 'notifications.send' },
  '/feed/list': { title: 'page.feedPosts', api: '/api/v3/feed/list', columns: ['caption', 'username', 'status', 'createdAt'], perm: 'feed.view' },
  '/feed/categories': { title: 'page.feedCategories', api: '/api/v3/feed/categories', columns: ['name', 'slug', 'status'], perm: 'feed.view' },
  '/feed/social-reports': { title: 'page.socialReports', api: '/api/v2/social/reports', columns: ['reason', 'status', 'targetType', 'createdAt'], perm: 'feed.view' },
  '/feed/reels-moderation': { title: 'page.reels', api: '/api/v2/social/reels/admin', columns: ['caption', 'username', 'views', 'createdAt'], perm: 'feed.view' },
  '/customer-support/list': { title: 'nav.support', api: '/api/v2/customer-support/conversations', columns: ['subject', 'status', 'username', 'updatedAt'], perm: 'customer-support.view' },
  '/shop/coinlist': { title: 'nav.coinPacks', api: '/api/v4/shop/items?includeInactive=true', columns: ['amount', 'price', 'symbol', 'badge', 'isActive'], perm: 'shop.view', includeInactive: true },
  '/shop/coinrate': { title: 'nav.coinRates', api: '/api/v4/shop/coins', columns: ['region', 'currency', 'rate', 'isActive'], perm: 'shop.view' },
  '/engagement/missions': { title: 'nav.missions', api: '/api/v3/engagement/missions', columns: ['title', 'type', 'reward', 'enabled'], perm: 'engagement.view' },
  '/engagement/badges': { title: 'nav.badges', api: '/api/v3/engagement/badges', columns: ['name', 'slug', 'enabled'], perm: 'engagement.view' },
};

export const SETTINGS: Record<string, SettingsSpec> = {
  '/users/referral-settings': { title: 'nav.referralSettings', get: '/api/v3/users/referral-settings/details', put: '/api/v3/users/referral-settings/update', perm: 'users.edit' },
  '/users/transfer-settings': { title: 'nav.transferSettings', get: '/api/v3/users/transfer-settings/details', put: '/api/v3/users/transfer-settings/update', wrap: 'transferSettings', perm: 'users.edit' },
  '/feed/profile-social-settings': { title: 'page.profileSocial', get: '/api/v2/social/profile-social-settings', put: '/api/v2/social/profile-social-settings', perm: 'feed.edit' },
  '/customer-support/live-chat-settings': { title: 'page.liveChat', get: '/api/v2/customer-support/live-chat-settings', put: '/api/v2/customer-support/live-chat-settings', perm: 'customer-support.view' },
  '/customer-support/messaging-provider-settings': { title: 'page.messaging', get: '/api/v2/social/messaging-settings', put: '/api/v2/social/messaging-settings', perm: 'customer-support.view' },
  '/engagement/settings': { title: 'page.engagement', get: '/api/v3/engagement/settings', put: '/api/v3/engagement/settings', perm: 'engagement.edit' },
  '/system/mail-settings': { title: 'page.mail', get: '/api/v2/app-settings/mail-settings', put: '/api/v2/app-settings/mail-settings', testPath: '/api/v2/app-settings/mail-settings/test', perm: null },
  '/system/app-download': { title: 'nav.appDownload', get: '/api/v2/app-settings/app-download', put: '/api/v2/app-settings/app-download', perm: null },
};

export const INTEGRITY: Record<string, { title: string; api: string }> = {
  '/integrity/ledger': { title: 'nav.integrityLedger', api: '/api/v3/integrity/ledger' },
  '/integrity/fraud-holds': { title: 'nav.fraudHolds', api: '/api/v3/integrity/fraud-holds' },
  '/integrity/kyc': { title: 'page.kyc', api: '/api/v3/integrity/kyc' },
  '/integrity/fingerprints': { title: 'nav.fingerprints', api: '/api/v3/integrity/fingerprints' },
  '/integrity/ocr': { title: 'nav.ocr', api: '/api/v3/integrity/ocr' },
  '/integrity/match-reports': { title: 'nav.matchReports', api: '/api/v3/integrity/match-reports' },
  '/integrity/disputes': { title: 'nav.disputes', api: '/api/v3/integrity/disputes' },
  '/integrity/audit': { title: 'nav.audit', api: '/api/v3/integrity/audit' },
};

export function paletteItems() {
  return NAV.flatMap((g) => g.items);
}
