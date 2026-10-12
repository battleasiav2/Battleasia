import type { IUser } from '../models/User.js';

const ADMIN_ROLES = new Set(['admin', 'official', 'agent']);

export function isAdminRole(user: Pick<IUser, 'role'> | null | undefined): boolean {
  return ADMIN_ROLES.has(user?.role?.type || '');
}

/** Existing panel rule: role type admin bypasses permission keys. */
export function hasAdminPermission(user: Pick<IUser, 'role'> | null | undefined, key: string): boolean {
  if (!isAdminRole(user)) return false;
  if (user?.role?.type === 'admin') return true;
  return (user?.role?.permissions || []).includes(key);
}
