/**
 * Upload Service
 * Coordinates file uploads, image processing, and Firebase storage
 */

import multer from 'multer';

import { config } from '../config/config';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types/auth';

import { firebaseService } from './firebase.service';
import { imageProcessingService } from './image-processing.service';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  filePath: string;
}

export interface FileUploadMetadata {
  userId: string;
  type: 'avatar' | 'collection-thumbnail' | 'model-image';
  collectionId?: string;
  modelId?: string;
  description?: string;
  tags?: string[];
}

class UploadService {
  private multerUpload: multer.Multer;

  constructor() {
    this.multerUpload = this.setupMulter();
  }

  /**
   * Setup Multer for file uploads
   */
  private setupMulter(): multer.Multer {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: config.upload.maxFileSize,
        files: 1, // Single file upload
      },
      fileFilter: (req, file, cb) => {
        // Check MIME type
        if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
          return cb(new AppError(
            `Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`,
            400
          ));
        }
        cb(null, true);
      },
    });
  }

  /**
   * Get multer middleware for single file upload
   */
  getSingleUploadMiddleware() {
    return this.multerUpload.single('image');
  }

  /**
   * Process and upload image file
   */
  async uploadImage(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    metadata: FileUploadMetadata
  ): Promise<UploadResult> {
    try {
      // Validate the image
      const validation = await imageProcessingService.validateImage(file.buffer);
      if (!validation.isValid) {
        throw new AppError(validation.error || 'Invalid image file', 400);
      }

      // Determine optimal format
      const optimalFormat = await imageProcessingService.getOptimalFormat(file.buffer);
      
      // Process the image
      const processed = await imageProcessingService.processImage(file.buffer, {
        format: optimalFormat,
      });

      // Generate filename
      const filename = imageProcessingService.generateFilename(
        file.originalname,
        optimalFormat
      );

      // Generate Firebase storage path
      const filePath = firebaseService.generateFilePath(metadata.type, {
        userId: metadata.userId,
        collectionId: metadata.collectionId,
        modelId: metadata.modelId,
        filename,
      });

      // Upload to Firebase Storage
      const url = await firebaseService.uploadFile(
        processed.buffer,
        filePath,
        `image/${optimalFormat}`,
        {
          userId: metadata.userId,
          type: metadata.type,
          originalName: file.originalname,
          description: metadata.description || '',
          tags: metadata.tags?.join(',') || '',
        }
      );

      return {
        url,
        filename,
        originalName: file.originalname,
        size: processed.info.size,
        mimeType: `image/${optimalFormat}`,
        dimensions: {
          width: processed.info.width,
          height: processed.info.height,
        },
        filePath,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Upload error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        code: (error as any)?.code,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      throw new AppError('Failed to upload image', 500);
    }
  }

  /**
   * Upload multiple responsive sizes
   */
  async uploadResponsiveImages(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    metadata: FileUploadMetadata,
    sizes: Array<{ width: number; height: number; suffix: string }> = [
      { width: 150, height: 150, suffix: 'thumbnail' },
      { width: 800, height: 600, suffix: 'medium' },
      { width: 1920, height: 1080, suffix: 'large' },
    ]
  ): Promise<UploadResult[]> {
    try {
      // Validate the image
      const validation = await imageProcessingService.validateImage(file.buffer);
      if (!validation.isValid) {
        throw new AppError(validation.error || 'Invalid image file', 400);
      }

      // Create responsive sizes
      const responsiveImages = await imageProcessingService.createResponsiveSizes(
        file.buffer,
        sizes
      );

      const results: UploadResult[] = [];

      // Upload each size
      for (const image of responsiveImages) {
        const filename = imageProcessingService.generateFilename(
          `${file.originalname}_${image.suffix}`,
          'jpeg'
        );

        const filePath = firebaseService.generateFilePath(metadata.type, {
          userId: metadata.userId,
          collectionId: metadata.collectionId,
          modelId: metadata.modelId,
          filename,
        });

        const url = await firebaseService.uploadFile(
          image.buffer,
          filePath,
          'image/jpeg',
          {
            userId: metadata.userId,
            type: metadata.type,
            size: image.suffix,
            originalName: file.originalname,
            description: metadata.description || '',
            tags: metadata.tags?.join(',') || '',
          }
        );

        results.push({
          url,
          filename,
          originalName: `${file.originalname}_${image.suffix}`,
          size: image.info.size,
          mimeType: 'image/jpeg',
          dimensions: {
            width: image.info.width,
            height: image.info.height,
          },
          filePath,
        });
      }

      return results;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Responsive upload error:', error);
      throw new AppError('Failed to upload responsive images', 500);
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await firebaseService.deleteFile(filePath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Delete file error:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Validate upload request
   */
  validateUploadRequest(req: AuthenticatedRequest): FileUploadMetadata {
    const userId = req.user?.id;
    const { type, collectionId, modelId, description, tags } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!type || !['avatar', 'collection-thumbnail', 'model-image'].includes(type)) {
      throw new AppError('Invalid upload type', 400);
    }

    if (type === 'collection-thumbnail' && !collectionId) {
      throw new AppError('Collection ID required for collection thumbnail', 400);
    }

    if (type === 'model-image' && (!collectionId || !modelId)) {
      throw new AppError('Collection ID and Model ID required for model image', 400);
    }

    return {
      userId,
      type,
      collectionId,
      modelId,
      description,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : undefined,
    };
  }

  /**
   * Handle file upload errors
   */
  handleUploadError(error: unknown): AppError {
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return new AppError(
            `File too large. Maximum size: ${config.upload.maxFileSize / 1024 / 1024}MB`,
            400
          );
        case 'LIMIT_UNEXPECTED_FILE':
          return new AppError('Unexpected file field', 400);
        default:
          return new AppError('Upload error', 400);
      }
    }

    if (error instanceof AppError) {
      return error;
    }

    return new AppError('Unknown upload error', 500);
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export { UploadService };
