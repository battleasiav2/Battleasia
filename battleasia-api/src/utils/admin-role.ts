import type { IUser } from '../models/User.js';

const ADMIN_ROLES = new Set(['admin', 'official', 'agent']);

export function isAdminRole(user: Pick<IUser, 'role'> | null | undefined): boolean {
  return ADMIN_ROLES.has(user?.role?.type || '');
}
