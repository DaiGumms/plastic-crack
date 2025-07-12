import { Router } from 'express';

import authRoutes from '../auth.routes';
import { healthRoutes } from './health';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

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
      // Future endpoints will be listed here
    },
  });
});

export { router as v1Routes };
