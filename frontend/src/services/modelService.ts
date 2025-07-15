/**
 * Model Service
 * Frontend service for interacting with the Model API
 */

import type {
  Model,
  CreateModelData,
  UpdateModelData,
  ModelFilters,
  ModelPhotoData,
  BulkUpdateData,
  PaginatedResponse,
} from '../types';
import api from './api';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'paintingStatus';
  sortOrder?: 'asc' | 'desc';
}

class ModelService {
  private baseUrl = '/api/v1/models';

  /**
   * Create a new model
   */
  async createModel(data: CreateModelData): Promise<Model> {
    const response = await api.post<{ data: Model }>(this.baseUrl, data);
    return response.data.data;
  }

  /**
   * Get models in a collection
   */
  async getModelsByCollection(
    collectionId: string,
    filters?: ModelFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<Model>> {
    const params = new URLSearchParams();
    
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.paintingStatus) params.append('paintingStatus', filters.paintingStatus);
    if (filters?.gameSystemId) params.append('gameSystemId', filters.gameSystemId);
    if (filters?.factionId) params.append('factionId', filters.factionId);
    if (filters?.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const url = `${this.baseUrl}/collection/${collectionId}?${params.toString()}`;
    const response = await api.get<{ data: PaginatedResponse<Model> }>(url);
    return response.data.data;
  }

  /**
   * Search models across all user's collections
   */
  async searchModels(
    query: string,
    filters?: ModelFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<Model>> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    if (filters?.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters?.paintingStatus) params.append('paintingStatus', filters.paintingStatus);
    if (filters?.collectionId) params.append('collectionId', filters.collectionId);

    const url = `${this.baseUrl}/search?${params.toString()}`;
    const response = await api.get<{ data: PaginatedResponse<Model> }>(url);
    return response.data.data;
  }

  /**
   * Get model by ID
   */
  async getModel(id: string): Promise<Model> {
    const response = await api.get<{ data: Model }>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  /**
   * Update model
   */
  async updateModel(id: string, data: UpdateModelData): Promise<Model> {
    const response = await api.put<{ data: Model }>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete model
   */
  async deleteModel(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Bulk update models
   */
  async bulkUpdateModels(data: BulkUpdateData): Promise<{ updatedCount: number }> {
    const response = await api.put<{ data: { updatedCount: number } }>(
      `${this.baseUrl}/bulk-update`,
      data
    );
    return response.data.data;
  }

  /**
   * Add photos to a model
   */
  async addModelPhotos(modelId: string, photos: ModelPhotoData[]): Promise<Model> {
    const response = await api.post<{ data: Model }>(
      `${this.baseUrl}/${modelId}/photos`,
      { photos }
    );
    return response.data.data;
  }

  /**
   * Upload image file and get URL
   * This is a placeholder - in a real implementation, this would handle file uploads
   */
  async uploadImage(file: File): Promise<string> {
    // TODO: Implement actual file upload
    // For now, return a placeholder URL
    const formData = new FormData();
    formData.append('image', file);
    
    // This would typically go to a separate upload endpoint
    // For now, we'll just return a placeholder
    return Promise.resolve(`/uploads/${file.name}`);
  }
}

export default new ModelService();