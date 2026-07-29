import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import AuthGuard from 'src/utils/authguard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

const GameListPage = lazy(() => import('src/pages/games/list'));
const MatchListPage = lazy(() => import('src/pages/games/matches'));
const MatchResultPage = lazy(() => import('src/pages/games/match-result'));
const ParticipantsHistoryPage = lazy(() => import('src/pages/games/participants-history'));

export const gamesRoutes = [
  {
    path: 'games',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <GameListPage />, index: true },
      { path: 'list', element: <GameListPage /> },
      { path: 'matches', element: <MatchListPage /> },
      { path: 'matches/:matchId/result', element: <MatchResultPage /> },
      { path: 'participants-history', element: <ParticipantsHistoryPage /> },
    ],
  },
];

