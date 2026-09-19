import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireShopAuth } from './components/RequireShopAuth';
import { ShopShell } from './components/ShopShell';
import { RouteProgress } from './components/RouteProgress';
import { OfflineBanner } from './components/OfflineBanner';
import { Spotlight } from './components/Spotlight';

const SignInPage = lazy(() => import('./pages/auth/SignIn').then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./pages/auth/SignUp').then((m) => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword').then((m) => ({ default: m.ResetPasswordPage })));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerification').then((m) => ({ default: m.EmailVerificationPage })));
const LegalPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.LegalPage })));
const ShopPage = lazy(() => import('./pages/user/Shop').then((m) => ({ default: m.ShopPage })));
const WalletPage = lazy(() => import('./pages/user/Wallet').then((m) => ({ default: m.WalletPage })));
const TransferPage = lazy(() => import('./pages/user/Transfer').then((m) => ({ default: m.TransferPage })));
const WithdrawalPage = lazy(() => import('./pages/user/Withdrawal').then((m) => ({ default: m.WithdrawalPage })));

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Spotlight />
      <RouteProgress />
      <Suspense fallback={<div className="auth-shell" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/user/shop" replace />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/email-verification" element={<EmailVerificationPage />} />
          <Route path="/privacy-policy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms-and-conditions" element={<LegalPage kind="terms" />} />
          <Route
            element={
              <RequireShopAuth>
                <ShopShell />
              </RequireShopAuth>
            }
          >
            <Route path="/user" element={<Navigate to="/user/shop" replace />} />
            <Route path="/user/shop" element={<ShopPage />} />
            <Route path="/user/wallet" element={<WalletPage />} />
            <Route path="/user/transfer" element={<TransferPage />} />
            <Route path="/user/withdrawal" element={<WithdrawalPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
