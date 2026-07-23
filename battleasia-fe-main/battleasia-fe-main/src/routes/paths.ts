// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  USER: '/user',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-up`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
    emailVerification: `${ROOTS.AUTH}/email-verification`,
  },
  termsOfService: '/terms-and-conditions',
  privacyPolicy: '/privacy-policy',
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    projects: `${ROOTS.DASHBOARD}/projects`,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  user: {
    root: `${ROOTS.USER}`,
    account: {
      root: `${ROOTS.USER}/account`,
      profile: `${ROOTS.USER}/account/profile`,
      profileDetail: (userId: string | number) => `${ROOTS.USER}/account/profile/${userId}`,
      wallet: `${ROOTS.USER}/account/wallet`,
      myMatches: `${ROOTS.USER}/account/my-matches`,
      myOrders: `${ROOTS.USER}/account/my-orders`,
      myStatistics: `${ROOTS.USER}/account/my-statistics`,
      myReferrals: `${ROOTS.USER}/account/my-referrals`,
      notifications: `${ROOTS.USER}/account/notifications`,
      leaderBoard: `${ROOTS.USER}/account/leader-board`,
      customerSupport: `${ROOTS.USER}/account/customer-support`,
    },
    earn: `${ROOTS.USER}/earn`,
    play: `${ROOTS.USER}/play`,
    playDetail: (id: string | number) => `${ROOTS.USER}/play/${id}`,
    match: (id: string | number) => `${ROOTS.USER}/play/${id}/detail`,
    matchResult: (id: string | number) => `${ROOTS.USER}/play/${id}/result`,
    shop: `${ROOTS.USER}/shop`,
    shopDetail: (id: string | number) => `${ROOTS.USER}/shop/${id}`,
    referral: `${ROOTS.USER}/referral`,
    feed: `${ROOTS.USER}/feed`,
    feedDetail: (id: string | number) => `${ROOTS.USER}/feed/${id}`,
  },
  // Public profile (no auth required)
  profile: (userId: string | number) => `/profile/${userId}`,
};
