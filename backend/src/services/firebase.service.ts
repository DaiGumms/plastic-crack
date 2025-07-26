/**
 * Firebase Admin SDK Service
 * Handles Firebase initialization and storage operations
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

import { config } from '../config/config';

class FirebaseService {
  private app: App | null = null;
  private initialized = false;

  constructor() {
    // Don't initialize immediately - use lazy initialization
  }

  private initializeFirebase(): App | null {
    if (this.initialized) {
      return this.app;
    }

    if (getApps().length > 0) {
      this.app = getApps()[0];
      this.initialized = true;
      return this.app;
    }

    // Skip Firebase initialization in test environment (but allow emulator)
    if (
      process.env.NODE_ENV === 'test' &&
      !process.env.FIREBASE_EMULATOR_HOST
    ) {
      // eslint-disable-next-line no-console
      console.log('Skipping Firebase initialization in test environment');
      this.initialized = true;
      return null;
    }

    // Check if running with Firebase emulator
    const useEmulatorEnv = process.env.USE_FIREBASE_EMULATOR === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isEmulator = useEmulatorEnv || isDevelopment;

    // Set up emulator environment variables BEFORE initializing Firebase
    if (isEmulator) {
      const emulatorHost = config.firebase.emulator.host;
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = emulatorHost;
      process.env.GCLOUD_PROJECT = 'demo-project';
    }

    // eslint-disable-next-line no-console
    console.log('🔍 Firebase emulator check:', {
      isEmulator,
      useEmulatorEnv,
      isDevelopment,
      configEnabled: config.firebase.emulator.enabled,
      host: config.firebase.emulator.host,
      useFirebaseEmulator: process.env.USE_FIREBASE_EMULATOR,
      nodeEnv: process.env.NODE_ENV,
      storageEmulatorHost: process.env.FIREBASE_STORAGE_EMULATOR_HOST,
    });

    // Force emulator mode in development or when explicitly enabled
    if (isEmulator) {
      // Initialize with minimal config for emulator
      this.app = initializeApp({
        projectId: 'demo-project', // Use fixed demo project for emulator
        storageBucket: 'demo-project.appspot.com', // Required even for emulator
      });

      // eslint-disable-next-line no-console
      console.log(
        `🔥 Firebase initialized for emulator mode at ${config.firebase.emulator.host}`
      );
      this.initialized = true;
      return this.app;
    }

    // Production environment with Application Default Credentials (Cloud Run)
    if (
      process.env.NODE_ENV === 'production' &&
      !config.firebase.serviceAccount.privateKey
    ) {
      this.app = initializeApp({
        projectId: config.firebase.serviceAccount.projectId,
        storageBucket: config.firebase.storageBucket,
      });

      // eslint-disable-next-line no-console
      console.log(
        '🔥 Firebase initialized with Application Default Credentials (ADC)'
      );
      this.initialized = true;
      return this.app;
    }

    if (
      !config.firebase.serviceAccount.projectId ||
      !config.firebase.serviceAccount.privateKey ||
      !config.firebase.serviceAccount.clientEmail
    ) {
      throw new Error(
        'Firebase service account credentials are not properly configured'
      );
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
    if (!this.app) {
      this.app = this.initializeFirebase();
    }

    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const storage = getStorage(this.app);

    // Check if running with Firebase emulator
    const useEmulatorEnv = process.env.USE_FIREBASE_EMULATOR === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isEmulator = useEmulatorEnv || isDevelopment;

    if (isEmulator) {
      // eslint-disable-next-line no-console
      console.log(
        `🔥 Using Firebase Storage emulator at ${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
      );
      // Explicitly specify bucket name for emulator
      return storage.bucket('demo-project.appspot.com');
    }

    return storage.bucket();
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
        stream.on('error', error => {
          // eslint-disable-next-line no-console
          console.error('Upload error:', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            // Check emulator conditions more explicitly
            const useEmulatorEnv = process.env.USE_FIREBASE_EMULATOR === 'true';
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isEmulatorMode =
              config.firebase.emulator.enabled ||
              useEmulatorEnv ||
              isDevelopment;

            // For emulator, use emulator URL format
            if (isEmulatorMode) {
              const emulatorHost = config.firebase.emulator.host;
              const projectId = 'demo-project'; // Use fixed project ID for emulator
              const publicUrl = `http://${emulatorHost}/v0/b/${projectId}.appspot.com/o/${encodeURIComponent(filePath)}?alt=media`;
              resolve(publicUrl);
            } else {
              // Make the file publicly readable in production
              await file.makePublic();

              // Get the public URL for production
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
              resolve(publicUrl);
            }
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
  generateFilePath(
    type: 'avatar' | 'collection-thumbnail' | 'model-image',
    options: {
      userId: string;
      collectionId?: string;
      modelId?: string;
      filename: string;
    }
  ): string {
    const { userId, collectionId, modelId, filename } = options;

    switch (type) {
      case 'avatar':
        return `users/${userId}/avatar/${filename}`;
      case 'collection-thumbnail':
        if (!collectionId)
          throw new Error('Collection ID required for collection thumbnail');
        return `users/${userId}/collections/${collectionId}/thumbnail/${filename}`;
      case 'model-image':
        if (!collectionId || !modelId)
          throw new Error(
            'Collection ID and Model ID required for model image'
          );
        return `users/${userId}/collections/${collectionId}/models/${modelId}/${filename}`;
      default:
        throw new Error(`Unknown file type: ${type}`);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export { FirebaseService };
