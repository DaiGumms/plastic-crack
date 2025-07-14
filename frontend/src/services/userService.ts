import api from './api';
import type { UserProfile, PublicUserProfile, FollowStatus } from '../types';

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

class UserService {
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await api.put('/users/profile', data);
      return response.data.data; // Extract data from the API response wrapper
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to update profile');
    }
  }

  async uploadAvatar(file: File): Promise<UserProfile> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to upload avatar');
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to get profile');
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/users/profile');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to delete account');
    }
  }

  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    try {
      const response = await api.get(`/users/${userId}/public`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to get public profile');
    }
  }

  async getFollowStatus(userId: string): Promise<FollowStatus> {
    try {
      const response = await api.get(`/users/${userId}/follow-status`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to get follow status');
    }
  }

  async followUser(userId: string): Promise<void> {
    try {
      await api.post(`/users/${userId}/follow`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to follow user');
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}/follow`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Failed to unfollow user');
    }
  }
}

export const userService = new UserService();
