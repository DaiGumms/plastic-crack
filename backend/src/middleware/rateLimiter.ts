import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

// Skip rate limiting if explicitly disabled for testing
const skip = () => process.env.SKIP_RATE_LIMITING === 'true';

// Rate limiter for authentication endpoints (more lenient for /me and /refresh)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 5 to 50 for authenticated user endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes',
    });
  },
});

// More lenient rate limiter for authenticated user endpoints like /me and /refresh
export const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow more requests for authenticated users
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes',
    });
  },
});

// Stricter rate limiter for login attempts
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many login attempts, please try again later.',
      retryAfter: '15 minutes',
    });
  },
});

// Rate limiter for password reset (future use)
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many password reset attempts, please try again later.',
      retryAfter: '1 hour',
    });
  },
});

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs for general API
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes',
    });
  },
});

// Generic rate limiter factory function
export const rateLimiter = (max: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: `${Math.ceil(windowMs / 60000)} minutes`,
      });
    },
  });
};
