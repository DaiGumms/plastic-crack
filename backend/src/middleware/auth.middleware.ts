import { Response, NextFunction } from 'express';

import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest, UserRole } from '../types/auth';
import { getUserPermissions } from '../utils/permissions';

/**
 * Middleware to authenticate JWT tokens and inject user context
 */

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Get user from database
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Add user to request object with computed permissions
    const allPermissions = getUserPermissions(
      user.role,
      user.permissions || []
    );
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      permissions: allPermissions,
    };

    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(decoded.userId);

      if (user) {
        const allPermissions = getUserPermissions(
          user.role,
          user.permissions || []
        );
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          permissions: allPermissions,
        };
      }
    }

    next();
  } catch {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require specific permissions
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasPermission = requiredPermissions.every(permission =>
      req.user?.permissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredPermissions,
        current: req.user.permissions,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require either specific roles OR permissions
 */
export const requireRoleOrPermission = (
  allowedRoles: UserRole[] = [],
  allowedPermissions: string[] = []
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasRole =
      allowedRoles.length === 0 || allowedRoles.includes(req.user.role);
    const hasPermission =
      allowedPermissions.length === 0 ||
      allowedPermissions.some(permission =>
        req.user?.permissions.includes(permission)
      );

    if (!hasRole && !hasPermission) {
      res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        requiredPermissions: allowedPermissions,
        currentRole: req.user.role,
        currentPermissions: req.user.permissions,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is admin or super admin
 */
export const requireAdmin = requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Check if user is moderator or higher
 */
export const requireModerator = requireRole(
  UserRole.MODERATOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN
);

/**
 * Resource-based permission checker
 */
export const requireResourcePermission = (resource: string, action: string) => {
  return requirePermission(`${resource}:${action}`);
};

/**
 * Check if user can access own resource or has admin permissions
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const requireOwnershipOrAdmin = (
  getResourceUserId: (req: AuthenticatedRequest) => string // eslint-disable-line no-unused-vars
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceUserId = getResourceUserId(req);
    const isOwner = req.user.id === resourceUserId;
    const isAdmin =
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error:
          'Access denied - you can only access your own resources or need admin privileges',
      });
      return;
    }

    next();
  };
};
