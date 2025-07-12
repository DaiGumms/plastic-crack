import { Response, NextFunction } from 'express';

import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/auth';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Get user from database
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Add user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
    };

    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
        };
      }
    }

    next();
  } catch {
    // Continue without authentication for optional auth
    next();
  }
};
