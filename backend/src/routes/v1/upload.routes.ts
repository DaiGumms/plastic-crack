/**
 * Upload Routes
 * RESTful API endpoints for file uploads and image process        c        const photoData = {
          fileName: result.fileName,
          originalUrl: result.url,
          description: metadata.description,
          isPrimary: false, // First photo could be primary, but let user decide
          fileSize: result.size,
          width: result.dimensions?.width,
          height: result.dimensions?.height,
        };

        await modelService.addUserModelPhotos(metadata.modelId, metadata.userId, [photoData]);ata = {
          fileName: result.fileName,
          originalUrl: result.url,
          description: metadata.description,
          isPrimary: false, // First photo could be primary, but let user decide
          fileSize: result.size,
          width: result.dimensions?.width,
          height: result.dimensions?.height,
        };

        await modelService.addUserModelPhotos(metadata.modelId, metadata.userId, [photoData]);lements Issue #25 acceptance criteria
 */

import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

import { PrismaClient } from '../../generated/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/errorHandler';
import { ModelService } from '../../services/model.service';
import { uploadService } from '../../services/upload.service';
import { AuthenticatedRequest } from '../../types/auth';

const router = Router();
const prisma = new PrismaClient();
const modelService = new ModelService(prisma);

/**
 * Validation middleware
 */
const handleValidationErrors = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    throw new AppError(firstError.msg, 400);
  }
  next();
};

const validateUpload = [
  body('type')
    .isIn(['avatar', 'collection-thumbnail', 'model-image'])
    .withMessage(
      'Type must be one of: avatar, collection-thumbnail, model-image'
    ),
  body('collectionId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Collection ID cannot be empty'),
  body('modelId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Model ID cannot be empty'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
];

/**
 * POST /api/v1/upload/image
 * Upload a single image file
 */
router.post(
  '/image',
  authenticateToken,
  uploadService.getSingleUploadMiddleware(),
  validateUpload,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      // Validate upload request and extract metadata
      const metadata = uploadService.validateUploadRequest(req);

      // Upload the image
      const result = await uploadService.uploadImage(req.file, metadata);

      // If this is a model image upload, create photo record in database
      if (metadata.type === 'model-image' && metadata.modelId) {
        const photoData = {
          fileName: result.filename,
          originalUrl: result.url,
          description: metadata.description,
          isPrimary: false, // First photo could be primary, but let user decide
          fileSize: result.size,
          width: result.dimensions?.width,
          height: result.dimensions?.height,
        };

        await modelService.addUserModelPhotos(
          metadata.modelId,
          metadata.userId,
          [photoData]
        );
      }

      res.status(201).json({
        success: true,
        data: result,
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      // Handle specific upload errors
      if (error instanceof Error && error.message.includes('multer')) {
        next(uploadService.handleUploadError(error));
      } else {
        next(error);
      }
    }
  }
);

/**
 * POST /api/v1/upload/responsive
 * Upload image with multiple responsive sizes
 */
router.post(
  '/responsive',
  authenticateToken,
  uploadService.getSingleUploadMiddleware(),
  validateUpload,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      // Validate upload request and extract metadata
      const metadata = uploadService.validateUploadRequest(req);

      // Upload responsive images
      const results = await uploadService.uploadResponsiveImages(
        req.file,
        metadata
      );

      // If this is a model image upload, create photo record in database
      if (
        metadata.type === 'model-image' &&
        metadata.modelId &&
        results.length > 0
      ) {
        // Use the largest/original size for the database record
        const originalResult = results[results.length - 1]; // Typically the largest size
        const photoData = {
          fileName: originalResult.filename,
          originalUrl: originalResult.url,
          thumbnailUrl: results.length > 1 ? results[0].url : undefined, // First is usually thumbnail
          description: metadata.description,
          isPrimary: false,
          fileSize: originalResult.size,
          width: originalResult.dimensions?.width,
          height: originalResult.dimensions?.height,
        };

        await modelService.addUserModelPhotos(
          metadata.modelId,
          metadata.userId,
          [photoData]
        );
      }

      res.status(201).json({
        success: true,
        data: results,
        message: 'Responsive images uploaded successfully',
      });
    } catch (error) {
      // Handle specific upload errors
      if (error instanceof Error && error.message.includes('multer')) {
        next(uploadService.handleUploadError(error));
      } else {
        next(error);
      }
    }
  }
);

/**
 * DELETE /api/v1/upload/:filePath
 * Delete an uploaded file
 * Note: filePath should be URL encoded
 */
router.delete(
  '/*',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Extract file path from URL (everything after /upload/)
      const filePath = req.params[0];

      if (!filePath) {
        throw new AppError('File path is required', 400);
      }

      // Decode the file path
      const decodedFilePath = decodeURIComponent(filePath);

      // Verify the file belongs to the authenticated user
      const userId = req.user?.id;
      if (!userId || !decodedFilePath.startsWith(`users/${userId}/`)) {
        throw new AppError(
          'Access denied: Cannot delete files belonging to other users',
          403
        );
      }

      // Delete the file
      await uploadService.deleteFile(decodedFilePath);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/upload/limits
 * Get upload configuration and limits
 */
router.get('/limits', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      maxFileSize: '10MB',
      maxFileSizeBytes: 10485760,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      supportedFormats: ['JPEG', 'PNG', 'WebP', 'GIF'],
      maxDimensions: {
        width: 2048,
        height: 2048,
      },
      compressionQuality: 80,
    },
  });
});

export { router as uploadRoutes };
