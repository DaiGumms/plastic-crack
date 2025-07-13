// User types
export interface User {
  id: string;
  email: string;
  username: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Model/Collection types
export interface UserModel {
  id: string;
  userId: string;
  name: string;
  faction?: string;
  gameSystem?: string;
  pointsValue?: number;
  paintingStatus: 'unpainted' | 'in_progress' | 'completed';
  notes?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModelData {
  name: string;
  faction?: string;
  gameSystem?: string;
  pointsValue?: number;
  paintingStatus?: 'unpainted' | 'in_progress' | 'completed';
  notes?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
