import { Navigate, useSearchParams } from 'react-router-dom';

/** Legacy /auth/* URLs → landing modals (zip UX). OAuth finish stays on its route. */
export function AuthRouteRedirect({ auth }: { auth: 'signin' | 'signup' | 'forgot' | 'reset' | 'otp' }) {
  const [params] = useSearchParams();
  const q = new URLSearchParams({ auth });
  const returnTo = params.get('returnTo');
  const email = params.get('email');
  if (returnTo) q.set('returnTo', returnTo);
  if (email) q.set('email', email);
  const oauth = params.get('oauth');
  if (oauth) q.set('oauth', oauth);
  const ref = params.get('ref');
  if (ref) q.set('ref', ref);
  return <Navigate to={`/dashboard?${q.toString()}`} replace />;
}
