import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RouteProgress } from './components/RouteProgress'
import { Seo } from './components/Seo'
import { OfflineBanner } from './components/OfflineBanner'
import { useI18n } from './lib/i18n'
import { getBacShopWalletUrl } from './lib/wallet'

function ShopWalletRedirect() {
  const { t } = useI18n()
  useEffect(() => {
    window.location.replace(getBacShopWalletUrl())
  }, [])
  return (
    <main className="play-main">
      <p className="play-lead">{t('wallet.redirecting')}</p>
    </main>
  )
}

const Spotlight = lazy(() => import('./components/Spotlight').then((m) => ({ default: m.Spotlight })))
const SiteNoticeModal = lazy(() =>
  import('./components/SiteNoticeModal').then((m) => ({ default: m.SiteNoticeModal }))
)
const RequireAuth = lazy(() => import('./components/user/RequireAuth').then((m) => ({ default: m.RequireAuth })))

import { Landing } from './pages/Landing'
const LegalPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.LegalPage })))
const UserShell = lazy(() => import('./components/user/UserShell').then((m) => ({ default: m.UserShell })))

const SignInPage = lazy(() => import('./pages/auth/SignIn').then((m) => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import('./pages/auth/SignUp').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword').then((m) => ({ default: m.ResetPasswordPage })))
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerification').then((m) => ({ default: m.EmailVerificationPage })))
const PlayPage = lazy(() => import('./pages/user/Play').then((m) => ({ default: m.PlayPage })))
const MatchListPage = lazy(() => import('./pages/user/MatchList').then((m) => ({ default: m.MatchListPage })))
const MatchDetailPage = lazy(() => import('./pages/user/MatchDetail').then((m) => ({ default: m.MatchDetailPage })))
const MatchResultPage = lazy(() => import('./pages/user/MatchResult').then((m) => ({ default: m.MatchResultPage })))
const WalletPage = lazy(() => import('./pages/user/Wallet').then((m) => ({ default: m.WalletPage })))
const ShopPage = lazy(() => import('./pages/user/Shop').then((m) => ({ default: m.ShopPage })))
const TransferPage = lazy(() => import('./pages/user/Transfer').then((m) => ({ default: m.TransferPage })))
const ReferralPage = lazy(() => import('./pages/user/Referral').then((m) => ({ default: m.ReferralPage })))
const HashtagPage = lazy(() => import('./pages/user/Hashtag').then((m) => ({ default: m.HashtagPage })))
const FeedPage = lazy(() => import('./pages/user/Feed').then((m) => ({ default: m.FeedPage })))
const FeedSwitch = lazy(() => import('./pages/user/Feed').then((m) => ({ default: m.FeedSwitch })))
const ProfilePage = lazy(() => import('./pages/user/Profile').then((m) => ({ default: m.ProfilePage })))
const FollowListPage = lazy(() => import('./pages/user/FollowList').then((m) => ({ default: m.FollowListPage })))
const AccountLayout = lazy(() => import('./components/user/AccountLayout').then((m) => ({ default: m.AccountLayout })))
const MyMatchesPage = lazy(() => import('./pages/user/MyMatches').then((m) => ({ default: m.MyMatchesPage })))
const MyOrdersPage = lazy(() => import('./pages/user/MyOrders').then((m) => ({ default: m.MyOrdersPage })))
const StatsPage = lazy(() => import('./pages/user/Stats').then((m) => ({ default: m.StatsPage })))
const NotificationsPage = lazy(() => import('./pages/user/Notifications').then((m) => ({ default: m.NotificationsPage })))
const LeaderboardPage = lazy(() => import('./pages/user/Leaderboard').then((m) => ({ default: m.LeaderboardPage })))
const CustomerSupportPage = lazy(() => import('./pages/user/CustomerSupport').then((m) => ({ default: m.CustomerSupportPage })))
const EarnPage = lazy(() => import('./pages/user/Earn').then((m) => ({ default: m.EarnPage })))
const LabsPage = lazy(() => import('./pages/user/Labs').then((m) => ({ default: m.LabsPage })))

export default function App() {
  return (
    <BrowserRouter>
      <Seo />
      <OfflineBanner />
      <Suspense fallback={null}>
        <Spotlight />
      </Suspense>
      <Suspense fallback={null}>
        <SiteNoticeModal />
      </Suspense>
      <RouteProgress />
      <Suspense fallback={<div className="landing" style={{ minHeight: '100svh', background: 'var(--ba-page)' }} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Landing />} />
          <Route path="/support" element={<Landing openChat />} />
          <Route path="/privacy-policy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms-and-conditions" element={<LegalPage kind="terms" />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/email-verification" element={<EmailVerificationPage />} />
          <Route
            element={
              <RequireAuth>
                <UserShell />
              </RequireAuth>
            }
          >
            <Route path="/user/play" element={<PlayPage />} />
            <Route path="/user/play/:matchId/detail" element={<MatchDetailPage />} />
            <Route path="/user/play/:matchId/result" element={<MatchResultPage />} />
            <Route path="/user/play/:gameId" element={<MatchListPage />} />
            <Route path="/user/wallet" element={<WalletPage />} />
            <Route path="/user/shop/wallet" element={<ShopWalletRedirect />} />
            <Route path="/user/account/wallet" element={<Navigate to="/user/wallet" replace />} />
            <Route path="/user/earn" element={<EarnPage />} />
            <Route path="/user/labs" element={<LabsPage />} />
            <Route path="/user/labs/:feature" element={<LabsPage />} />
            <Route path="/user/shop" element={<ShopPage />} />
            <Route path="/user/transfer" element={<TransferPage />} />
            <Route path="/user/referral" element={<ReferralPage />} />
            <Route path="/user/feed" element={<FeedPage />} />
            <Route path="/user/hashtag/:tag" element={<HashtagPage />} />
            <Route path="/user/feed/:tab" element={<FeedSwitch />} />
            <Route path="/profile/:userId/followers" element={<FollowListPage kind="followers" />} />
            <Route path="/profile/:userId/following" element={<FollowListPage kind="following" />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/user/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="/user/account/profile" replace />} />
              <Route path="profile" element={<ProfilePage own />} />
              <Route path="my-matches" element={<MyMatchesPage />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
              <Route path="my-statistics" element={<StatsPage />} />
              <Route path="my-referrals" element={<ReferralPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="leader-board" element={<LeaderboardPage />} />
              <Route path="customer-support" element={<CustomerSupportPage />} />
            </Route>
          </Route>
          <Route path="*" element={<LegalPage kind="notFound" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
