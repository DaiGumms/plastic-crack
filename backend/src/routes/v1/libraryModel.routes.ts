/**
 * Library Model Routes
 * RESTful API endpoints for browsing the model library catalog
 */

import { Router, Response, NextFunction } from 'express';
import { query, param, validationResult } from 'express-validator';

import { prisma } from '../../lib/database';
import { optionalAuth } from '../../middleware/auth.middleware';
import { LibraryModelService } from '../../services/libraryModel.service';
import { AuthenticatedRequest } from '../../types/auth';

const router = Router();
const libraryModelService = new LibraryModelService(prisma);

/**
 * Validation middleware
 */
const validateGetModels = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be max 100 characters'),
  query('gameSystemId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Game system ID must not be empty'),
  query('factionId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Faction ID must not be empty'),
  query('isOfficial')
    .optional()
    .isBoolean()
    .withMessage('isOfficial must be a boolean'),
];

const validateModelId = [
  param('id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Model ID is required'),
];

/**
 * Error handling middleware
 */
const handleValidationErrors = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * @route   GET /api/v1/library/models
 * @desc    Get paginated library models with filtering
 * @access  Public
 */
router.get(
  '/',
  validateGetModels,
  handleValidationErrors,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const gameSystemId = req.query.gameSystemId as string;
      const factionId = req.query.factionId as string;
      const isOfficial = req.query.isOfficial === 'true' ? true : 
                        req.query.isOfficial === 'false' ? false : undefined;
      const tags = Array.isArray(req.query.tags) ? req.query.tags as string[] : 
                   req.query.tags ? [req.query.tags as string] : undefined;

      const filters = {
        search,
        gameSystemId,
        factionId,
        isOfficial,
        tags,
      };

      const result = await libraryModelService.getModels(page, limit, filters);

      res.json({
        success: true,
        message: 'Library models retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/library/models/search
 * @desc    Search library models
 * @access  Public
 */
router.get(
  '/search',
  [
    query('q')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query is required and must be between 1-100 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  handleValidationErrors,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      const models = await libraryModelService.searchModels(query, limit);

      res.json({
        success: true,
        message: 'Search completed successfully',
        data: models,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/library/models/featured
 * @desc    Get featured/popular library models
 * @access  Public
 */
router.get(
  '/featured',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be between 1 and 20'),
  ],
  handleValidationErrors,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const models = await libraryModelService.getFeaturedModels(limit);

      res.json({
        success: true,
        message: 'Featured models retrieved successfully',
        data: models,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/library/models/game-system/:gameSystemId
 * @desc    Get models by game system
 * @access  Public
 */
router.get(
  '/game-system/:gameSystemId',
  [
    param('gameSystemId')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Game system ID is required'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const gameSystemId = req.params.gameSystemId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const models = await libraryModelService.getModelsByGameSystem(gameSystemId, limit);

      res.json({
        success: true,
        message: 'Models retrieved successfully',
        data: models,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/library/models/faction/:factionId
 * @desc    Get models by faction
 * @access  Public
 */
router.get(
  '/faction/:factionId',
  [
    param('factionId')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Faction ID is required'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const factionId = req.params.factionId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const models = await libraryModelService.getModelsByFaction(factionId, limit);

      res.json({
        success: true,
        message: 'Models retrieved successfully',
        data: models,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/library/models/:id
 * @desc    Get a single library model by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateModelId,
  handleValidationErrors,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const modelId = req.params.id;
      const model = await libraryModelService.getModelById(modelId);

      res.json({
        success: true,
        message: 'Model retrieved successfully',
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
