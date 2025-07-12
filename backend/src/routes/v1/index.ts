import { Router } from 'express';
import { healthRoutes } from './health';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// Placeholder for future routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Plastic Crack API v1',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      // Future endpoints will be listed here
    },
  });
});

export { router as v1Routes };
