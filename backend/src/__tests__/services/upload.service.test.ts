import { UploadService, FileUploadMetadata } from '../../services/upload.service';
import { AppError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../types/auth';

// Mock dependencies
jest.mock('../../services/firebase.service', () => ({
  firebaseService: {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    generateFilePath: jest.fn(),
  },
}));

jest.mock('../../services/image-processing.service', () => ({
  imageProcessingService: {
    validateImage: jest.fn(),
    processImage: jest.fn(),
    createResponsiveSizes: jest.fn(),
    generateFilename: jest.fn(),
    getOptimalFormat: jest.fn(),
  },
}));

import { firebaseService } from '../../services/firebase.service';
import { imageProcessingService } from '../../services/image-processing.service';

const mockFirebaseService = firebaseService as jest.Mocked<typeof firebaseService>;
const mockImageProcessingService = imageProcessingService as jest.Mocked<typeof imageProcessingService>;

describe('UploadService', () => {
  let uploadService: UploadService;

  beforeEach(() => {
    jest.clearAllMocks();
    uploadService = new UploadService();
  });

  describe('uploadImage', () => {
    const mockFile = {
      buffer: Buffer.from('test image data'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    };

    const mockMetadata: FileUploadMetadata = {
      userId: 'user123',
      type: 'avatar',
    };

    beforeEach(() => {
      // Setup default mocks
      mockImageProcessingService.validateImage.mockResolvedValue({ isValid: true });
      mockImageProcessingService.getOptimalFormat.mockResolvedValue('jpeg');
      mockImageProcessingService.processImage.mockResolvedValue({
        buffer: Buffer.from('processed image'),
        info: {
          format: 'jpeg',
          width: 800,
          height: 600,
          size: 1200,
        },
      });
      mockImageProcessingService.generateFilename.mockReturnValue('generated-filename.jpg');
      mockFirebaseService.generateFilePath.mockReturnValue('users/user123/avatar/generated-filename.jpg');
      mockFirebaseService.uploadFile.mockResolvedValue('https://storage.googleapis.com/bucket/path/to/file.jpg');
    });

    it('should upload image successfully', async () => {
      const result = await uploadService.uploadImage(mockFile, mockMetadata);

      expect(result).toEqual({
        url: 'https://storage.googleapis.com/bucket/path/to/file.jpg',
        filename: 'generated-filename.jpg',
        originalName: 'test.jpg',
        size: 1200,
        mimeType: 'image/jpeg',
        dimensions: {
          width: 800,
          height: 600,
        },
        filePath: 'users/user123/avatar/generated-filename.jpg',
      });

      expect(mockImageProcessingService.validateImage).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockImageProcessingService.getOptimalFormat).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockImageProcessingService.processImage).toHaveBeenCalledWith(mockFile.buffer, {
        format: 'jpeg',
      });
      expect(mockFirebaseService.uploadFile).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      mockImageProcessingService.validateImage.mockResolvedValue({
        isValid: false,
        error: 'Invalid image format',
      });

      await expect(uploadService.uploadImage(mockFile, mockMetadata))
        .rejects.toThrow(AppError);

      expect(mockImageProcessingService.processImage).not.toHaveBeenCalled();
      expect(mockFirebaseService.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle processing errors', async () => {
      mockImageProcessingService.processImage.mockRejectedValue(new Error('Processing failed'));

      await expect(uploadService.uploadImage(mockFile, mockMetadata))
        .rejects.toThrow(AppError);

      expect(mockFirebaseService.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      mockFirebaseService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(uploadService.uploadImage(mockFile, mockMetadata))
        .rejects.toThrow(AppError);
    });

    it('should handle collection thumbnail uploads', async () => {
      const collectionMetadata: FileUploadMetadata = {
        userId: 'user123',
        type: 'collection-thumbnail',
        collectionId: 'collection123',
      };

      await uploadService.uploadImage(mockFile, collectionMetadata);

      expect(mockFirebaseService.generateFilePath).toHaveBeenCalledWith('collection-thumbnail', {
        userId: 'user123',
        collectionId: 'collection123',
        modelId: undefined,
        filename: 'generated-filename.jpg',
      });
    });

    it('should handle model image uploads', async () => {
      const modelMetadata: FileUploadMetadata = {
        userId: 'user123',
        type: 'model-image',
        collectionId: 'collection123',
        modelId: 'model456',
      };

      await uploadService.uploadImage(mockFile, modelMetadata);

      expect(mockFirebaseService.generateFilePath).toHaveBeenCalledWith('model-image', {
        userId: 'user123',
        collectionId: 'collection123',
        modelId: 'model456',
        filename: 'generated-filename.jpg',
      });
    });
  });

  describe('uploadResponsiveImages', () => {
    const mockFile = {
      buffer: Buffer.from('test image data'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    };

    const mockMetadata: FileUploadMetadata = {
      userId: 'user123',
      type: 'model-image',
      collectionId: 'collection123',
      modelId: 'model456',
    };

    beforeEach(() => {
      mockImageProcessingService.validateImage.mockResolvedValue({ isValid: true });
      mockImageProcessingService.createResponsiveSizes.mockResolvedValue([
        {
          buffer: Buffer.from('small image'),
          suffix: 'thumbnail',
          info: { format: 'jpeg', width: 150, height: 150, size: 500 },
        },
        {
          buffer: Buffer.from('medium image'),
          suffix: 'medium',
          info: { format: 'jpeg', width: 800, height: 600, size: 1200 },
        },
        {
          buffer: Buffer.from('large image'),
          suffix: 'large',
          info: { format: 'jpeg', width: 1920, height: 1080, size: 2400 },
        },
      ]);
      mockImageProcessingService.generateFilename.mockImplementation((name, format) => 
        `${name.replace('.jpg', '')}.${format}`
      );
      mockFirebaseService.generateFilePath.mockImplementation((type, options) => 
        `users/${options.userId}/path/${options.filename}`
      );
      mockFirebaseService.uploadFile.mockResolvedValue('https://storage.googleapis.com/bucket/path/to/file.jpg');
    });

    it('should upload responsive images successfully', async () => {
      const results = await uploadService.uploadResponsiveImages(mockFile, mockMetadata);

      expect(results).toHaveLength(3);
      expect(results[0].originalName).toBe('test.jpg_thumbnail');
      expect(results[1].originalName).toBe('test.jpg_medium');
      expect(results[2].originalName).toBe('test.jpg_large');

      expect(mockImageProcessingService.validateImage).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockImageProcessingService.createResponsiveSizes).toHaveBeenCalledWith(
        mockFile.buffer,
        [
          { width: 150, height: 150, suffix: 'thumbnail' },
          { width: 800, height: 600, suffix: 'medium' },
          { width: 1920, height: 1080, suffix: 'large' },
        ]
      );
      expect(mockFirebaseService.uploadFile).toHaveBeenCalledTimes(3);
    });

    it('should handle validation errors', async () => {
      mockImageProcessingService.validateImage.mockResolvedValue({
        isValid: false,
        error: 'Invalid image format',
      });

      await expect(uploadService.uploadResponsiveImages(mockFile, mockMetadata))
        .rejects.toThrow(AppError);

      expect(mockImageProcessingService.createResponsiveSizes).not.toHaveBeenCalled();
    });

    it('should handle processing errors', async () => {
      mockImageProcessingService.createResponsiveSizes.mockRejectedValue(new Error('Processing failed'));

      await expect(uploadService.uploadResponsiveImages(mockFile, mockMetadata))
        .rejects.toThrow(AppError);
    });

    it('should accept custom sizes', async () => {
      const customSizes = [
        { width: 200, height: 200, suffix: 'custom' },
      ];

      await uploadService.uploadResponsiveImages(mockFile, mockMetadata, customSizes);

      expect(mockImageProcessingService.createResponsiveSizes).toHaveBeenCalledWith(
        mockFile.buffer,
        customSizes
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = 'users/user123/avatar/test-image.jpg';

      await uploadService.deleteFile(filePath);

      expect(mockFirebaseService.deleteFile).toHaveBeenCalledWith(filePath);
    });

    it('should handle delete errors', async () => {
      const filePath = 'users/user123/avatar/test-image.jpg';

      mockFirebaseService.deleteFile.mockRejectedValue(new Error('Delete failed'));

      await expect(uploadService.deleteFile(filePath))
        .rejects.toThrow(AppError);
    });
  });

  describe('validateUploadRequest', () => {
    const createMockRequest = (body: any, userId?: string): AuthenticatedRequest => ({
      user: userId ? { id: userId } : undefined,
      body,
    } as AuthenticatedRequest);

    it('should validate avatar upload request', () => {
      const req = createMockRequest({ type: 'avatar' }, 'user123');
      const result = uploadService.validateUploadRequest(req);
      
      expect(result).toEqual({
        userId: 'user123',
        type: 'avatar',
        collectionId: undefined,
        modelId: undefined,
        description: undefined,
        tags: undefined,
      });
    });

    it('should validate collection thumbnail upload request', () => {
      const req = createMockRequest({
        type: 'collection-thumbnail',
        collectionId: 'collection123',
        description: 'Test collection',
        tags: 'tag1, tag2',
      }, 'user123');
      
      const result = uploadService.validateUploadRequest(req);
      
      expect(result).toEqual({
        userId: 'user123',
        type: 'collection-thumbnail',
        collectionId: 'collection123',
        modelId: undefined,
        description: 'Test collection',
        tags: ['tag1', 'tag2'],
      });
    });

    it('should validate model image upload request', () => {
      const req = createMockRequest({
        type: 'model-image',
        collectionId: 'collection123',
        modelId: 'model456',
      }, 'user123');
      
      const result = uploadService.validateUploadRequest(req);
      
      expect(result).toEqual({
        userId: 'user123',
        type: 'model-image',
        collectionId: 'collection123',
        modelId: 'model456',
        description: undefined,
        tags: undefined,
      });
    });

    it('should throw error for unauthenticated user', () => {
      const req = createMockRequest({ type: 'avatar' });
      
      expect(() => uploadService.validateUploadRequest(req))
        .toThrow(AppError);
    });

    it('should throw error for invalid type', () => {
      const req = createMockRequest({ type: 'invalid' }, 'user123');
      
      expect(() => uploadService.validateUploadRequest(req))
        .toThrow(AppError);
    });

    it('should throw error for collection thumbnail without collectionId', () => {
      const req = createMockRequest({ type: 'collection-thumbnail' }, 'user123');
      
      expect(() => uploadService.validateUploadRequest(req))
        .toThrow(AppError);
    });

    it('should throw error for model image without collectionId', () => {
      const req = createMockRequest({
        type: 'model-image',
        modelId: 'model456',
      }, 'user123');
      
      expect(() => uploadService.validateUploadRequest(req))
        .toThrow(AppError);
    });

    it('should throw error for model image without modelId', () => {
      const req = createMockRequest({
        type: 'model-image',
        collectionId: 'collection123',
      }, 'user123');
      
      expect(() => uploadService.validateUploadRequest(req))
        .toThrow(AppError);
    });
  });

  describe('getSingleUploadMiddleware', () => {
    it('should return multer middleware', () => {
      const middleware = uploadService.getSingleUploadMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('handleUploadError', () => {
    it('should handle MulterError LIMIT_FILE_SIZE', () => {
      // Mock MulterError properly by creating an instance that passes instanceof check
      const multer = require('multer');
      const multerError = new multer.MulterError('LIMIT_FILE_SIZE', 'image');
      
      const result = uploadService.handleUploadError(multerError);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toContain('File too large');
    });

    it('should handle AppError instances', () => {
      const appError = new AppError('Custom error', 400);
      const result = uploadService.handleUploadError(appError);
      expect(result).toBe(appError);
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Unknown error');
      const result = uploadService.handleUploadError(unknownError);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Unknown upload error');
    });
  });
});
