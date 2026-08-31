// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  GAMES: '/games',
  BALANCE: '/balance',  
  NOTIFICATIONS: '/notifications',
  FEED: '/feed',
  CUSTOMER_SUPPORT: '/customer-support',
  SHOP: '/shop',
  PAYMENTS: '/payments',
  SYSTEM: '/system',
  ENGAGEMENT: '/engagement',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    login: `${ROOTS.AUTH}/login`,
    register: `${ROOTS.AUTH}/register`,
  },
  // PROFILE
  profile: '/profile',
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
  },
  users: {
    root: `${ROOTS.USERS}`,
    list: `${ROOTS.USERS}/list`,
    role: `${ROOTS.USERS}/role`,
    history: `${ROOTS.USERS}/history`,
    online: `${ROOTS.USERS}/online`,
    premium: `${ROOTS.USERS}/premium`,
    referralSettings: `${ROOTS.USERS}/referral-settings`,
    transferSettings: `${ROOTS.USERS}/transfer-settings`,
    referralHistory: `${ROOTS.USERS}/referral-history`,
  },
  games: {
    root: `${ROOTS.GAMES}`,
    list: `${ROOTS.GAMES}/list`,
    matches: `${ROOTS.GAMES}/matches`,
    participantsHistory: `${ROOTS.GAMES}/participants-history`,
    matchesResult: (matchId: string) => `${ROOTS.GAMES}/matches/${matchId}/result`,
  }, 
  notifications: {
    root: `${ROOTS.NOTIFICATIONS}`,
  },
  feed: {
    root: `${ROOTS.FEED}`,
    list: `${ROOTS.FEED}/list`,
    categories: `${ROOTS.FEED}/categories`,
    profileSocialSettings: `${ROOTS.FEED}/profile-social-settings`,
    socialReports: `${ROOTS.FEED}/social-reports`,
    reelsModeration: `${ROOTS.FEED}/reels-moderation`,
    new: `${ROOTS.FEED}/new`,
    edit: (id: string) => `${ROOTS.FEED}/${id}/edit`,
  },
  customerSupport: {
    root: `${ROOTS.CUSTOMER_SUPPORT}`,
    list: `${ROOTS.CUSTOMER_SUPPORT}/list`,
    liveChatSettings: `${ROOTS.CUSTOMER_SUPPORT}/live-chat-settings`,
    messagingProviderSettings: `${ROOTS.CUSTOMER_SUPPORT}/messaging-provider-settings`,
    detail: (conversationId: string) => `${ROOTS.CUSTOMER_SUPPORT}/${conversationId}`,
  },
  shop: {
    root: `${ROOTS.SHOP}`,
    coinlist: `${ROOTS.SHOP}/coinlist`,
    coinrate: `${ROOTS.SHOP}/coinrate`,
  },
  balance: {
    root: `${ROOTS.BALANCE}`,
    balanceHistories: `${ROOTS.BALANCE}/balance-histories`,
  },
  payments: {
    root: `${ROOTS.PAYMENTS}`,
    wallet: `${ROOTS.PAYMENTS}/wallet`,
    deposit: `${ROOTS.PAYMENTS}/deposit`,
    withdrawal: `${ROOTS.PAYMENTS}/withdrawal`,
  },
  system: {
    root: `${ROOTS.SYSTEM}`,
    mailSettings: `${ROOTS.SYSTEM}/mail-settings`,
    appDownload: `${ROOTS.SYSTEM}/app-download`,
  },
  engagement: {
    root: `${ROOTS.ENGAGEMENT}`,
    missions: `${ROOTS.ENGAGEMENT}/missions`,
    badges: `${ROOTS.ENGAGEMENT}/badges`,
    settings: `${ROOTS.ENGAGEMENT}/settings`,
  },
};
