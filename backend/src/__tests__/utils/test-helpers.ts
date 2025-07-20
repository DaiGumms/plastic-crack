/**
 * Test utilities for file upload tests
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Create a test image buffer
 */
export async function createTestImage(
  width = 100,
  height = 100,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<Buffer> {
  return await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 0, b: 0 }, // Red background
    },
  })
    .toFormat(format)
    .toBuffer();
}

/**
 * Create a corrupt image buffer
 */
export function createCorruptImage(): Buffer {
  return Buffer.from('This is not an image file');
}

/**
 * Create a large test image
 */
export async function createLargeTestImage(): Promise<Buffer> {
  return await createTestImage(5000, 5000); // 5000x5000 pixels
}

/**
 * Mock file object for testing
 */
export function createMockFile(
  buffer: Buffer,
  filename = 'test.jpg',
  mimetype = 'image/jpeg'
): { buffer: Buffer; originalname: string; mimetype: string; size: number } {
  return {
    buffer,
    originalname: filename,
    mimetype,
    size: buffer.length,
  };
}

/**
 * Mock Express request object
 */
export function createMockRequest(
  user: { id: string },
  body: Record<string, any> = {},
  file?: any
): any {
  return {
    user,
    body,
    file,
  };
}

/**
 * Save test image to disk for manual inspection (development only)
 */
export async function saveTestImage(
  buffer: Buffer,
  filename: string
): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const testDir = path.join(__dirname, '../test-images');
    await fs.promises.mkdir(testDir, { recursive: true });
    await fs.promises.writeFile(path.join(testDir, filename), buffer);
  }
}
