import fs from 'fs/promises';
import path from 'path';

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';

import { authenticateToken, requireAdmin } from '../../middleware/auth.middleware';
import { rateLimiter } from '../../middleware/rateLimiter';
import { UserService } from '../../services/user.service';
import { AuthenticatedRequest } from '../../types/auth';

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    void req; // Mark as used for linting
    void file; // Mark as used for linting
    const uploadDir = path.join(__dirname, '../../../uploads/profiles');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    void req; // Mark as used for linting
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    void req; // Mark as used for linting
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

// Validation middleware
const validateProfileUpdate = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters')
    .trim(),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('First name must be between 1 and 30 characters')
    .trim(),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Last name must be between 1 and 30 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be 500 characters or less')
    .trim(),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be 100 characters or less')
    .trim(),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
];

const validatePrivacySettings = [
  body('isProfilePublic')
    .optional()
    .isBoolean()
    .withMessage('isProfilePublic must be a boolean'),
  body('allowFollowers')
    .optional()
    .isBoolean()
    .withMessage('allowFollowers must be a boolean'),
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const validateAccountDeletion = [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion'),
];

const validateUsername = [
  param('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
];

// Request validation handler
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Routes

/**
 * @route GET /api/v1/users/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const profile = await UserService.getUserProfile(req.user.id);
    res.json({
      message: 'Profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ message });
  }
});

/**
 * @route GET /api/v1/users/profile/:username
 * @desc Get public user profile by username
 * @access Public
 */
router.get('/profile/:username', 
  validateUsername, 
  handleValidationErrors,
  rateLimiter(100, 15 * 60 * 1000), // 100 requests per 15 minutes
  async (req: express.Request, res: express.Response) => {
    try {
      const profile = await UserService.getPublicUserProfile(req.params.username);
      res.json({
        message: 'Public profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get profile';
      const statusCode = message === 'User not found' || message === 'Profile is private' ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  }
);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update current user's profile
 * @access Private
 */
router.put('/profile', 
  authenticateToken,
  rateLimiter(10, 60 * 1000), // 10 requests per minute
  validateProfileUpdate,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const updatedProfile = await UserService.updateUserProfile(req.user.id, req.body);
      res.json({
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      res.status(400).json({ message });
    }
  }
);

/**
 * @route PUT /api/v1/users/privacy
 * @desc Update privacy settings
 * @access Private
 */
router.put('/privacy',
  authenticateToken,
  rateLimiter(5, 60 * 1000), // 5 requests per minute
  validatePrivacySettings,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const updatedProfile = await UserService.updatePrivacySettings(req.user.id, req.body);
      res.json({
        message: 'Privacy settings updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update privacy settings';
      res.status(400).json({ message });
    }
  }
);

/**
 * @route POST /api/v1/users/profile-image
 * @desc Upload profile image
 * @access Private
 */
router.post('/profile-image',
  authenticateToken,
  rateLimiter(3, 60 * 1000), // 3 uploads per minute
  upload.single('profileImage'),
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // In a production environment, you would upload to a cloud storage service
      // For now, we'll construct a URL based on the local file path
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const profileImageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

      const updatedProfile = await UserService.updateProfileImage(req.user.id, profileImageUrl);
      
      res.json({
        message: 'Profile image updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      // Clean up uploaded file if there was an error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          // Log but don't throw - the main error is more important
          if (process.env.NODE_ENV !== 'test') {
            // eslint-disable-next-line no-console
            console.error('Failed to clean up uploaded file:', unlinkError);
          }
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to update profile image';
      res.status(400).json({ message });
    }
  }
);

/**
 * @route PUT /api/v1/users/password
 * @desc Change user password
 * @access Private
 */
router.put('/password',
  authenticateToken,
  rateLimiter(3, 60 * 1000), // 3 requests per minute
  validatePasswordChange,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      await UserService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      
      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      const statusCode = message === 'Current password is incorrect' ? 400 : 500;
      res.status(statusCode).json({ message });
    }
  }
);

/**
 * @route GET /api/v1/users/statistics
 * @desc Get user statistics
 * @access Private
 */
router.get('/statistics',
  authenticateToken,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const statistics = await UserService.getUserStatistics(req.user.id);
      res.json({
        message: 'User statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user statistics';
      res.status(500).json({ message });
    }
  }
);

/**
 * @route DELETE /api/v1/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account',
  authenticateToken,
  rateLimiter(1, 60 * 1000), // 1 request per minute
  validateAccountDeletion,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      await UserService.deleteUserAccount(req.user.id, req.body.password);
      
      res.json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      const statusCode = message === 'Invalid password' ? 400 : 500;
      res.status(statusCode).json({ message });
    }
  }
);

/**
 * @swagger
 * /api/v1/users/admin/all-statistics:
 *   get:
 *     summary: Get statistics for all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/all-statistics',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      // This would require implementing UserService.getAllUsersStatistics()
      // For now, just return a placeholder response
      res.json({
        message: 'Admin statistics endpoint - implementation pending',
        note: 'This endpoint requires admin role authorization'
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting all users statistics:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export { router as userRoutes };
