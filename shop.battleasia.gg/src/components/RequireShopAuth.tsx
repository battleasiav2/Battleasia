import { Navigate, useLocation } from 'react-router-dom';
import { isShopAuthed } from '../lib/auth';
import { NoIndex } from './NoIndex';

export function RequireShopAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isShopAuthed()) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return (
    <>
      <NoIndex />
      {children}
    </>
  );
}
