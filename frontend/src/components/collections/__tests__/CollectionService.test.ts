import { describe, it, expect, vi } from 'vitest';
import CollectionService from '../../../services/collectionService';
import type { CreateCollectionData, UpdateCollectionData, CollectionFilter } from '../../../types';

// Mock the API
vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CollectionService', () => {
  describe('getCollections', () => {
    it('should call API with correct parameters', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.get).mockResolvedValue(mockResponse);

      const filters: CollectionFilter = {
        search: 'test',
        isPublic: true,
        gameSystem: 'Warhammer 40K',
      };

      await CollectionService.getCollections(1, 10, filters);

      expect(mockApi.default.get).toHaveBeenCalledWith(
        expect.stringContaining('/collections?')
      );
    });
  });

  describe('createCollection', () => {
    it('should call API with collection data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'collection-1',
            name: 'Test Collection',
            description: 'Test description',
            isPublic: true,
            tags: ['test'],
            userId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.post).mockResolvedValue(mockResponse);

      const collectionData: CreateCollectionData = {
        name: 'Test Collection',
        description: 'Test description',
        isPublic: true,
        tags: ['test'],
      };

      const result = await CollectionService.createCollection(collectionData);

      expect(mockApi.default.post).toHaveBeenCalledWith('/collections', collectionData);
      expect(result.name).toBe('Test Collection');
    });

    it('should throw error when API returns failure', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Creation failed',
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.post).mockResolvedValue(mockResponse);

      const collectionData: CreateCollectionData = {
        name: 'Test Collection',
      };

      await expect(CollectionService.createCollection(collectionData)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateCollection', () => {
    it('should call API with update data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'collection-1',
            name: 'Updated Collection',
            isPublic: false,
            userId: 'user-1',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.put).mockResolvedValue(mockResponse);

      const updateData: UpdateCollectionData = {
        name: 'Updated Collection',
        isPublic: false,
      };

      const result = await CollectionService.updateCollection('collection-1', updateData);

      expect(mockApi.default.put).toHaveBeenCalledWith('/collections/collection-1', updateData);
      expect(result.name).toBe('Updated Collection');
    });
  });

  describe('deleteCollection', () => {
    it('should call API delete endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.delete).mockResolvedValue(mockResponse);

      await CollectionService.deleteCollection('collection-1');

      expect(mockApi.default.delete).toHaveBeenCalledWith('/collections/collection-1');
    });

    it('should throw error when deletion fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Deletion failed',
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.delete).mockResolvedValue(mockResponse);

      await expect(CollectionService.deleteCollection('collection-1')).rejects.toThrow('Deletion failed');
    });
  });

  describe('searchCollections', () => {
    it('should call getCollections with search filter', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.get).mockResolvedValue(mockResponse);

      await CollectionService.searchCollections('test query', 1, 10, { isPublic: true });

      expect(mockApi.default.get).toHaveBeenCalledWith(
        expect.stringContaining('search=test+query')
      );
    });
  });

  describe('getCollectionStats', () => {
    it('should call stats endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            totalModels: 10,
            unpainterModels: 3,
            inProgressModels: 4,
            completedModels: 3,
            totalValue: 250.00,
            averageValue: 25.00,
          },
        },
      };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.get).mockResolvedValue(mockResponse);

      const result = await CollectionService.getCollectionStats('collection-1');

      expect(mockApi.default.get).toHaveBeenCalledWith('/collections/collection-1/stats');
      expect(result.totalModels).toBe(10);
    });
  });

  describe('exportCollection', () => {
    it('should call export endpoint with correct format', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' });
      const mockResponse = { data: mockBlob };

      const mockApi = await import('../../../services/api');
      vi.mocked(mockApi.default.get).mockResolvedValue(mockResponse);

      const result = await CollectionService.exportCollection('collection-1', 'json');

      expect(mockApi.default.get).toHaveBeenCalledWith('/collections/collection-1/export', {
        params: { format: 'json' },
        responseType: 'blob',
      });
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
