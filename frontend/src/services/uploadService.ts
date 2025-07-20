import api from './api';
import type { UploadFile } from '../components/ui/DragDropUpload';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface UploadResponse {
  success: boolean;
  data: {
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
  };
  message: string;
}

export interface ResponsiveUploadResponse {
  success: boolean;
  data: UploadResponse['data'][];
  message: string;
}

export interface UploadLimitsResponse {
  success: boolean;
  data: {
    maxFileSize: string;
    maxFileSizeBytes: number;
    allowedMimeTypes: string[];
    supportedFormats: string[];
    maxDimensions: {
      width: number;
      height: number;
    };
    compressionQuality: number;
  };
}

export interface UploadMetadata {
  type: 'avatar' | 'collection-thumbnail' | 'model-image';
  collectionId?: string;
  modelId?: string;
  description?: string;
  tags?: string[];
}

class UploadService {
  /**
   * Upload a single image file
   */
  async uploadImage(
    file: File,
    metadata: UploadMetadata,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', metadata.type);

    if (metadata.collectionId) {
      formData.append('collectionId', metadata.collectionId);
    }
    if (metadata.modelId) {
      formData.append('modelId', metadata.modelId);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append('tags', metadata.tags.join(','));
    }

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentage);
          }
        },
      });

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message || 'Failed to upload image';
      throw new Error(message);
    }
  }

  /**
   * Upload image with multiple responsive sizes
   */
  async uploadResponsiveImage(
    file: File,
    metadata: UploadMetadata,
    onProgress?: (progress: number) => void
  ): Promise<ResponsiveUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', metadata.type);

    if (metadata.collectionId) {
      formData.append('collectionId', metadata.collectionId);
    }
    if (metadata.modelId) {
      formData.append('modelId', metadata.modelId);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append('tags', metadata.tags.join(','));
    }

    try {
      const response = await api.post('/upload/responsive', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentage);
          }
        },
      });

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        'Failed to upload responsive images';
      throw new Error(message);
    }
  }

  /**
   * Upload multiple files sequentially with progress tracking
   */
  async uploadMultipleFiles(
    files: UploadFile[],
    metadata: UploadMetadata,
    useResponsive: boolean = false,
    onFileProgress?: (fileId: string, progress: number) => void,
    onFileComplete?: (
      fileId: string,
      result: UploadResponse | ResponsiveUploadResponse
    ) => void,
    onFileError?: (fileId: string, error: string) => void
  ): Promise<void> {
    const uploadPromises = files.map(async uploadFile => {
      try {
        // Prepare metadata for this specific file
        const fileMetadata: UploadMetadata = {
          ...metadata,
          description: uploadFile.description || metadata.description,
        };

        // Upload the file
        const result = useResponsive
          ? await this.uploadResponsiveImage(
              uploadFile.file,
              fileMetadata,
              progress => onFileProgress?.(uploadFile.id, progress)
            )
          : await this.uploadImage(uploadFile.file, fileMetadata, progress =>
              onFileProgress?.(uploadFile.id, progress)
            );

        onFileComplete?.(uploadFile.id, result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        onFileError?.(uploadFile.id, errorMessage);
      }
    });

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);
  }

  /**
   * Delete an uploaded file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const encodedPath = encodeURIComponent(filePath);
      await api.delete(`/upload/${encodedPath}`);
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message || 'Failed to delete file';
      throw new Error(message);
    }
  }

  /**
   * Get upload configuration and limits
   */
  async getUploadLimits(): Promise<UploadLimitsResponse> {
    try {
      const response = await api.get('/upload/limits');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message || 'Failed to get upload limits';
      throw new Error(message);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    maxFileSize: number = 10 * 1024 * 1024, // 10MB default
    allowedTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]
  ): { isValid: boolean; error?: string } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Accepted types: ${allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty',
      };
    }

    return { isValid: true };
  }

  /**
   * Generate a preview URL for a file
   */
  generatePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke a preview URL to free up memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Prepare tags from a string
   */
  prepareTags(tagsString?: string): string[] {
    if (!tagsString?.trim()) return [];

    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 20); // Limit to 20 tags
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file type is an image
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }
}

// Export singleton instance
const uploadService = new UploadService();
export default uploadService;
