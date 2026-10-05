import { safeReturnTo } from './auth';

export type LandingAuthView = 'signin' | 'signup' | 'forgot' | 'reset' | 'otp';

const VIEWS = new Set<LandingAuthView>(['signin', 'signup', 'forgot', 'reset', 'otp']);

export function parseLandingAuthView(raw: string | null): LandingAuthView | null {
  if (!raw) return null;
  return VIEWS.has(raw as LandingAuthView) ? (raw as LandingAuthView) : null;
}

type AuthHrefOpts = {
  returnTo?: string | null;
  email?: string | null;
  oauth?: string | null;
  ref?: string | null;
};

/** Open zip-style auth modals on `/dashboard` (or current landing path). */
export function landingAuthHref(auth: LandingAuthView, opts?: AuthHrefOpts, basePath = '/dashboard') {
  const q = new URLSearchParams({ auth });
  if (opts?.returnTo) q.set('returnTo', safeReturnTo(opts.returnTo));
  const email = (opts?.email || '').trim();
  if (email) q.set('email', email);
  const oauth = (opts?.oauth || '').trim();
  if (oauth) q.set('oauth', oauth);
  const ref = (opts?.ref || '').trim();
  if (ref) q.set('ref', ref);
  return `${basePath}?${q.toString()}`;
}

export function guestPlayHref(playPath: string) {
  return landingAuthHref('signin', { returnTo: playPath });
}
