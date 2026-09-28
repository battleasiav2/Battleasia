/** Shop login lasts one hour from the moment the shop session starts. */

const HOUR_MS = 60 * 60 * 1000;
const UNTIL = 'ba-shop-until';

export const SHOP_GATE = 'ba_shop_gate';
export const SHOP_USER = 'ba-shop-user';
export const SHOP_REFRESH = 'ba-shop-refresh';
export const SHOP_ACCESS = 'ba-shop-access';

const KEYS = [SHOP_GATE, SHOP_USER, SHOP_REFRESH, SHOP_ACCESS] as const;

function read(key: string) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function write(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function shopUntil() {
  return Number(read(UNTIL)) || 0;
}

export function shopSessionAlive() {
  return shopUntil() > Date.now();
}

/** Starts the one-hour clock only when there is no live shop session. */
export function beginShopHour() {
  if (shopSessionAlive()) return;
  write(UNTIL, String(Date.now() + HOUR_MS));
}

export function readShopKey(key: string) {
  return read(key);
}

export function writeShopKey(key: string, value: string) {
  write(key, value);
}

export function clearShopSession() {
  for (const key of KEYS) write(key, '');
  write(UNTIL, '');
  try {
    for (const key of KEYS) sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Move an older tab-only login into the one-hour store. */
export function migrateShopSession() {
  try {
    for (const key of KEYS) {
      if (!localStorage.getItem(key)) {
        const prev = sessionStorage.getItem(key);
        if (prev) localStorage.setItem(key, prev);
      }
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  if (read(SHOP_GATE) === '1' && !shopUntil()) beginShopHour();
  if (!shopSessionAlive()) clearShopSession();
}
