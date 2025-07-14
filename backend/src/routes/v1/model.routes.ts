/**
 * Model Routes
 * RESTful API endpoints for model/miniature management
 * Implements Issue #20 acceptance criteria
 */

import { Router, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

import { PaintingStatus } from '../../generated/prisma';
import { prisma } from '../../lib/database';
import { authenticateToken, optionalAuth } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/errorHandler';
import { ModelService } from '../../services/model.service';
import { AuthenticatedRequest } from '../../types/auth';

const router = Router();
const modelService = new ModelService(prisma);

/**
 * Validation middleware
 */
const validateCreateModel = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be between 1-255 characters'),
  body('collectionId')
    .isLength({ min: 1 })
    .withMessage('Collection ID is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be max 1000 characters'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Manufacturer must be max 255 characters'),
  body('scale')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Scale must be max 50 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material must be max 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 20) {
        throw new Error('Maximum 20 tags allowed');
      }
      if (tags && tags.some((tag: unknown) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with max 50 characters');
      }
      return true;
    }),
  body('purchased')
    .optional()
    .isBoolean()
    .withMessage('Purchased must be a boolean'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid ISO8601 date'),
  body('paintingStatus')
    .optional()
    .isIn(['UNPAINTED', 'PRIMED', 'BASE_COATED', 'IN_PROGRESS', 'COMPLETED', 'SHOWCASE'])
    .withMessage('Painting status must be one of: UNPAINTED, PRIMED, BASE_COATED, IN_PROGRESS, COMPLETED, SHOWCASE'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be max 2000 characters'),
];

const validateUpdateModel = [
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
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Manufacturer must be max 255 characters'),
  body('scale')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Scale must be max 50 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material must be max 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 20) {
        throw new Error('Maximum 20 tags allowed');
      }
      if (tags && tags.some((tag: unknown) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with max 50 characters');
      }
      return true;
    }),
  body('purchased')
    .optional()
    .isBoolean()
    .withMessage('Purchased must be a boolean'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid ISO8601 date'),
  body('paintingStatus')
    .optional()
    .isIn(['UNPAINTED', 'PRIMED', 'BASE_COATED', 'IN_PROGRESS', 'COMPLETED', 'SHOWCASE'])
    .withMessage('Painting status must be one of: UNPAINTED, PRIMED, BASE_COATED, IN_PROGRESS, COMPLETED, SHOWCASE'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be max 2000 characters'),
];

const validateBulkUpdate = [
  body('modelIds')
    .isArray({ min: 1 })
    .withMessage('Model IDs array is required and must not be empty'),
  body('modelIds.*')
    .isLength({ min: 1 })
    .withMessage('Each model ID must be provided'),
  body('updates')
    .isObject()
    .withMessage('Updates object is required'),
  body('updates.tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('updates.paintingStatus')
    .optional()
    .isIn(['UNPAINTED', 'PRIMED', 'BASE_COATED', 'IN_PROGRESS', 'COMPLETED', 'SHOWCASE'])
    .withMessage('Painting status must be one of: UNPAINTED, PRIMED, BASE_COATED, IN_PROGRESS, COMPLETED, SHOWCASE'),
  body('updates.purchased')
    .optional()
    .isBoolean()
    .withMessage('Purchased must be a boolean'),
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
    .isIn(['name', 'createdAt', 'updatedAt', 'paintingStatus'])
    .withMessage('SortBy must be one of: name, createdAt, updatedAt, paintingStatus'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),
];

const validateModelId = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('Model ID is required'),
];

const validateCollectionId = [
  param('collectionId')
    .isLength({ min: 1 })
    .withMessage('Collection ID is required'),
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
 * POST /api/v1/models
 * Add a new model to a collection
 */
router.post(
  '/',
  authenticateToken,
  validateCreateModel,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const model = await modelService.addModel(userId, req.body);

      res.status(201).json({
        success: true,
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/models/collection/:collectionId
 * Get models in a collection
 */
router.get(
  '/collection/:collectionId',
  validateCollectionId,
  validatePagination,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const collectionId = req.params.collectionId;
      const userId = req.user?.id;

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as 'name' | 'createdAt' | 'updatedAt' | 'paintingStatus',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      // Extract filter parameters
      const filters = {
        search: req.query.search as string,
        paintingStatus: req.query.paintingStatus as PaintingStatus,
        gameSystemId: req.query.gameSystemId as string,
        factionId: req.query.factionId as string,
        tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) as string[] : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const result = await modelService.getModelsByCollection(collectionId, userId, filters, pagination);

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
 * GET /api/v1/models/search
 * Search models across all user's collections
 */
router.get(
  '/search',
  authenticateToken,
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
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const query = req.query.q as string;
      
      const filters = {
        search: query,
        tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags as string[] : [req.query.tags as string]) : undefined,
        paintingStatus: req.query.paintingStatus as PaintingStatus,
        collectionId: req.query.collectionId as string,
        userId: userId,
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as 'name' | 'createdAt' | 'updatedAt' | 'paintingStatus',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await modelService.searchModels(filters, pagination);

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
 * PUT /api/v1/models/bulk-update
 * Bulk update multiple models
 */
router.put(
  '/bulk-update',
  authenticateToken,
  validateBulkUpdate,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { modelIds, updates } = req.body;
      const bulkData = { modelIds, updates };
      const result = await modelService.bulkUpdateModels(userId, bulkData);

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
 * GET /api/v1/models/:id
 * Get model by ID
 */
router.get(
  '/:id',
  optionalAuth,
  validateModelId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const modelId = req.params.id;
      const userId = req.user?.id;

      const model = await modelService.getModelById(modelId, userId);

      if (!model) {
        throw new AppError('Model not found', 404);
      }

      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/models/:id
 * Update model
 */
router.put(
  '/:id',
  authenticateToken,
  validateModelId,
  validateUpdateModel,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const modelId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const model = await modelService.updateModel(modelId, userId, req.body);

      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/models/:id
 * Delete model
 */
router.delete(
  '/:id',
  authenticateToken,
  validateModelId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const modelId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await modelService.deleteModel(modelId, userId);

      res.json({
        success: true,
        message: 'Model deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/models/:id/photos
 * Add photos to a model
 */
router.post(
  '/:id/photos',
  authenticateToken,
  validateModelId,
  [
    body('photos')
      .isArray({ min: 1 })
      .withMessage('Photos array is required and must not be empty'),
    body('photos.*.fileName')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('File name is required and must be between 1-255 characters'),
    body('photos.*.originalUrl')
      .isURL()
      .withMessage('Original URL must be valid'),
    body('photos.*.description')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Description must be max 255 characters'),
    body('photos.*.isPrimary')
      .optional()
      .isBoolean()
      .withMessage('isPrimary must be a boolean'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const modelId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const photos = req.body.photos;
      const model = await modelService.addModelPhotos(modelId, userId, photos);

      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as modelRoutes };
