import { Router, Request, Response, NextFunction } from 'express';

import { checkRedisHealth, isRedisConnected } from '../../lib/redis';
import { cache } from '../../middleware/cache';

const router = Router();

// Cache middleware factory function
const cacheMiddleware = (ttl: number) => {
  try {
    if (isRedisConnected()) {
      return cache(ttl);
    }
  } catch {
    // Cache middleware not available, use no-op middleware
  }
  // Return no-op middleware if Redis not available
  return (req: Request, res: Response, next: NextFunction) => next();
};

// Detailed health check endpoint with caching
router.get('/', cacheMiddleware(30), async (req: Request, res: Response) => {
  const redisHealth = await checkRedisHealth();

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'plastic-crack-backend',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dependencies: {
      database: 'not-configured', // Will be updated when database is connected
      redis: redisHealth,
    },
  };

  res.json({
    success: true,
    data: healthData,
  });
});

// Simple health check for load balancers (no caching)
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    redis: isRedisConnected() ? 'connected' : 'disconnected',
  });
});

export { router as healthRoutes };
