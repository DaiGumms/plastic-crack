import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
  CollectionFilter,
  CollectionStats,
  ApiResponse,
  PaginatedResponse,
} from '../types';
import api from './api';

export class CollectionService {
  private static readonly BASE_PATH = '/collections';

  /**
   * Get paginated collections with optional filters
   */
  static async getCollections(
    page = 1,
    limit = 10,
    filters: CollectionFilter = {}
  ): Promise<PaginatedResponse<Collection>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters to params
    if (filters.search) params.append('search', filters.search);
    if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.gameSystem) params.append('gameSystem', filters.gameSystem);
    if (filters.paintingStatus) params.append('paintingStatus', filters.paintingStatus);
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const response = await api.get<PaginatedResponse<Collection>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get current user's collections
   */
  static async getMyCollections(
    page = 1,
    limit = 10,
    filters: Omit<CollectionFilter, 'userId'> = {}
  ): Promise<PaginatedResponse<Collection>> {
    return this.getCollections(page, limit, filters);
  }

  /**
   * Get public collections
   */
  static async getPublicCollections(
    page = 1,
    limit = 10,
    filters: Omit<CollectionFilter, 'isPublic'> = {}
  ): Promise<PaginatedResponse<Collection>> {
    return this.getCollections(page, limit, { ...filters, isPublic: true });
  }

  /**
   * Get a specific collection by ID
   */
  static async getCollection(id: string): Promise<Collection> {
    const response = await api.get<ApiResponse<Collection>>(`${this.BASE_PATH}/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch collection');
    }
    return response.data.data;
  }

  /**
   * Create a new collection
   */
  static async createCollection(data: CreateCollectionData): Promise<Collection> {
    const response = await api.post<ApiResponse<Collection>>(this.BASE_PATH, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create collection');
    }
    return response.data.data;
  }

  /**
   * Update an existing collection
   */
  static async updateCollection(id: string, data: UpdateCollectionData): Promise<Collection> {
    const response = await api.put<ApiResponse<Collection>>(`${this.BASE_PATH}/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update collection');
    }
    return response.data.data;
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete collection');
    }
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(id: string): Promise<CollectionStats> {
    const response = await api.get<ApiResponse<CollectionStats>>(`${this.BASE_PATH}/${id}/stats`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch collection statistics');
    }
    return response.data.data;
  }

  /**
   * Add a model to a collection
   */
  static async addModelToCollection(collectionId: string, modelId: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      `${this.BASE_PATH}/${collectionId}/models`,
      { modelId }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add model to collection');
    }
  }

  /**
   * Remove a model from a collection
   */
  static async removeModelFromCollection(collectionId: string, modelId: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${collectionId}/models/${modelId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove model from collection');
    }
  }

  /**
   * Bulk operations - add multiple models to a collection
   */
  static async addModelsToCollection(collectionId: string, modelIds: string[]): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      `${this.BASE_PATH}/${collectionId}/models/bulk`,
      { modelIds }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add models to collection');
    }
  }

  /**
   * Bulk operations - remove multiple models from a collection
   */
  static async removeModelsFromCollection(collectionId: string, modelIds: string[]): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${collectionId}/models/bulk`,
      { data: { modelIds } }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove models from collection');
    }
  }

  /**
   * Export collection data
   */
  static async exportCollection(id: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await api.get(`${this.BASE_PATH}/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return new Blob([response.data], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
  }

  /**
   * Search collections
   */
  static async searchCollections(
    query: string,
    page = 1,
    limit = 10,
    filters: CollectionFilter = {}
  ): Promise<PaginatedResponse<Collection>> {
    return this.getCollections(page, limit, { ...filters, search: query });
  }

  /**
   * Get available tags for collections
   */
  static async getCollectionTags(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(`${this.BASE_PATH}/tags`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch collection tags');
    }
    return response.data.data;
  }
}

export default CollectionService;
