/** Tab-scoped gate — shop pages require a fresh sign-in each browser session. */
export const SHOP_SESSION_KEY = 'ba_shop_gate';

export function markShopSessionActive() {
  try {
    sessionStorage.setItem(SHOP_SESSION_KEY, '1');
  } catch {
    // ignore storage errors
  }
}

export function clearShopSession() {
  try {
    sessionStorage.removeItem(SHOP_SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}

export function hasShopSession(): boolean {
  try {
    return sessionStorage.getItem(SHOP_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearShopPersistStorage() {
  try {
    localStorage.removeItem('persist:battleasia-shop');
  } catch {
    // ignore storage errors
  }
}
