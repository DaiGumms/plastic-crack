import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/auth';
import {
  requireRole,
  requirePermission,
  requireAdmin,
  requireModerator,
  requireResourcePermission,
  requireOwnershipOrAdmin,
} from '../middleware/auth.middleware';

// Mock AuthService
jest.mock('../services/auth.service');

describe('Authorization Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('requireRole', () => {
    it('should allow access for users with correct role', () => {
      const middleware = requireRole(UserRole.ADMIN);
      mockReq.user = {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        displayName: 'Admin User',
        role: UserRole.ADMIN,
        permissions: [],
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for users with incorrect role', () => {
      const middleware = requireRole(UserRole.ADMIN);
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Regular User',
        role: UserRole.USER,
        permissions: [],
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: [UserRole.ADMIN],
        current: UserRole.USER,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated users', () => {
      const middleware = requireRole(UserRole.USER);

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access for users with any of multiple allowed roles', () => {
      const middleware = requireRole(UserRole.ADMIN, UserRole.MODERATOR);
      mockReq.user = {
        id: '1',
        username: 'moderator',
        email: 'mod@test.com',
        displayName: 'Moderator User',
        role: UserRole.MODERATOR,
        permissions: [],
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('requirePermission', () => {
    it('should allow access for users with required permission', () => {
      const middleware = requirePermission('user:read');
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Test User',
        role: UserRole.USER,
        permissions: ['user:read', 'collection:write'],
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for users without required permission', () => {
      const middleware = requirePermission('admin:delete');
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Test User',
        role: UserRole.USER,
        permissions: ['user:read'],
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: ['admin:delete'],
        current: ['user:read'],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require all permissions when multiple are specified', () => {
      const middleware = requirePermission('user:read', 'user:write');
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Test User',
        role: UserRole.USER,
        permissions: ['user:read'], // Missing user:write
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin users', () => {
      mockReq.user = {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        displayName: 'Admin User',
        role: UserRole.ADMIN,
        permissions: [],
      };

      requireAdmin(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for super admin users', () => {
      mockReq.user = {
        id: '1',
        username: 'superadmin',
        email: 'superadmin@test.com',
        displayName: 'Super Admin',
        role: UserRole.SUPER_ADMIN,
        permissions: [],
      };

      requireAdmin(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for regular users', () => {
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Regular User',
        role: UserRole.USER,
        permissions: [],
      };

      requireAdmin(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireModerator', () => {
    it('should allow access for moderator and higher roles', () => {
      const roles = [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];

      roles.forEach(role => {
        jest.clearAllMocks();
        mockReq.user = {
          id: '1',
          username: 'user',
          email: 'user@test.com',
          displayName: 'Test User',
          role,
          permissions: [],
        };

        requireModerator(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    it('should deny access for regular users', () => {
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Regular User',
        role: UserRole.USER,
        permissions: [],
      };

      requireModerator(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireResourcePermission', () => {
    it('should create middleware that checks resource-specific permissions', () => {
      const middleware = requireResourcePermission('collection', 'delete');
      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Test User',
        role: UserRole.USER,
        permissions: ['collection:delete'],
      };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireOwnershipOrAdmin', () => {
    it('should allow access for resource owner', () => {
      const getResourceUserId = (req: AuthenticatedRequest) =>
        req.params?.userId || '1';
      const middleware = requireOwnershipOrAdmin(getResourceUserId);

      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Test User',
        role: UserRole.USER,
        permissions: [],
      };
      mockReq.params = { userId: '1' };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access for admin users', () => {
      const getResourceUserId = (req: AuthenticatedRequest) =>
        req.params?.userId || '2';
      const middleware = requireOwnershipOrAdmin(getResourceUserId);

      mockReq.user = {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        displayName: 'Admin User',
        role: UserRole.ADMIN,
        permissions: [],
      };
      mockReq.params = { userId: '2' };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-owner regular users', () => {
      const getResourceUserId = (req: AuthenticatedRequest) =>
        req.params?.userId || '2';
      const middleware = requireOwnershipOrAdmin(getResourceUserId);

      mockReq.user = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        displayName: 'Test User',
        role: UserRole.USER,
        permissions: [],
      };
      mockReq.params = { userId: '2' };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          'Access denied - you can only access your own resources or need admin privileges',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
