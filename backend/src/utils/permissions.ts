import { UserRole } from '../types/auth';

/**
 * Predefined permissions for different resources and actions
 */
export const PERMISSIONS = {
  // User management
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  USER_ADMIN: 'user:admin',
  
  // Collection management
  COLLECTION_READ: 'collection:read',
  COLLECTION_WRITE: 'collection:write',
  COLLECTION_DELETE: 'collection:delete',
  COLLECTION_ADMIN: 'collection:admin',
  
  // Model management
  MODEL_READ: 'model:read',
  MODEL_WRITE: 'model:write',
  MODEL_DELETE: 'model:delete',
  MODEL_ADMIN: 'model:admin',
  
  // System administration
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_BACKUP: 'system:backup',
  
  // Content moderation
  CONTENT_MODERATE: 'content:moderate',
  CONTENT_REVIEW: 'content:review',
  CONTENT_DELETE: 'content:delete',
} as const;

/**
 * Default permissions for each role
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.COLLECTION_READ,
    PERMISSIONS.COLLECTION_WRITE,
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.MODEL_WRITE,
  ],
  
  [UserRole.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.COLLECTION_READ,
    PERMISSIONS.COLLECTION_WRITE,
    PERMISSIONS.COLLECTION_ADMIN,
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.MODEL_WRITE,
    PERMISSIONS.MODEL_ADMIN,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.CONTENT_REVIEW,
  ],
  
  [UserRole.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ADMIN,
    PERMISSIONS.COLLECTION_READ,
    PERMISSIONS.COLLECTION_WRITE,
    PERMISSIONS.COLLECTION_DELETE,
    PERMISSIONS.COLLECTION_ADMIN,
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.MODEL_WRITE,
    PERMISSIONS.MODEL_DELETE,
    PERMISSIONS.MODEL_ADMIN,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.CONTENT_REVIEW,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.SYSTEM_MONITOR,
  ],
  
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS),
  ],
};

/**
 * Check if a role has a specific permission by default
 */
export function roleHasPermission(role: UserRole, permission: string): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return DEFAULT_ROLE_PERMISSIONS[role];
}

/**
 * Combine role-based and explicit permissions
 */
export function getUserPermissions(role: UserRole, explicitPermissions: string[] = []): string[] {
  const rolePermissions = getRolePermissions(role);
  const allPermissions = new Set([...rolePermissions, ...explicitPermissions]);
  return Array.from(allPermissions);
}

/**
 * Check if user has permission (either from role or explicit)
 */
export function userHasPermission(
  userRole: UserRole, 
  userPermissions: string[], 
  requiredPermission: string
): boolean {
  const allPermissions = getUserPermissions(userRole, userPermissions);
  return allPermissions.includes(requiredPermission);
}

/**
 * Resource-based permission patterns
 */
export const RESOURCE_ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
} as const;

/**
 * Generate permission string for a resource and action
 */
export function generatePermission(resource: string, action: string): string {
  return `${resource}:${action}`;
}

/**
 * Parse permission string into resource and action
 */
export function parsePermission(permission: string): { resource: string; action: string } | null {
  const parts = permission.split(':');
  if (parts.length !== 2) {
    return null;
  }
  return {
    resource: parts[0],
    action: parts[1],
  };
}
