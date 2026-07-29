import { useMemo } from 'react';
import { useSelector } from 'src/store';

/**
 * Hook to check user permissions
 * Returns functions to check if user has specific permissions
 */
export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);

  // Check role type first, fallback to name for backward compatibility
  const roleType = useMemo(() => {
    if (user?.role?.type) {
      return user.role.type.toLowerCase();
    }
    // Fallback to name for backward compatibility
    if (user?.role?.name) {
      const nameLower = user.role.name.toLowerCase();
      if (nameLower === 'admin') {
        return 'admin';
      }
      if (nameLower === 'official') {
        return 'official';
      }
      if (nameLower === 'agent') {
        return 'agent';
      }
      return 'player';
    }
    return null;
  }, [user?.role?.type, user?.role?.name]);

  const isAdmin = useMemo(() => roleType === 'admin', [roleType]);

  const isOfficial = useMemo(() => roleType === 'official', [roleType]);

  const isAgent = useMemo(() => roleType === 'agent', [roleType]);

  const permissions = useMemo(() => {
    // Admin has all permissions (empty array means all)
    if (isAdmin) {
      return []; // Empty means all permissions
    }
    return user?.role?.permissions || [];
  }, [isAdmin, user?.role?.permissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useMemo(() => (permission: string): boolean => {
    // Admin has all permissions
    if (isAdmin) {
      return true;
    }
    // Check if permission exists in user's permissions array
    return permissions.includes(permission);
  }, [isAdmin, permissions]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useMemo(() => (requiredPermissions: string[]): boolean => {
    if (isAdmin) {
      return true;
    }
    return requiredPermissions.some(perm => permissions.includes(perm));
  }, [isAdmin, permissions]);

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useMemo(() => (requiredPermissions: string[]): boolean => {
    if (isAdmin) {
      return true;
    }
    return requiredPermissions.every(perm => permissions.includes(perm));
  }, [isAdmin, permissions]);

  return {
    isAdmin,
    isOfficial,
    isAgent,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

