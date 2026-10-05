import { Navigate, useLocation } from 'react-router-dom';
import { isSignedIn } from '../../lib/auth';
import { landingAuthHref } from '../../lib/landingAuth';
import { NoIndex } from '../NoIndex';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isSignedIn()) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={landingAuthHref('signin', { returnTo })} replace />;
  }
  return (
    <>
      <NoIndex />
      {children}
    </>
  );
}
