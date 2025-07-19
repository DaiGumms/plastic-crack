/**
 * Image Processing Service
 * Handles image optimization, resizing, and format conversion using Sharp
 */

import sharp from 'sharp';

import { config } from '../config/config';

export interface ImageProcessingOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
  buffer: Buffer;
  info: {
    format: string;
    width: number;
    height: number;
    size: number;
  };
}

class ImageProcessingService {
  /**
   * Process and optimize an image
   */
  async processImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    const {
      quality = config.upload.imageCompression.quality,
      maxWidth = config.upload.imageCompression.maxWidth,
      maxHeight = config.upload.imageCompression.maxHeight,
      format = 'jpeg',
    } = options;

    try {
      let pipeline = sharp(inputBuffer);

      // Get original metadata
      const metadata = await pipeline.metadata();

      // Resize if needed
      if (metadata.width && metadata.height) {
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          pipeline = pipeline.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
      }

      // Convert format and compress
      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, progressive: true });
          break;
        case 'png':
          pipeline = pipeline.png({
            quality,
            compressionLevel: 9,
            progressive: true,
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        default:
          pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      // Process the image
      const { data, info } = await pipeline.toBuffer({
        resolveWithObject: true,
      });

      return {
        buffer: data,
        info: {
          format: info.format,
          width: info.width,
          height: info.height,
          size: info.size,
        },
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Image processing error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        code: (error as { code?: string })?.code,
        name: error instanceof Error ? error.name : 'Unknown',
      });
      throw new Error('Failed to process image');
    }
  }

  /**
   * Create multiple sizes for responsive images
   */
  async createResponsiveSizes(
    inputBuffer: Buffer,
    sizes: Array<{ width: number; height: number; suffix: string }>
  ): Promise<
    Array<{ buffer: Buffer; suffix: string; info: ProcessedImage['info'] }>
  > {
    const results = [];

    for (const size of sizes) {
      try {
        const processed = await this.processImage(inputBuffer, {
          maxWidth: size.width,
          maxHeight: size.height,
        });

        results.push({
          buffer: processed.buffer,
          suffix: size.suffix,
          info: processed.info,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to create ${size.suffix} size:`, error);
        // Continue with other sizes even if one fails
      }
    }

    return results;
  }

  /**
   * Validate image file
   */
  async validateImage(buffer: Buffer): Promise<{
    isValid: boolean;
    metadata?: sharp.Metadata;
    error?: string;
  }> {
    try {
      const metadata = await sharp(buffer).metadata();

      // Check if it's a valid image format
      if (!metadata.format) {
        return {
          isValid: false,
          error: 'Invalid image format',
        };
      }

      // Check supported formats
      const supportedFormats = ['jpeg', 'png', 'webp', 'gif'];
      if (!supportedFormats.includes(metadata.format)) {
        return {
          isValid: false,
          error: `Unsupported format: ${metadata.format}`,
        };
      }

      // Check dimensions
      if (!metadata.width || !metadata.height) {
        return {
          isValid: false,
          error: 'Invalid image dimensions',
        };
      }

      // Check for reasonable size limits (prevent extremely large images)
      const maxDimension = 10000; // 10k pixels
      if (metadata.width > maxDimension || metadata.height > maxDimension) {
        return {
          isValid: false,
          error: 'Image dimensions too large',
        };
      }

      return {
        isValid: true,
        metadata,
      };
    } catch {
      return {
        isValid: false,
        error: 'Failed to parse image',
      };
    }
  }

  /**
   * Extract image metadata
   */
  async getImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return await sharp(buffer).metadata();
  }

  /**
   * Generate filename with timestamp and format
   */
  generateFilename(originalName: string, format: string = 'jpeg'): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const baseName = originalName
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();

    return `${baseName}_${timestamp}_${randomSuffix}.${format}`;
  }

  /**
   * Get optimal format based on image content
   */
  async getOptimalFormat(buffer: Buffer): Promise<'jpeg' | 'png' | 'webp'> {
    try {
      const metadata = await sharp(buffer).metadata();

      // If image has transparency, prefer PNG or WebP
      if (metadata.hasAlpha) {
        return 'webp'; // WebP handles transparency better than PNG for photos
      }

      // For photos without transparency, JPEG is usually smaller
      return 'jpeg';
    } catch {
      // Default to JPEG if we can't determine
      return 'jpeg';
    }
  }
}

// Export singleton instance
export const imageProcessingService = new ImageProcessingService();
export { ImageProcessingService };
