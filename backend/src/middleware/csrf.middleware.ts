import crypto from 'crypto';

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

interface CSRFOptions {
  cookieName?: string;
  headerName?: string;
  ignoreMethods?: string[];
}

/**
 * Simple CSRF protection middleware using double submit cookies
 * This is a modern alternative to the deprecated csurf package
 */
export function createCSRFMiddleware(options: CSRFOptions = {}) {
  const {
    cookieName = 'csrf-token',
    headerName = 'x-csrf-token',
    ignoreMethods = ['GET', 'HEAD', 'OPTIONS'],
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate CSRF token function
    req.csrfToken = () => {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(cookieName, token, {
        httpOnly: false, // Must be accessible to JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      return token;
    };

    // Skip validation for safe methods
    if (ignoreMethods.includes(req.method)) {
      return next();
    }

    // For API endpoints using JWT, CSRF protection is less critical
    // since requests come from different origins (mobile apps, etc.)
    // But we'll implement it for web-based requests
    const cookieToken = req.cookies[cookieName];
    const headerToken = req.headers[headerName] as string;

    // If no tokens are present, allow the request (might be API client)
    if (!cookieToken && !headerToken) {
      return next();
    }

    // If tokens are present, they must match
    if (cookieToken && headerToken && cookieToken === headerToken) {
      return next();
    }

    // CSRF token mismatch
    res.status(403).json({
      error: 'CSRF token mismatch',
      message: 'Invalid or missing CSRF token',
    });
  };
}

/**
 * Endpoint to get CSRF token
 */
export function getCSRFToken(req: Request, res: Response) {
  if (!req.csrfToken) {
    return res.status(500).json({
      error: 'CSRF middleware not initialized',
    });
  }

  const token = req.csrfToken();
  res.json({ csrfToken: token });
}
