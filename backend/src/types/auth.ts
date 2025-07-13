import { Request } from 'express';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
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
  token: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
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
