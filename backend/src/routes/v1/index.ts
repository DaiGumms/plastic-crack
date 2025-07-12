import { Router } from 'express';

import authRoutes from '../auth.routes';
import { healthRoutes } from './health';
import { redisRoutes } from './redis';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// Redis test routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/redis', redisRoutes);
}

// Authentication routes
router.use('/auth', authRoutes);

// Placeholder for future routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Plastic Crack API v1',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      ...(process.env.NODE_ENV === 'development' && { redis: '/api/v1/redis' }),
      // Future endpoints will be listed here
    },
  });
});

export { router as v1Routes };
