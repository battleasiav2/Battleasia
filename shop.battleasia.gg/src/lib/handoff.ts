/** Consume player → shop session handoff from URL hash (`#ba_a=…&ba_r=…`). Clears hash immediately. */
export function consumePlayerHandoff() {
  if (typeof window === 'undefined') return false;
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || (!raw.includes('ba_a=') && !raw.includes('ba_r='))) return false;

  // Strip tokens from the address bar before any other work (Referer / history leak).
  const clean = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', clean);

  try {
    const params = new URLSearchParams(raw);
    const access = params.get('ba_a') || '';
    const refresh = params.get('ba_r') || '';
    if (!access && !refresh) return false;

    if (access) sessionStorage.setItem('ba-shop-access', access);
    if (refresh) sessionStorage.setItem('ba-shop-refresh', refresh);
    sessionStorage.setItem('ba_shop_gate', '1');
    return true;
  } catch {
    return false;
  }
}
