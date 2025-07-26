import type { ApiResponse } from '../types';
import api from './api';

export interface GameSystem {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  publisher?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Faction {
  id: string;
  name: string;
  gameSystemId: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

class GameSystemService {
  private baseUrl = '/game-systems';

  async getGameSystems(): Promise<GameSystem[]> {
    const response = await api.get<GameSystem[]>(this.baseUrl);
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
    const response = await api.get<Faction[]>(
      `${this.baseUrl}/${gameSystemId}/factions`
    );
    return response.data;
  }

  async getAllFactions(): Promise<Faction[]> {
    const response = await api.get<ApiResponse<Faction[]>>('/factions');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch factions');
    }
    return response.data.data;
  }
}

export const gameSystemService = new GameSystemService();
export default gameSystemService;
