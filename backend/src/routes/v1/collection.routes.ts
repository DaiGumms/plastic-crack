/**
 * Collection Routes
 * RESTful API endpoints for collection management
 * Implements Issue #19 acceptance criteria
 */

import { Router, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

import { prisma } from '../../lib/database';
import { authenticateToken } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/errorHandler';
import { CollectionService } from '../../services/collection.service';
import { AuthenticatedRequest } from '../../types/auth';

const router = Router();
const collectionService = new CollectionService(prisma);

/**
 * Validation middleware
 */
const validateCreateCollection = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be between 1-255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be max 1000 characters'),
  body('gameSystemId')
    .notEmpty()
    .withMessage('Game system ID is required')
    .isString()
    .withMessage('Game system ID must be a string'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom(tags => {
      if (tags && tags.length > 20) {
        throw new Error('Maximum 20 tags allowed');
      }
      if (
        tags &&
        tags.some((tag: unknown) => typeof tag !== 'string' || tag.length > 50)
      ) {
        throw new Error('Each tag must be a string with max 50 characters');
      }
      return true;
    }),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

const validateUpdateCollection = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1-255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be max 1000 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom(tags => {
      if (tags && tags.length > 20) {
        throw new Error('Maximum 20 tags allowed');
      }
      if (
        tags &&
        tags.some((tag: unknown) => typeof tag !== 'string' || tag.length > 50)
      ) {
        throw new Error('Each tag must be a string with max 50 characters');
      }
      return true;
    }),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt'])
    .withMessage('SortBy must be one of: name, createdAt, updatedAt'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),
];

const validateCollectionId = [
  param('id').isLength({ min: 1 }).withMessage('Collection ID is required'),
];

/**
 * Error handling middleware
 */
const handleValidationErrors = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
};

/**
 * POST /api/v1/collections
 * Create a new collection
 */
router.post(
  '/',
  authenticateToken,
  validateCreateCollection,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const collection = await collectionService.createCollection(
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/collections
 * Get collections with pagination and filtering
 */
router.get(
  '/',
  validatePagination,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string,
        isPublic: req.query.isPublic ? req.query.isPublic === 'true' : true, // Default to public only
        tags: req.query.tags
          ? Array.isArray(req.query.tags)
            ? (req.query.tags as string[])
            : [req.query.tags as string]
          : undefined,
        userId: req.query.userId as string,
        gameSystem: req.query.gameSystem as string,
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as 'name' | 'createdAt' | 'updatedAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await collectionService.getCollections(
        filters,
        pagination
      );

      // Return paginated response format expected by frontend
      res.json({
        success: true,
        data: result.collections,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/collections/search
 * Search collections
 */
router.get(
  '/search',
  [
    query('q')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Search query is required'),
    ...validatePagination,
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;

      const filters = {
        isPublic: req.query.isPublic
          ? req.query.isPublic === 'true'
          : undefined,
        tags: req.query.tags
          ? Array.isArray(req.query.tags)
            ? (req.query.tags as string[])
            : [req.query.tags as string]
          : undefined,
        userId: req.query.userId as string,
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as 'name' | 'createdAt' | 'updatedAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await collectionService.searchCollections(
        query,
        filters,
        pagination
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/collections/user/:userId
 * Get user's collections
 */
router.get(
  '/user/:userId',
  [param('userId').isLength({ min: 1 }).withMessage('User ID is required')],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user?.id;
      const includePrivate = currentUserId === userId;

      const collections = await collectionService.getUserCollections(
        userId,
        includePrivate
      );

      res.json({
        success: true,
        data: collections,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/collections/my
 * Get current user's collections with pagination and filtering
 */
router.get(
  '/my',
  authenticateToken,
  validatePagination,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const filters = {
        search: req.query.search as string,
        isPublic: req.query.isPublic
          ? req.query.isPublic === 'true'
          : undefined, // Allow both public and private for user's own collections
        tags: req.query.tags
          ? Array.isArray(req.query.tags)
            ? (req.query.tags as string[])
            : [req.query.tags as string]
          : undefined,
        userId: userId, // Force userId to current user
        gameSystem: req.query.gameSystem as string,
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as 'name' | 'createdAt' | 'updatedAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await collectionService.getCollections(
        filters,
        pagination
      );

      // Return paginated response format expected by frontend
      res.json({
        success: true,
        data: result.collections,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/collections/:id
 * Get collection by ID
 */
router.get(
  '/:id',
  authenticateToken,
  validateCollectionId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const collectionId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const collection = await collectionService.getCollectionById(
        collectionId,
        userId
      );

      if (!collection) {
        throw new AppError('Collection not found', 404);
      }

      res.json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/collections/:id
 * Update collection
 */
router.put(
  '/:id',
  authenticateToken,
  validateCollectionId,
  validateUpdateCollection,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const collectionId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const collection = await collectionService.updateCollection(
        collectionId,
        userId,
        req.body
      );

      res.json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/collections/:id/deletion-info
 * Get collection deletion information (for confirmation dialog)
 */
router.get(
  '/:id/deletion-info',
  authenticateToken,
  validateCollectionId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const collectionId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const deletionInfo = await collectionService.getCollectionDeletionInfo(
        collectionId,
        userId
      );

      res.json({
        success: true,
        data: deletionInfo,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/collections/:id
 * Delete collection
 */
router.delete(
  '/:id',
  authenticateToken,
  validateCollectionId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const collectionId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await collectionService.deleteCollection(collectionId, userId);

      res.json({
        success: true,
        message: 'Collection deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as collectionRoutes };
