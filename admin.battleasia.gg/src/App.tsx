import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminShell } from './components/AdminShell';
import { RequireAdmin } from './components/RequireAdmin';
import { INTEGRITY, LISTS, SETTINGS } from './lib/catalog';
import { OfflineBanner } from './components/OfflineBanner';

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AdminOtpPage = lazy(() => import('./pages/AdminOtpPage').then((m) => ({ default: m.AdminOtpPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ListPage = lazy(() => import('./pages/ListPage').then((m) => ({ default: m.ListPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const MailSettingsPage = lazy(() =>
  import('./pages/MailSettingsPage').then((m) => ({ default: m.MailSettingsPage }))
);
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })));
const WalletOpsPage = lazy(() => import('./pages/WalletOpsPage').then((m) => ({ default: m.WalletOpsPage })));
const GameFormPage = lazy(() => import('./pages/GameFormPage').then((m) => ({ default: m.GameFormPage })));
const MatchFormPage = lazy(() => import('./pages/MatchFormPage').then((m) => ({ default: m.MatchFormPage })));
const MatchResultPage = lazy(() => import('./pages/MatchResultPage').then((m) => ({ default: m.MatchResultPage })));
const SupportThreadPage = lazy(() => import('./pages/SupportThreadPage').then((m) => ({ default: m.SupportThreadPage })));
const IntegrityPage = lazy(() => import('./pages/IntegrityPage').then((m) => ({ default: m.IntegrityPage })));
const FlagsPage = lazy(() => import('./pages/FlagsPage').then((m) => ({ default: m.FlagsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ForbiddenPage = lazy(() => import('./pages/StatusPages').then((m) => ({ default: m.ForbiddenPage })));
const NotFoundPage = lazy(() => import('./pages/StatusPages').then((m) => ({ default: m.NotFoundPage })));

const GENERIC_SETTINGS = Object.keys(SETTINGS).filter((path) => path !== '/system/mail-settings');

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Suspense fallback={<div className="auth-shell" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/otp" element={<AdminOtpPage />} />
          <Route
            element={
              <RequireAdmin>
                <AdminShell />
              </RequireAdmin>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            {Object.keys(LISTS).map((path) => (
              <Route key={path} path={path} element={<ListPage />} />
            ))}
            {GENERIC_SETTINGS.map((path) => (
              <Route key={path} path={path} element={<SettingsPage />} />
            ))}
            {Object.keys(INTEGRITY).map((path) => (
              <Route key={path} path={path} element={<IntegrityPage />} />
            ))}
            <Route path="/system/mail-settings" element={<MailSettingsPage />} />
            <Route path="/feature-flags" element={<FlagsPage />} />
            <Route path="/payments/wallet" element={<WalletOpsPage />} />
            <Route path="/payments/deposit" element={<PaymentsPage />} />
            <Route path="/payments/withdrawal" element={<PaymentsPage />} />
            <Route path="/games/list/new" element={<GameFormPage />} />
            <Route path="/games/list/:id/edit" element={<GameFormPage />} />
            <Route path="/games/matches/new" element={<MatchFormPage />} />
            <Route path="/games/matches/:id/edit" element={<MatchFormPage />} />
            <Route path="/games/matches/:id/result" element={<MatchResultPage />} />
            <Route path="/customer-support/:conversationId" element={<SupportThreadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
