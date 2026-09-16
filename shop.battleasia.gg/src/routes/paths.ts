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
      wallet: `${ROOTS.USER}/wallet`,
      transfer: `${ROOTS.USER}/transfer`,
      withdrawal: `${ROOTS.USER}/withdrawal`,
      notifications: `${ROOTS.USER}/account/notifications`,
    },
    shop: `${ROOTS.USER}/shop`,
  },
  // Public profile (no auth required)
  profile: (userId: string | number) => `/profile/${userId}`,
};
