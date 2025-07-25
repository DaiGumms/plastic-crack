import { RedisStore } from 'connect-redis';
import session from 'express-session';

import { config } from '../config/config';

import { getRedisClient } from './redis';

/**
 * Create and configure Redis session store
 */
export const createSessionStore = () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    // Return undefined if Redis is not available
    return undefined;
  }

  // Create Redis store instance - connect-redis v9 syntax
  const store = new RedisStore({
    client: redisClient,
    prefix: `${config.redis.keyPrefix}session:`,
    ttl: Math.floor(config.session.maxAge / 1000), // Convert ms to seconds
  });

  return store;
};

/**
 * Session configuration options
 */
export const sessionConfig: session.SessionOptions = {
  name: config.session.name,
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: config.session.secure,
    httpOnly: config.session.httpOnly,
    maxAge: config.session.maxAge,
    sameSite: config.session.sameSite,
  },
  store: undefined, // Will be set when Redis is connected
};

/**
 * Initialize session middleware
 */
export const initializeSession = () => {
  const store = createSessionStore();

  // If Redis is not available, use memory store (not recommended for production)
  if (!store) {
    // eslint-disable-next-line no-console
    console.warn(
      '⚠️ Redis not available, using memory session store (not recommended for production)'
    );
  }

  sessionConfig.store = store; // Will be undefined if Redis not available

  return session(sessionConfig);
};

/**
 * Session types for TypeScript
 */
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      username?: string;
      role?: string;
    };
    loginAttempts?: number;
    lastLoginAttempt?: Date;
    isAuthenticated?: boolean;
    csrfToken?: string;
  }
}
