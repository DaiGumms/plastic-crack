import type { ApiResponse, PaginatedResponse, UserModel, CreateModelData, LibraryModel } from '../types';
import api from './api';

export interface ModelPhoto {
  id: string;
  fileName: string;
  originalUrl: string;
  thumbnailUrl?: string;
  description?: string;
  isPrimary: boolean;
}

export interface ModelFilters {
  search?: string;
  paintingStatus?: string;
  gameSystemId?: string;
  collectionId?: string;
  tags?: string[];
  isPublic?: boolean;
  userId?: string;
}

export interface ModelListParams extends ModelFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'paintingStatus';
  sortOrder?: 'asc' | 'desc';
}

class ModelService {
  private baseUrl = '/models';

  async getModels(params: ModelListParams = {}): Promise<PaginatedResponse<UserModel>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get<PaginatedResponse<UserModel>>(
      `${this.baseUrl}?${searchParams.toString()}`
    );
    return response.data;
  }

  async getUserModelsByCollection(
    collectionId: string,
    params: ModelListParams = {}
  ): Promise<PaginatedResponse<UserModel>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get<PaginatedResponse<UserModel>>(
      `${this.baseUrl}/collection/${collectionId}?${searchParams.toString()}`
    );
    return response.data;
  }

  async getModelById(id: string): Promise<UserModel> {
    const response = await api.get<ApiResponse<UserModel>>(`${this.baseUrl}/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch model');
    }
    return response.data.data;
  }

  async createModel(data: CreateModelData): Promise<UserModel> {
    const response = await api.post<ApiResponse<UserModel>>(this.baseUrl, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create model');
    }
    return response.data.data;
  }

  async updateModel(id: string, data: Partial<CreateModelData>): Promise<UserModel> {
    const response = await api.put<ApiResponse<UserModel>>(`${this.baseUrl}/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update model');
    }
    return response.data.data;
  }

  async deleteModel(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete model');
    }
  }

  async uploadModelPhoto(modelId: string, file: File, description?: string, isPrimary?: boolean): Promise<ModelPhoto> {
    const formData = new FormData();
    formData.append('photo', file);
    if (description) formData.append('description', description);
    if (isPrimary !== undefined) formData.append('isPrimary', isPrimary.toString());

    const response = await api.post<ApiResponse<ModelPhoto>>(
      `${this.baseUrl}/${modelId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to upload photo');
    }
    return response.data.data;
  }

  async deleteModelPhoto(modelId: string, photoId: string): Promise<void> {
    const response = await api.delete<ApiResponse>(
      `${this.baseUrl}/${modelId}/photos/${photoId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete photo');
    }
  }

  async updateModelPhotoDescription(modelId: string, photoId: string, description: string): Promise<ModelPhoto> {
    const response = await api.put<ApiResponse<ModelPhoto>>(
      `${this.baseUrl}/${modelId}/photos/${photoId}`,
      { description }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update photo description');
    }
    return response.data.data;
  }

  async setPrimaryPhoto(modelId: string, photoId: string): Promise<ModelPhoto> {
    const response = await api.put<ApiResponse<ModelPhoto>>(
      `${this.baseUrl}/${modelId}/photos/${photoId}/primary`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to set primary photo');
    }
    return response.data.data;
  }

  async searchModels(query: string, filters: ModelFilters = {}): Promise<UserModel[]> {
    const params = { ...filters, search: query };
    const response = await this.getModels(params);
    return response.data;
  }

  async getModelsByCollection(collectionId: string, params: Omit<ModelListParams, 'collectionId'> = {}): Promise<PaginatedResponse<UserModel>> {
    return this.getUserModelsByCollection(collectionId, params);
  }

  async getPublicModels(params: Omit<ModelListParams, 'isPublic'> = {}): Promise<PaginatedResponse<UserModel>> {
    return this.getModels({ ...params, isPublic: true });
  }

  async getUserModels(userId: string, params: Omit<ModelListParams, 'userId'> = {}): Promise<PaginatedResponse<UserModel>> {
    return this.getModels({ ...params, userId });
  }

  async addLibraryModelToCollection(libraryModel: LibraryModel, collectionId: string): Promise<UserModel> {
    const data = {
      modelId: libraryModel.id,
      collectionId: collectionId,
      paintingStatus: 'UNPAINTED' as const,
      isPublic: false,
    };

    const response = await api.post<ApiResponse<UserModel>>(
      `${this.baseUrl}/add-library-model`, 
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to add library model to collection');
    }
    return response.data.data;
  }
}

export const modelService = new ModelService();
export default modelService;
