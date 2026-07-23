const ADMIN_ROLES = new Set(['admin', 'official', 'agent']);
export function isAdminRole(user) {
    return ADMIN_ROLES.has(user?.role?.type || '');
}
