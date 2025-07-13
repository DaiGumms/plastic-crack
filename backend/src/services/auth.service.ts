import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../generated/prisma';
import { prisma } from '../lib/database';
import { JWTPayload, AuthResponse } from '../types/auth';

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '7d';
  private static readonly SALT_ROUNDS = 12;

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(payload: JWTPayload): string {
    // Add a unique identifier to ensure different tokens
    const tokenPayload = {
      ...payload,
      jti: crypto.randomBytes(16).toString('hex'), // JWT ID for uniqueness
    };

    return jwt.sign(tokenPayload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;

      // Additional validation can be added here
      // e.g., check if token is blacklisted, check user status, etc.

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  // Register new user
  static async register(
    username: string,
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    try {
      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          displayName: displayName || username,
        },
      });

      // Generate token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          profilePictureUrl: user.profileImageUrl,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      // In production, you would use proper logging (e.g., winston, pino)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('User registration error:', error);
      }
      throw new Error('Failed to register user');
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user account is active
      if (!user.isActive) {
        throw new Error('Account has been deactivated');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(
        password,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login timestamp
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch (updateError) {
        // Log the error but don't fail the login if update fails
        if (process.env.NODE_ENV !== 'test') {
          // eslint-disable-next-line no-console
          console.warn('Failed to update last login timestamp:', updateError);
        }
      }

      // Generate token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          profilePictureUrl: user.profileImageUrl,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      // Re-throw known errors, wrap unknown errors
      if (
        error instanceof Error &&
        (error.message === 'Invalid credentials' ||
          error.message === 'Account has been deactivated')
      ) {
        throw error;
      }

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('User login error:', error);
      }
      throw new Error('Login failed');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // Refresh token
  static async refreshToken(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  }

  // Generate email verification token
  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verify email address
  static async verifyEmail(_token: string): Promise<boolean> {
    // This would typically verify against a token stored in the database
    // For now, this is a placeholder for future implementation
    void _token; // Parameter will be used in future implementation

    const user = await prisma.user.findFirst({
      where: {
        // In a real implementation, you'd store the verification token
        // For now, this is just structure for future development
        emailVerified: false,
      },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return true;
  }

  // Generate password reset token
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        'Password must contain at least one special character (@$!%*?&)'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
