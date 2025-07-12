import { Request, Response, NextFunction } from 'express';

import { createCacheService } from '../lib/redis';

/**
 * Cache middleware options
 */
interface CacheOptions {
  /** Cache TTL in seconds */
  ttl: number;
  /** Cache key generator function */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  keyGenerator?: (req: Request) => string;
  /** Condition to determine if request should be cached */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  condition?: (req: Request) => boolean;
  /** Custom cache key prefix */
  prefix?: string;
}

/**
 * Cached response structure
 */
interface CachedResponse {
  data: unknown;
  status?: number;
  headers?: Record<string, string>;
}

/**
 * Default cache key generator based on URL and query parameters
 */
const defaultKeyGenerator = (req: Request): string => {
  const baseKey = req.originalUrl || req.url;
  const queryString = JSON.stringify(req.query);
  const userId = req.session?.userId || 'anonymous';
  
  return `cache:${userId}:${baseKey}:${Buffer.from(queryString).toString('base64')}`;
};

/**
 * Default caching condition - only cache GET requests
 */
const defaultCondition = (req: Request): boolean => {
  return req.method === 'GET';
};

/**
 * Create caching middleware
 */
export const createCacheMiddleware = (options: CacheOptions) => {
  const {
    ttl,
    keyGenerator = defaultKeyGenerator,
    condition = defaultCondition,
    prefix = '',
  } = options;

  // Create cache service instance
  const cacheService = createCacheService('api:');

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if request should be cached
      if (!condition(req)) {
        return next();
      }

      // Generate cache key
      const cacheKey = prefix ? `${prefix}:${keyGenerator(req)}` : keyGenerator(req);

      // Try to get cached response
      const cachedResponse = await cacheService.get<CachedResponse>(cacheKey);
      
      if (cachedResponse) {
        // Add cache hit header
        res.set('X-Cache', 'HIT');
        
        // Set cached headers if they exist
        if (cachedResponse.headers) {
          Object.entries(cachedResponse.headers).forEach(([key, value]) => {
            res.set(key, value as string);
          });
        }

        // Send cached response
        return res.status(cachedResponse.status || 200).json(cachedResponse.data);
      }

      // Store original res.json method
      const originalJson = res.json.bind(res);
      const originalStatus = res.status.bind(res);
      
      let statusCode = 200;

      // Override res.status to capture status code
      res.status = function(code: number) {
        statusCode = code;
        return originalStatus(code);
      };

      // Override res.json to cache the response
      res.json = function(data: unknown) {
        // Only cache successful responses
        if (statusCode >= 200 && statusCode < 300) {
          const responseToCache = {
            status: statusCode,
            data,
            headers: {
              'Content-Type': 'application/json',
            },
            cachedAt: new Date().toISOString(),
          };

          // Cache the response (don't await to avoid blocking)
          cacheService.set(cacheKey, responseToCache, ttl).catch(() => {
            // Silently handle cache errors to avoid disrupting the response
          });

          // Add cache miss header
          res.set('X-Cache', 'MISS');
        }

        return originalJson(data);
      };

      next();
    } catch {
      // Continue without caching if there's an error
      next();
    }
  };
};

/**
 * Simple cache middleware with default options
 */
export const cache = (ttlSeconds: number) => {
  return createCacheMiddleware({ ttl: ttlSeconds });
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (patterns: string | string[]) => {
  const cacheService = createCacheService('api:');

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patternArray = Array.isArray(patterns) ? patterns : [patterns];
      
      // Store original response methods
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);
      
      // Override response methods to invalidate cache after successful operations
      const invalidateCachePatterns = async () => {
        for (const pattern of patternArray) {
          try {
            await cacheService.deletePattern(pattern);
          } catch {
            // Silently handle cache invalidation errors
          }
        }
      };

      res.json = function(data: unknown) {
        const result = originalJson(data);
        
        // Invalidate cache for successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          invalidateCachePatterns();
        }
        
        return result;
      };

      res.send = function(data: unknown) {
        const result = originalSend(data);
        
        // Invalidate cache for successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          invalidateCachePatterns();
        }
        
        return result;
      };

      next();
    } catch {
      next();
    }
  };
};

/**
 * User-specific cache middleware
 */
export const userCache = (ttlSeconds: number) => {
  return createCacheMiddleware({
    ttl: ttlSeconds,
    keyGenerator: (req: Request) => {
      const userId = req.session?.userId || 'anonymous';
      const path = req.originalUrl || req.url;
      return `user-cache:${userId}:${path}`;
    },
    condition: (req: Request) => req.method === 'GET' && !!req.session?.userId,
  });
};

/**
 * API response cache middleware
 */
export const apiCache = (ttlSeconds: number, prefix = 'api') => {
  return createCacheMiddleware({
    ttl: ttlSeconds,
    prefix,
    keyGenerator: (req: Request) => {
      const path = req.originalUrl || req.url;
      const method = req.method;
      return `${method}:${path}`;
    },
  });
};
