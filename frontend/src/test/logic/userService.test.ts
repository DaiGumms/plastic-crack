import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  userService,
  type ProfileUpdateData,
} from '../../services/userService';

// Create mock functions using vi.hoisted
const { mockPut, mockPost, mockGet, mockDelete } = vi.hoisted(() => ({
  mockPut: vi.fn(),
  mockPost: vi.fn(),
  mockGet: vi.fn(),
  mockDelete: vi.fn(),
}));

// Mock the entire API module
vi.mock('../../services/api', () => ({
  default: {
    put: mockPut,
    post: mockPost,
    get: mockGet,
    delete: mockDelete,
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const profileData: ProfileUpdateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        bio: 'Software developer',
      };

      const mockResponse = {
        data: {
          id: '1',
          ...profileData,
          avatarUrl: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(profileData);

      expect(mockPut).toHaveBeenCalledWith('/users/profile', profileData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error with message', async () => {
      const profileData: ProfileUpdateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        bio: '',
      };

      const mockError = {
        response: {
          data: {
            message: 'Invalid email format',
          },
        },
      };

      mockPut.mockRejectedValue(mockError);

      await expect(userService.updateProfile(profileData)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should handle generic API error', async () => {
      const profileData: ProfileUpdateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: '',
      };

      mockPut.mockRejectedValue(new Error('Network error'));

      await expect(userService.updateProfile(profileData)).rejects.toThrow(
        'Failed to update profile'
      );
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: {
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await userService.uploadAvatar(mockFile);

      expect(mockPost).toHaveBeenCalledWith(
        '/users/avatar',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle avatar upload error', async () => {
      const mockFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      const mockError = {
        response: {
          data: {
            message: 'File too large',
          },
        },
      };

      mockPost.mockRejectedValue(mockError);

      await expect(userService.uploadAvatar(mockFile)).rejects.toThrow(
        'File too large'
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockResponse = {
        data: {
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software developer',
          avatarUrl: null,
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await userService.getProfile();

      expect(mockGet).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get profile error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      };

      mockGet.mockRejectedValue(mockError);

      await expect(userService.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockDelete.mockResolvedValue({});

      await userService.deleteAccount();

      expect(mockDelete).toHaveBeenCalledWith('/users/profile');
    });

    it('should handle delete account error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Cannot delete account with active subscriptions',
          },
        },
      };

      mockDelete.mockRejectedValue(mockError);

      await expect(userService.deleteAccount()).rejects.toThrow(
        'Cannot delete account with active subscriptions'
      );
    });
  });
});
