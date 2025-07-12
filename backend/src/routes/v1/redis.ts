import { Router, Request, Response } from 'express';

import { createCacheService, isRedisConnected } from '../../lib/redis';
import { cache, invalidateCache } from '../../middleware/cache';

const router = Router();

// Create cache service instance for Redis operations (lazy initialization)
const getCacheService = () => {
  if (!isRedisConnected()) {
    throw new Error('Redis is not connected');
  }
  return createCacheService('test:');
};

// Redis status endpoint
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      connected: isRedisConnected(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Test cache set endpoint
router.post('/test-set', async (req: Request, res: Response) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Key and value are required',
      });
    }

    await getCacheService().set(key, value, ttl);
    
    res.json({
      success: true,
      message: 'Value set in cache',
      data: { key, value, ttl },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test cache get endpoint
router.get('/test-get/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = await getCacheService().get(key);
    
    res.json({
      success: true,
      data: { key, value, found: value !== null },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test cache delete endpoint
router.delete('/test-delete/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    // Invalidate cache if Redis is connected
    if (isRedisConnected()) {
      try {
        await invalidateCache('test:*')(req, res, () => {});
      } catch {
        // Cache invalidation failed, continue with deletion
      }
    }
    
    const deleted = await getCacheService().del(key);
    
    res.json({
      success: true,
      data: { key, deleted: deleted > 0 },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test cached endpoint with 60 second cache
router.get('/test-cached', (req: Request, res: Response) => {
  // Apply caching middleware only if Redis is connected
  if (isRedisConnected()) {
    try {
      return cache(60)(req, res, () => {
        res.json({
          success: true,
          message: 'This response is cached for 60 seconds',
          data: {
            timestamp: new Date().toISOString(),
            random: Math.random(),
            query: req.query,
          },
        });
      });
    } catch {
      // Cache middleware failed, continue without caching
    }
  }
  
  // Return uncached response
  res.json({
    success: true,
    message: 'This response is not cached (Redis not available)',
    data: {
      timestamp: new Date().toISOString(),
      random: Math.random(),
      query: req.query,
    },
  });
});

// Get cache statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const keys = await getCacheService().getKeys('*');
    
    res.json({
      success: true,
      data: {
        connected: isRedisConnected(),
        totalKeys: keys.length,
        keyPatterns: keys.slice(0, 10), // Show first 10 keys as sample
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as redisRoutes };
