import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../generated/prisma';
import { prisma } from '../lib/database';
import { JWTPayload, AuthResponse } from '../types/auth';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '7d';
  private static readonly SALT_ROUNDS = 12;

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  // Register new user
  static async register(username: string, email: string, password: string, displayName?: string): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        displayName: displayName || username,
      }
    });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
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
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
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
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId }
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
    });
  }
}
