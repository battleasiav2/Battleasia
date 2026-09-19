import { Navigate, useLocation } from 'react-router-dom';
import { can, isAdminAuthed } from '../lib/auth';
import { NoIndex } from './NoIndex';

export function RequireAdmin({ children, perm }: { children: React.ReactNode; perm?: string | null }) {
  const location = useLocation();
  if (!isAdminAuthed()) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (perm && !can(perm)) {
    return <Navigate to="/403" replace />;
  }
  return (
    <>
      <NoIndex />
      {children}
    </>
  );
}
