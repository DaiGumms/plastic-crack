import { describe, it, expect } from 'vitest';
import uploadService from '../uploadService';

describe('uploadService', () => {
  describe('validateFile', () => {
    it('should validate file types correctly', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const validResult = uploadService.validateFile(validFile);
      const invalidResult = uploadService.validateFile(invalidFile);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('not supported');
    });

    it('should validate file sizes correctly', () => {
      const smallFile = new File(['x'.repeat(1000)], 'small.jpg', {
        type: 'image/jpeg',
      });
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const smallResult = uploadService.validateFile(smallFile);
      const largeResult = uploadService.validateFile(largeFile);

      expect(smallResult.isValid).toBe(true);
      expect(largeResult.isValid).toBe(false);
      expect(largeResult.error).toContain('exceeds maximum size');
    });

    it('should reject empty files', () => {
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const result = uploadService.validateFile(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
    });
  });

  describe('utility functions', () => {
    it('should format file sizes correctly', () => {
      expect(uploadService.formatFileSize(0)).toBe('0 Bytes');
      expect(uploadService.formatFileSize(1024)).toBe('1 KB');
      expect(uploadService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(uploadService.formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should check if file is an image', () => {
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      expect(uploadService.isImageFile(imageFile)).toBe(true);
      expect(uploadService.isImageFile(textFile)).toBe(false);
    });

    it('should get file extensions correctly', () => {
      expect(uploadService.getFileExtension('test.jpg')).toBe('jpg');
      expect(uploadService.getFileExtension('image.jpeg')).toBe('jpeg');
      expect(uploadService.getFileExtension('file.tar.gz')).toBe('gz');
      expect(uploadService.getFileExtension('noextension')).toBe('');
    });

    it('should prepare tags correctly', () => {
      expect(uploadService.prepareTags('tag1, tag2, tag3')).toEqual([
        'tag1',
        'tag2',
        'tag3',
      ]);
      expect(uploadService.prepareTags(' tag1 ,  tag2  , tag3 ')).toEqual([
        'tag1',
        'tag2',
        'tag3',
      ]);
      expect(uploadService.prepareTags('')).toEqual([]);
      expect(uploadService.prepareTags('   ')).toEqual([]);

      // Test tag limit (20 tags max)
      const manyTags = Array.from({ length: 25 }, (_, i) => `tag${i + 1}`).join(',');
      const result = uploadService.prepareTags(manyTags);
      expect(result).toHaveLength(20);
    });
  });
});
