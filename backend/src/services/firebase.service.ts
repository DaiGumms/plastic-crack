/**
 * Firebase Admin SDK Service
 * Handles Firebase initialization and storage operations
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

import { config } from '../config/config';

class FirebaseService {
  private app: App;
  private initialized = false;

  constructor() {
    this.app = this.initializeFirebase();
  }

  private initializeFirebase(): App {
    if (this.initialized || getApps().length > 0) {
      return getApps()[0];
    }

    if (!config.firebase.serviceAccount.projectId ||
        !config.firebase.serviceAccount.privateKey ||
        !config.firebase.serviceAccount.clientEmail) {
      throw new Error('Firebase service account credentials are not properly configured');
    }

    this.app = initializeApp({
      credential: cert({
        projectId: config.firebase.serviceAccount.projectId,
        privateKey: config.firebase.serviceAccount.privateKey,
        clientEmail: config.firebase.serviceAccount.clientEmail,
      }),
      storageBucket: config.firebase.storageBucket,
    });

    this.initialized = true;
    // eslint-disable-next-line no-console
    console.log('🔥 Firebase Admin SDK initialized');
    return this.app;
  }

  /**
   * Get Firebase Storage bucket
   */
  getStorageBucket() {
    return getStorage(this.app).bucket();
  }

  /**
   * Upload file to Firebase Storage
   */
  async uploadFile(
    buffer: Buffer,
    filePath: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const bucket = this.getStorageBucket();
      const file = bucket.file(filePath);

      const stream = file.createWriteStream({
        metadata: {
          contentType,
          metadata: metadata || {},
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          // eslint-disable-next-line no-console
          console.error('Upload error:', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            // Make the file publicly readable
            await file.makePublic();
            
            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            resolve(publicUrl);
          } catch (error) {
            reject(error);
          }
        });

        stream.end(buffer);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Firebase upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const bucket = this.getStorageBucket();
      const file = bucket.file(filePath);
      
      await file.delete();
      // eslint-disable-next-line no-console
      console.log(`🗑️ Deleted file: ${filePath}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Firebase delete error:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const bucket = this.getStorageBucket();
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Firebase file exists check error:', error);
      return false;
    }
  }

  /**
   * Generate file path for different types
   */
  generateFilePath(type: 'avatar' | 'collection-thumbnail' | 'model-image', options: {
    userId: string;
    collectionId?: string;
    modelId?: string;
    filename: string;
  }): string {
    const { userId, collectionId, modelId, filename } = options;
    
    switch (type) {
      case 'avatar':
        return `users/${userId}/avatar/${filename}`;
      case 'collection-thumbnail':
        if (!collectionId) throw new Error('Collection ID required for collection thumbnail');
        return `users/${userId}/collections/${collectionId}/thumbnail/${filename}`;
      case 'model-image':
        if (!collectionId || !modelId) throw new Error('Collection ID and Model ID required for model image');
        return `users/${userId}/collections/${collectionId}/models/${modelId}/${filename}`;
      default:
        throw new Error(`Unknown file type: ${type}`);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export { FirebaseService };
