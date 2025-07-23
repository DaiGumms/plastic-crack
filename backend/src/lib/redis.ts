import { createClient, RedisClientType } from 'redis';

import { config } from '../config/config';

/**
 * Redis client instance
 */
let redisClient: RedisClientType | null = null;

/**
 * Redis connection status
 */
let isConnected = false;

/**
 * Create and configure Redis client
 */
export const createRedisClient = (): RedisClientType => {
  if (redisClient) {
    return redisClient;
  }

  const redisOptions = {
    url: config.redis.url,
    password: config.redis.password,
    database: config.redis.db,
    socket: {
      connectTimeout: config.redis.connectTimeout,
      reconnectStrategy: (retries: number) => {
        // Exponential backoff with jitter
        const delay = Math.min(retries * 50, 500);
        const jitter = Math.random() * 100;
        return delay + jitter;
      },
    },
  };

  redisClient = createClient(redisOptions);

  // Error handling
  redisClient.on('error', error => {
    // eslint-disable-next-line no-console
    console.error('Redis client error:', error);
    isConnected = false;
  });

  redisClient.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('Redis client connected');
  });

  redisClient.on('ready', () => {
    // eslint-disable-next-line no-console
    console.log('Redis client ready');
    isConnected = true;
  });

  redisClient.on('end', () => {
    // eslint-disable-next-line no-console
    console.log('Redis client disconnected');
    isConnected = false;
  });

  redisClient.on('reconnecting', () => {
    // eslint-disable-next-line no-console
    console.log('Redis client reconnecting...');
    isConnected = false;
  });

  return redisClient;
};

/**
 * Connect to Redis
 */
export const connectRedis = async (): Promise<void> => {
  // Skip Redis connection in production if no REDIS_URL is provided
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    // eslint-disable-next-line no-console
    console.log('⚠️ Skipping Redis connection in production (no REDIS_URL provided)');
    return;
  }

  if (!redisClient) {
    createRedisClient();
  }

  if (redisClient && !redisClient.isOpen) {
    try {
      await redisClient.connect();
      // eslint-disable-next-line no-console
      console.log('Successfully connected to Redis');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to connect to Redis:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      // eslint-disable-next-line no-console
      console.log('Disconnected from Redis');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error disconnecting from Redis:', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => {
  return isConnected && redisClient?.isOpen === true;
};

/**
 * Ping Redis server
 */
export const pingRedis = async (): Promise<string> => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }

  if (!redisClient.isOpen) {
    throw new Error('Redis client not connected');
  }

  return await redisClient.ping();
};

/**
 * Health check for Redis connection
 */
export const checkRedisHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  details?: unknown;
}> => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return {
        status: 'unhealthy',
        message: 'Redis client not connected',
      };
    }

    const pingResult = await pingRedis();

    return {
      status: 'healthy',
      message: `Redis is healthy. Ping: ${pingResult}`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Redis health check failed',
      details: error,
    };
  }
};

/**
 * Cache service using Redis
 */
export class CacheService {
  private client: RedisClientType;
  private keyPrefix: string;

  constructor(client: RedisClientType, keyPrefix = 'cache:') {
    this.client = client;
    this.keyPrefix = keyPrefix;
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const redisKey = this.getKey(key);
    const serializedValue = JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.setEx(redisKey, ttlSeconds, serializedValue);
    } else {
      await this.client.set(redisKey, serializedValue);
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const redisKey = this.getKey(key);
    const value = await this.client.get(redisKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value as string) as T;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing cached value:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async del(key: string): Promise<number> {
    const redisKey = this.getKey(key);
    return await this.client.del(redisKey);
  }

  async exists(key: string): Promise<boolean> {
    const redisKey = this.getKey(key);
    const result = await this.client.exists(redisKey);
    return result === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const redisKey = this.getKey(key);
    await this.client.expire(redisKey, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    const redisKey = this.getKey(key);
    return await this.client.ttl(redisKey);
  }

  async flush(): Promise<void> {
    // Get all keys with our prefix
    const keys = await this.client.keys(`${this.keyPrefix}*`);

    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    // Get all keys matching the pattern with our prefix
    const searchPattern = `${this.keyPrefix}${pattern}`;
    const keys = await this.client.keys(searchPattern);

    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    // Get all keys matching the pattern with our prefix
    const searchPattern = `${this.keyPrefix}${pattern}`;
    return await this.client.keys(searchPattern);
  }
}

/**
 * Create a cache service instance
 */
export const createCacheService = (keyPrefix?: string): CacheService => {
  const client = getRedisClient();

  if (!client) {
    throw new Error('Redis client not initialized');
  }

  return new CacheService(client, keyPrefix);
};
