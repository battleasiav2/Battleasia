import { paths } from 'src/routes/paths';

const AUTH_RETURN_ALLOW = /^\/(user|dashboard)\b/;

export function safeAuthReturnPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    // keep raw
  }
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//') || value.includes('://')) return null;
  if (!AUTH_RETURN_ALLOW.test(value)) return null;
  return value;
}

export function signInWithReturn(returnTo: string): string {
  return `${paths.auth.signIn}?returnTo=${encodeURIComponent(returnTo)}`;
}
