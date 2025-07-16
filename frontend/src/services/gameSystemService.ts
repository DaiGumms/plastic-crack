import type { ApiResponse, PaginatedResponse } from '../types';
import api from './api';

export interface GameSystem {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  publisher?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faction {
  id: string;
  name: string;
  gameSystemId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class GameSystemService {
  private baseUrl = '/api/v1/game-systems';

  async getGameSystems(): Promise<PaginatedResponse<GameSystem>> {
    const response = await api.get<PaginatedResponse<GameSystem>>(this.baseUrl);
    return response.data;
  }

  async getGameSystemById(id: string): Promise<GameSystem> {
    const response = await api.get<ApiResponse<GameSystem>>(
      `${this.baseUrl}/${id}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch game system');
    }
    return response.data.data;
  }

  async getFactions(gameSystemId: string): Promise<Faction[]> {
    const response = await api.get<ApiResponse<Faction[]>>(
      `${this.baseUrl}/${gameSystemId}/factions`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch factions');
    }
    return response.data.data;
  }

  async getAllFactions(): Promise<Faction[]> {
    const response = await api.get<ApiResponse<Faction[]>>('/api/v1/factions');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch factions');
    }
    return response.data.data;
  }
}

export const gameSystemService = new GameSystemService();
export default gameSystemService;
