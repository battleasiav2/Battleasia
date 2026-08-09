/** Cross-app SSO: main app opens shop with `#ba_handoff=<jwt>`. */

export const HANDOFF_HASH_KEY = 'ba_handoff';

export function hasPendingAuthHandoff(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hash.includes(`${HANDOFF_HASH_KEY}=`);
}

export function consumeAuthHandoffToken(): string | null {
  if (typeof window === 'undefined') return null;

  const { hash } = window.location;
  if (!hash || !hash.includes(HANDOFF_HASH_KEY)) return null;

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const token = params.get(HANDOFF_HASH_KEY);
  params.delete(HANDOFF_HASH_KEY);

  const nextHash = params.toString();
  const cleanUrl =
    `${window.location.pathname}${window.location.search}` + (nextHash ? `#${nextHash}` : '');

  window.history.replaceState(null, '', cleanUrl);

  return token?.trim() || null;
}
