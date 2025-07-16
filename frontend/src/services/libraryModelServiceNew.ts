import type { LibraryModel, PaginatedResponse } from '../types';
import api from './api';

export interface LibraryModelFilters {
  search?: string;
  gameSystemId?: string;
  factionId?: string;
  isOfficial?: boolean;
  tags?: string[];
}

class LibraryModelService {
  private baseUrl = '/api/v1/library/models';

  async getModels(
    page: number = 1,
    limit: number = 20,
    filters: LibraryModelFilters = {}
  ): Promise<PaginatedResponse<LibraryModel>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.gameSystemId) {
      params.append('gameSystemId', filters.gameSystemId);
    }
    if (filters.factionId) {
      params.append('factionId', filters.factionId);
    }
    if (filters.isOfficial !== undefined) {
      params.append('isOfficial', filters.isOfficial.toString());
    }
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const response = await api.get<{
      success: boolean;
      message: string;
      data: LibraryModel[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${this.baseUrl}?${params.toString()}`);

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getModelById(id: string): Promise<LibraryModel> {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: LibraryModel;
    }>(`${this.baseUrl}/${id}`);

    return response.data.data;
  }

  async searchModels(
    query: string,
    limit: number = 10
  ): Promise<LibraryModel[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await api.get<{
      success: boolean;
      message: string;
      data: LibraryModel[];
    }>(`${this.baseUrl}/search?${params.toString()}`);

    return response.data.data;
  }

  async getFeaturedModels(limit: number = 10): Promise<LibraryModel[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const response = await api.get<{
      success: boolean;
      message: string;
      data: LibraryModel[];
    }>(`${this.baseUrl}/featured?${params.toString()}`);

    return response.data.data;
  }

  async getModelsByGameSystem(
    gameSystemId: string,
    limit?: number
  ): Promise<LibraryModel[]> {
    const params = new URLSearchParams();
    if (limit) {
      params.append('limit', limit.toString());
    }

    const url = `${this.baseUrl}/game-system/${gameSystemId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{
      success: boolean;
      message: string;
      data: LibraryModel[];
    }>(url);

    return response.data.data;
  }

  async getModelsByFaction(
    factionId: string,
    limit?: number
  ): Promise<LibraryModel[]> {
    const params = new URLSearchParams();
    if (limit) {
      params.append('limit', limit.toString());
    }

    const url = `${this.baseUrl}/faction/${factionId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{
      success: boolean;
      message: string;
      data: LibraryModel[];
    }>(url);

    return response.data.data;
  }
}

export const libraryModelService = new LibraryModelService();
