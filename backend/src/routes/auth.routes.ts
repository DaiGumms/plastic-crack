import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { authenticateToken } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, LoginRequest, AuthenticatedRequest } from '../types/auth';

const router = Router();

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', registerValidation, async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { username, email, password, displayName } = req.body;

    // Register user
    const result = await AuthService.register(username, email, password, displayName);

    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    
    if (errorMessage.includes('already')) {
      res.status(409).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Login user
    const result = await AuthService.login(email, password);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    if (errorMessage === 'Invalid credentials') {
      res.status(401).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
        profilePictureUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const newToken = await AuthService.refreshToken(req.user.id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // In a JWT setup, logout is handled client-side by removing the token
  // For server-side token blacklisting, you'd implement a token blacklist here
  res.json({ message: 'Logout successful' });
});

export default router;
