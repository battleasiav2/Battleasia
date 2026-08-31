/**
 * Global permissions object
 * Centralized permission keys for type safety and maintainability
 */
export const PERMISSIONS = {
  // Users permissions
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    EDIT: 'users.edit',
    DELETE: 'users.delete',
  },
  
  // Matches permissions
  MATCHES: {
    VIEW: 'matches.view',
    CREATE: 'matches.create',
    EDIT: 'matches.edit',
    DELETE: 'matches.delete',
    RESULT: 'matches.result',
  },
  
  // Payments permissions
  PAYMENTS: {
    VIEW: 'payments.view',
    MANAGE: 'payments.manage',
  },
  
  // Notifications permissions
  NOTIFICATIONS: {
    SEND: 'notifications.send',
  },
  
  // Feed permissions
  FEED: {
    VIEW: 'feed.view',
    CREATE: 'feed.create',
    EDIT: 'feed.edit',
    DELETE: 'feed.delete',
  },
  
  // Customer Support permissions
  CUSTOMER_SUPPORT: {
    VIEW: 'customer-support.view',
    REPLY: 'customer-support.reply',
    CLOSE: 'customer-support.close',
  },

  // shop permissions
  SHOP: {
    VIEW: 'shop.view',
    CREATE: 'shop.create',
    EDIT: 'shop.edit',
    DELETE: 'shop.delete',
  },

  ENGAGEMENT: {
    VIEW: 'engagement.view',
    EDIT: 'engagement.edit',
  },
  
} as const;

/**
 * Type for permission keys
 */
export type PermissionKey = 
  | typeof PERMISSIONS.USERS[keyof typeof PERMISSIONS.USERS]
  | typeof PERMISSIONS.MATCHES[keyof typeof PERMISSIONS.MATCHES]
  | typeof PERMISSIONS.PAYMENTS[keyof typeof PERMISSIONS.PAYMENTS]
  | typeof PERMISSIONS.NOTIFICATIONS[keyof typeof PERMISSIONS.NOTIFICATIONS]
  | typeof PERMISSIONS.FEED[keyof typeof PERMISSIONS.FEED]
  | typeof PERMISSIONS.CUSTOMER_SUPPORT[keyof typeof PERMISSIONS.CUSTOMER_SUPPORT]
  | typeof PERMISSIONS.SHOP[keyof typeof PERMISSIONS.SHOP]
  | typeof PERMISSIONS.ENGAGEMENT[keyof typeof PERMISSIONS.ENGAGEMENT];

/**
 * Get all available permission values as an array
 * Useful for validation, filtering, and comparison
 */
export const getAllPermissions = (): string[] => {
  const permissions: string[] = [];
  
  // Extract all permission values from nested structure
  Object.values(PERMISSIONS).forEach((category) => {
    Object.values(category).forEach((permission) => {
      permissions.push(permission);
    });
  });
  
  return permissions;
};

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = (category: keyof typeof PERMISSIONS): string[] => 
  Object.values(PERMISSIONS[category]);

/**
 * Check if a permission string is valid (exists in PERMISSIONS)
 */
export const isValidPermission = (permission: string): permission is PermissionKey => 
  getAllPermissions().includes(permission);

/**
 * Get permission label from key
 * Converts 'users.view' to 'View Users'
 */
export const getPermissionLabel = (permission: string): string => {
  const parts = permission.split('.');
  if (parts.length !== 2) return permission;
  
  const [category, action] = parts;
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  
  return `${actionLabel} ${categoryLabel}`;
};

/**
 * Get permission category from key
 * Converts 'users.view' to 'Users'
 */
export const getPermissionCategory = (permission: string): string => {
  const parts = permission.split('.');
  if (parts.length !== 2) {
    return 'General';
  }
  
  const [category] = parts;
  return category.charAt(0).toUpperCase() + category.slice(1);
};

/**
 * Format all permissions as options with label and category
 */
export const getAllPermissionsAsOptions = (): Array<{ value: string; label: string; category: string }> => {
  const options: Array<{ value: string; label: string; category: string }> = [];
  
  Object.entries(PERMISSIONS).forEach(([categoryKey, categoryPermissions]) => {
    const category = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    Object.values(categoryPermissions).forEach((permission) => {
      options.push({
        value: permission,
        label: getPermissionLabel(permission),
        category,
      });
    });
  });
  
  return options;
};

/**
 * Filter permissions based on parent role's permissions
 * Child role can only have permissions that parent has
 */
export const filterPermissionsByParent = (
  parentPermissions: string[] | undefined | null
): Array<{ value: string; label: string; category: string }> => {
  const allOptions = getAllPermissionsAsOptions();
  
  // If no parent or parent has no permissions, return all permissions
  if (!parentPermissions || parentPermissions.length === 0) {
    return allOptions;
  }
  
  // Filter to only include permissions that parent has
  return allOptions.filter((option) => parentPermissions.includes(option.value));
};

