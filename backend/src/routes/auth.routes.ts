import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { authenticateToken } from '../middleware/auth.middleware';
import {
  authRateLimit,
  loginRateLimit,
  passwordResetRateLimit,
} from '../middleware/rateLimiter';
import { AuthService } from '../services/auth.service';
import {
  RegisterRequest,
  LoginRequest,
  AuthenticatedRequest,
  EmailVerificationRequest,
  PasswordResetRequest,
} from '../types/auth';

const router = Router();

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
    ),

  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
];

const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),

  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
router.post(
  '/register',
  authRateLimit,
  registerValidation,
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { username, email, password, displayName } = req.body;

      // Register user
      const result = await AuthService.register(
        username,
        email,
        password,
        displayName
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';

      if (errorMessage.includes('already')) {
        res.status(409).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  loginRateLimit,
  loginValidation,
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { emailOrUsername, password } = req.body;

      // Login user
      const result = await AuthService.login(emailOrUsername, password);

      res.json({
        message: 'Login successful',
        user: result.user,
        token: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';

      if (errorMessage === 'Invalid credentials') {
        res.status(401).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// GET /api/auth/me
router.get(
  '/me',
  authRateLimit,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get full user data
      const user = await AuthService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          location: user.location,
          website: user.website,
          avatarUrl: user.profileImageUrl,
          isEmailVerified: user.emailVerified,
          role: user.role as 'USER' | 'ADMIN',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  authRateLimit,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const newToken = await AuthService.refreshToken(req.user.id);

      res.json({
        message: 'Token refreshed successfully',
        token: newToken,
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    // In a JWT setup, logout is handled client-side by removing the token
    // For server-side token blacklisting, you'd implement a token blacklist here
    res.json({ message: 'Logout successful' });
  }
);

// POST /api/auth/verify-email
router.post(
  '/verify-email',
  authRateLimit,
  async (req: Request<{}, {}, EmailVerificationRequest>, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Verification token is required' });
        return;
      }

      const result = await AuthService.verifyEmail(token);

      if (result) {
        res.json({ message: 'Email verified successfully' });
      } else {
        res
          .status(400)
          .json({ error: 'Invalid or expired verification token' });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Email verification failed';
      res.status(400).json({ error: errorMessage });
    }
  }
);

// POST /api/auth/request-password-reset
router.post(
  '/request-password-reset',
  passwordResetRateLimit,
  async (req: Request<{}, {}, PasswordResetRequest>, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Generate password reset token (placeholder for future implementation)
      const resetToken = AuthService.generatePasswordResetToken();

      // In a real implementation, you would:
      // 1. Store the reset token in the database with expiration
      // 2. Send an email with the reset link
      // For now, we just return success (don't reveal if email exists)

      res.json({
        message:
          'If an account with that email exists, a password reset link has been sent',
        // In development, return the token for testing purposes
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/auth/validate-token
router.get(
  '/validate-token',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    // If we reach here, the token is valid (middleware validated it)
    res.json({
      valid: true,
      user: req.user,
    });
  }
);

export default router;
