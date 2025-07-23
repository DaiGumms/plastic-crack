import { Router } from 'express';

import { prisma } from '../../lib/database';
import authRoutes from '../auth.routes';

import { collectionRoutes } from './collection.routes';
import gameSystemRoutes from './gameSystem.routes';
import { healthRoutes } from './health';
import libraryModelRoutes from './libraryModel.routes';
import { modelRoutes } from './model.routes';
import { redisRoutes } from './redis';
import { uploadRoutes } from './upload.routes';
import { userRoutes } from './user.routes';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// Redis test routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/redis', redisRoutes);
}

// Database-dependent routes (only if database is available)
if (prisma) {
  // Authentication routes
  router.use('/auth', authRoutes);

  // User profile routes
  router.use('/users', userRoutes);

  // Collection management routes
  router.use('/collections', collectionRoutes);

  // Game system routes
  router.use('/game-systems', gameSystemRoutes);

  // Library model routes (read-only catalog)
  router.use('/library/models', libraryModelRoutes);

  // Model management routes (user models)
  router.use('/models', modelRoutes);

  // Upload routes (require database for model photos)
  router.use('/upload', uploadRoutes);
} else {
  // Database not available - provide informational message
  router.get('/status', (req, res) => {
    res.json({
      message: 'API running without database connectivity',
      availableEndpoints: ['health', 'ping'],
      timestamp: new Date().toISOString(),
    });
  });
}

// Placeholder for future routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Plastic Crack API v1',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      ...(prisma && {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        collections: '/api/v1/collections',
        gameSystems: '/api/v1/game-systems',
        libraryModels: '/api/v1/library/models',
        models: '/api/v1/models',
        upload: '/api/v1/upload',
      }),
      ...(process.env.NODE_ENV === 'development' && { redis: '/api/v1/redis' }),
    },
    databaseStatus: prisma ? 'connected' : 'not available',
  });
});

export { router as v1Routes };
