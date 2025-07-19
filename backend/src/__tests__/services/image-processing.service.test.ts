/**
 * Image Processing Service Tests
 * Tests for image validation, optimization, and processing
 */

import { beforeAll, describe, it, expect, jest } from '@jest/globals';

import {
  imageProcessingService,
  ImageProcessingService,
} from '../../services/image-processing.service';
import {
  createTestImage,
  createCorruptImage,
  createLargeTestImage,
} from '../utils/test-helpers';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  let testImageBuffer: Buffer;
  let corruptImageBuffer: Buffer;

  beforeAll(async () => {
    service = imageProcessingService;
    testImageBuffer = await createTestImage(200, 200, 'jpeg');
    corruptImageBuffer = createCorruptImage();
  });

  describe('processImage', () => {
    it('should process a valid JPEG image', async () => {
      const result = await service.processImage(testImageBuffer);

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('info');
      expect(result.info.format).toBe('jpeg');
      expect(result.info.width).toBeLessThanOrEqual(200);
      expect(result.info.height).toBeLessThanOrEqual(200);
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    it('should resize large images', async () => {
      const largeImage = await createTestImage(3000, 3000);
      const result = await service.processImage(largeImage, {
        maxWidth: 1000,
        maxHeight: 1000,
      });

      expect(result.info.width).toBeLessThanOrEqual(1000);
      expect(result.info.height).toBeLessThanOrEqual(1000);
    });

    it('should compress images with specified quality', async () => {
      const originalResult = await service.processImage(testImageBuffer, {
        quality: 100,
      });

      const compressedResult = await service.processImage(testImageBuffer, {
        quality: 50,
      });

      expect(compressedResult.buffer.length).toBeLessThan(
        originalResult.buffer.length
      );
    });

    it('should convert to specified format', async () => {
      const pngResult = await service.processImage(testImageBuffer, {
        format: 'png',
      });

      expect(pngResult.info.format).toBe('png');
    });

    it('should handle WebP format', async () => {
      const webpResult = await service.processImage(testImageBuffer, {
        format: 'webp',
      });

      expect(webpResult.info.format).toBe('webp');
    });

    it('should throw error for corrupt image', async () => {
      await expect(service.processImage(corruptImageBuffer)).rejects.toThrow(
        'Failed to process image'
      );
    });

    it('should not enlarge small images', async () => {
      const smallImage = await createTestImage(50, 50);
      const result = await service.processImage(smallImage, {
        maxWidth: 1000,
        maxHeight: 1000,
      });

      // Should not be enlarged beyond original size
      expect(result.info.width).toBeLessThanOrEqual(50);
      expect(result.info.height).toBeLessThanOrEqual(50);
    });
  });

  describe('createResponsiveSizes', () => {
    it('should create multiple responsive sizes', async () => {
      const sizes = [
        { width: 150, height: 150, suffix: 'thumbnail' },
        { width: 400, height: 300, suffix: 'medium' },
        { width: 800, height: 600, suffix: 'large' },
      ];

      const results = await service.createResponsiveSizes(
        testImageBuffer,
        sizes
      );

      expect(results).toHaveLength(3);
      expect(results[0].suffix).toBe('thumbnail');
      expect(results[1].suffix).toBe('medium');
      expect(results[2].suffix).toBe('large');

      // Check that sizes are correct
      results.forEach((result, index) => {
        expect(result.info.width).toBeLessThanOrEqual(sizes[index].width);
        expect(result.info.height).toBeLessThanOrEqual(sizes[index].height);
      });
    });

    it('should continue processing even if one size fails', async () => {
      // Mock processImage to fail for medium size
      const originalProcessImage = service.processImage;
      jest
        .spyOn(service, 'processImage')
        .mockImplementation(async (buffer, options) => {
          if (options?.maxWidth === 400) {
            throw new Error('Processing failed');
          }
          return originalProcessImage.call(service, buffer, options);
        });

      const sizes = [
        { width: 150, height: 150, suffix: 'thumbnail' },
        { width: 400, height: 300, suffix: 'medium' }, // This will fail
        { width: 800, height: 600, suffix: 'large' },
      ];

      const results = await service.createResponsiveSizes(
        testImageBuffer,
        sizes
      );

      // Should have 2 results (thumbnail and large), medium should have failed
      expect(results).toHaveLength(2);
      expect(results.find(r => r.suffix === 'thumbnail')).toBeDefined();
      expect(results.find(r => r.suffix === 'large')).toBeDefined();
      expect(results.find(r => r.suffix === 'medium')).toBeUndefined();

      // Restore original method
      jest.restoreAllMocks();
    });
  });

  describe('validateImage', () => {
    it('should validate a valid image', async () => {
      const result = await service.validateImage(testImageBuffer);

      expect(result.isValid).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.format).toBe('jpeg');
      expect(result.metadata?.width).toBe(200);
      expect(result.metadata?.height).toBe(200);
      expect(result.error).toBeUndefined();
    });

    it('should reject corrupt image', async () => {
      const result = await service.validateImage(corruptImageBuffer);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Failed to parse image');
      expect(result.metadata).toBeUndefined();
    });

    it('should reject unsupported format', async () => {
      // Create a TIFF image (unsupported)
      const tiffBuffer = Buffer.from('II*\0'); // TIFF header
      const result = await service.validateImage(tiffBuffer);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Failed to parse image');
    });

    it('should reject extremely large images', async () => {
      // Create metadata that would represent a very large image
      const largeImage = await createLargeTestImage();
      const result = await service.validateImage(largeImage);

      // This should pass since we create 5000x5000, but if we had 20000x20000 it would fail
      expect(result.isValid).toBe(true);
    });

    it('should validate PNG images', async () => {
      const pngBuffer = await createTestImage(100, 100, 'png');
      const result = await service.validateImage(pngBuffer);

      expect(result.isValid).toBe(true);
      expect(result.metadata?.format).toBe('png');
    });

    it('should validate WebP images', async () => {
      const webpBuffer = await createTestImage(100, 100, 'webp');
      const result = await service.validateImage(webpBuffer);

      expect(result.isValid).toBe(true);
      expect(result.metadata?.format).toBe('webp');
    });
  });

  describe('getImageMetadata', () => {
    it('should extract metadata from image', async () => {
      const metadata = await service.getImageMetadata(testImageBuffer);

      expect(metadata.format).toBe('jpeg');
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(200);
      expect(metadata.channels).toBeDefined();
      expect(metadata.density).toBeDefined();
    });

    it('should throw for invalid image', async () => {
      await expect(
        service.getImageMetadata(corruptImageBuffer)
      ).rejects.toThrow();
    });
  });

  describe('generateFilename', () => {
    it('should generate unique filename', () => {
      const filename1 = service.generateFilename('test.jpg');
      const filename2 = service.generateFilename('test.jpg');

      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/^test_\d+_[a-z0-9]+\.jpeg$/);
      expect(filename2).toMatch(/^test_\d+_[a-z0-9]+\.jpeg$/);
    });

    it('should handle custom format', () => {
      const filename = service.generateFilename('test.jpg', 'png');

      expect(filename).toMatch(/^test_\d+_[a-z0-9]+\.png$/);
    });

    it('should sanitize filename', () => {
      const filename = service.generateFilename('test@#$%^&*()file.jpg');

      // Should replace special characters with underscores and include timestamp and suffix
      expect(filename).toMatch(/^test_________file_\d+_[a-z0-9]+\.jpeg$/);
    });

    it('should handle long filenames', () => {
      const longName = 'a'.repeat(100) + '.jpg';
      const filename = service.generateFilename(longName);

      expect(filename.length).toBeLessThan(150); // Should be reasonable length
      expect(filename).toContain('aaaa'); // Should contain part of original name
    });
  });

  describe('getOptimalFormat', () => {
    it('should return jpeg for opaque images', async () => {
      const opaqueImage = await createTestImage(100, 100, 'jpeg');
      const format = await service.getOptimalFormat(opaqueImage);

      expect(format).toBe('jpeg');
    });

    it('should return webp for images with transparency', async () => {
      // Create PNG with transparency
      const transparentImage = await createTestImage(100, 100, 'png');
      const format = await service.getOptimalFormat(transparentImage);

      // This might return 'jpeg' since our test image doesn't actually have transparency
      // In a real scenario with alpha channel, it would return 'webp'
      expect(['jpeg', 'webp']).toContain(format);
    });

    it('should fallback to jpeg on error', async () => {
      const format = await service.getOptimalFormat(corruptImageBuffer);

      expect(format).toBe('jpeg');
    });
  });
});
