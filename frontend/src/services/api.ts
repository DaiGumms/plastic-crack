import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthUser,
  User,
  UserModel,
  CreateModelData,
  PaginatedResponse,
} from '../types';

// Create axios instance
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
console.log('🔧 API Service - Base URL:', baseURL);

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  // Try to get token from localStorage first (for remember me)
  let token = localStorage.getItem('access_token');

  // If not in localStorage, try to get from Zustand store
  if (!token) {
    try {
      const authState = JSON.parse(
        localStorage.getItem('auth-storage') || '{}'
      );
      token = authState?.state?.accessToken;
    } catch {
      // If parsing fails, token remains null
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    if (error.response?.status === 401) {
      // Handle token expiration - clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    const response = await api.post<ApiResponse<AuthUser>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  register: async (data: RegisterData): Promise<AuthUser> => {
    const response = await api.post<ApiResponse<AuthUser>>(
      '/auth/register',
      data
    );
    return response.data.data!;
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
      {
        refreshToken,
      }
    );
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },
};

// Models API
export const modelsApi = {
  getModels: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<UserModel>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<UserModel>>>(
      `/models?page=${page}&limit=${limit}`
    );
    return response.data.data!;
  },

  getModel: async (id: string): Promise<UserModel> => {
    const response = await api.get<ApiResponse<UserModel>>(`/models/${id}`);
    return response.data.data!;
  },

  createModel: async (data: CreateModelData): Promise<UserModel> => {
    const response = await api.post<ApiResponse<UserModel>>('/models', data);
    return response.data.data!;
  },

  updateModel: async (
    id: string,
    data: Partial<CreateModelData>
  ): Promise<UserModel> => {
    const response = await api.put<ApiResponse<UserModel>>(
      `/models/${id}`,
      data
    );
    return response.data.data!;
  },

  deleteModel: async (id: string): Promise<void> => {
    await api.delete(`/models/${id}`);
  },
};

// Health check API
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response =
      await api.get<ApiResponse<{ status: string; timestamp: string }>>(
        '/health'
      );
    return response.data.data!;
  },
};

export default api;
