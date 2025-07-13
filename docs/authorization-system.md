# Authorization System Documentation

## Overview

The Plastic Crack application implements a comprehensive role-based access control (RBAC) system
with JWT authentication and fine-grained permissions. This system was implemented as part of Issue
#7.

## User Roles

The system defines four hierarchical roles:

### 1. USER (Default)

- Basic user with limited permissions
- Can manage their own profile and collections
- Cannot access administrative functions

### 2. MODERATOR

- Elevated permissions for content moderation
- Can manage content across the platform
- Can review and moderate user-generated content

### 3. ADMIN

- Administrative access to most system functions
- Can manage users, content, and system settings
- Cannot access super admin functions

### 4. SUPER_ADMIN

- Full system access
- Can access all functions including system configuration
- Highest level of access

## Permission System

### Permission Structure

Permissions follow the format: `resource:action`

Examples:

- `user:read` - Read user information
- `collection:write` - Create/modify collections
- `admin:delete` - Delete administrative resources

### Default Role Permissions

#### USER Role

- `user:read`
- `collection:read`
- `collection:write`
- `model:read`
- `model:write`

#### MODERATOR Role

- All USER permissions plus:
- `collection:admin`
- `model:admin`
- `content:moderate`
- `content:review`

#### ADMIN Role

- All MODERATOR permissions plus:
- `user:write`
- `user:delete`
- `user:admin`
- `collection:delete`
- `model:delete`
- `content:delete`
- `system:monitor`

#### SUPER_ADMIN Role

- All permissions in the system

## Middleware Functions

### Authentication Middleware

#### `authenticateToken`

Verifies JWT tokens and injects user context into the request.

```typescript
router.get('/protected', authenticateToken, (req, res) => {
  // req.user is now available with role and permissions
});
```

#### `optionalAuth`

Similar to `authenticateToken` but doesn't fail for unauthenticated requests.

### Authorization Middleware

#### `requireRole(...roles)`

Requires user to have one of the specified roles.

```typescript
// Only allow admins and super admins
router.delete(
  '/users/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  handler
);
```

#### `requirePermission(...permissions)`

Requires user to have all specified permissions.

```typescript
// Require specific permission
router.post('/moderate', authenticateToken, requirePermission('content:moderate'), handler);
```

#### `requireRoleOrPermission(roles, permissions)`

Requires user to have either the role OR the permission.

```typescript
// Admin role OR specific permission
router.get(
  '/analytics',
  authenticateToken,
  requireRoleOrPermission([UserRole.ADMIN], ['analytics:view']),
  handler
);
```

#### `requireResourcePermission(resource, action)`

Convenience function for resource-specific permissions.

```typescript
// Equivalent to requirePermission('collection:delete')
router.delete(
  '/collections/:id',
  authenticateToken,
  requireResourcePermission('collection', 'delete'),
  handler
);
```

#### `requireOwnershipOrAdmin(getUserId)`

Allows access if user owns the resource OR has admin privileges.

```typescript
// Users can access their own profile OR admins can access any profile
router.get(
  '/users/:id/profile',
  authenticateToken,
  requireOwnershipOrAdmin(req => req.params.id),
  handler
);
```

### Convenience Middleware

#### `requireAdmin`

Shorthand for requiring ADMIN or SUPER_ADMIN role.

#### `requireModerator`

Shorthand for requiring MODERATOR, ADMIN, or SUPER_ADMIN role.

## Usage Examples

### Basic Route Protection

```typescript
import { authenticateToken, requireAdmin, requirePermission } from '../middleware/auth.middleware';

// Public route - no authentication
router.get('/public-data', handler);

// Authenticated route - requires valid JWT
router.get('/profile', authenticateToken, handler);

// Admin only route
router.delete('/users/:id', authenticateToken, requireAdmin, handler);

// Permission-based route
router.post('/moderate-content', authenticateToken, requirePermission('content:moderate'), handler);
```

### Resource Ownership

```typescript
// Users can edit their own posts, or admins can edit any post
router.put(
  '/posts/:id',
  authenticateToken,
  requireOwnershipOrAdmin(req => {
    // This function should return the user ID who owns the post
    return getPostOwnerId(req.params.id);
  }),
  handler
);
```

### Multiple Permissions

```typescript
// Require multiple permissions (ALL must be present)
router.post(
  '/admin-action',
  authenticateToken,
  requirePermission('admin:write', 'system:config'),
  handler
);

// Require role OR permission (ANY can be present)
router.get(
  '/dashboard',
  authenticateToken,
  requireRoleOrPermission([UserRole.ADMIN], ['dashboard:view']),
  handler
);
```

## Database Schema

### User Model Extensions

The User model includes:

```sql
role        UserRole @default(USER)
permissions String[] @default([])
```

### Role Enum

```sql
enum UserRole {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}
```

## JWT Token Structure

JWT tokens now include role information:

```json
{
  "userId": "user_id",
  "username": "username",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Permission Utilities

The system includes utility functions for permission management:

```typescript
import { getUserPermissions, userHasPermission } from '../utils/permissions';

// Get all permissions for a user (role + explicit permissions)
const allPermissions = getUserPermissions(user.role, user.permissions);

// Check if user has specific permission
const canDelete = userHasPermission(user.role, user.permissions, 'collection:delete');
```

## Security Considerations

1. **JWT Secret**: Ensure `JWT_SECRET` environment variable is set to a strong, random value
2. **Token Expiration**: Tokens expire after 7 days by default
3. **Permission Validation**: All permissions are validated server-side
4. **Role Hierarchy**: Higher roles inherit permissions from lower roles
5. **Explicit Permissions**: Users can have additional permissions beyond their role

## Testing

The authorization system includes comprehensive tests covering:

- Role-based access control
- Permission validation
- Ownership verification
- Token authentication
- Edge cases and error handling

Run authorization tests:

```bash
npm test -- --testPathPattern=auth-middleware.test.ts
```

## Migration

The role system was added via Prisma migration. To apply:

```bash
npx prisma migrate dev --name add-user-roles
```

This migration:

1. Adds `UserRole` enum with four roles
2. Adds `role` field to User model (defaults to USER)
3. Adds `permissions` array field for explicit permissions

## Best Practices

1. **Principle of Least Privilege**: Grant minimum permissions necessary
2. **Use Appropriate Middleware**: Choose the most specific middleware for your needs
3. **Test Authorization**: Always test both positive and negative authorization cases
4. **Document Permissions**: Clearly document what permissions are required for each endpoint
5. **Regular Audits**: Periodically review and audit user roles and permissions

## Future Enhancements

Potential improvements to consider:

- Dynamic permission assignment through admin interface
- Permission groups/bundles
- Time-based permissions (temporary access)
- Resource-specific ownership models
- Audit logging for permission changes
- Integration with external identity providers
