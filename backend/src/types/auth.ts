import { Request } from 'express';

import { UserRole } from '../generated/prisma';

export { UserRole };

export interface Permission {
  resource: string;
  action: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    profilePictureUrl: string | null;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    role: UserRole;
    permissions: string[];
  };
}

export interface EmailVerificationRequest {
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}
