/**
 * Library Model Service
 * Handles library model catalog operations (read-only model browsing)
 */

import { PrismaClient, Prisma } from '../generated/prisma';

export interface LibraryModelFilters {
  search?: string;
  gameSystemId?: string;
  factionId?: string;
  isOfficial?: boolean;
  tags?: string[];
}

export class LibraryModelService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get paginated library models with filtering
   */
  async getModels(
    page: number = 1,
    limit: number = 20,
    filters: LibraryModelFilters = {}
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ModelWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    if (filters.gameSystemId) {
      where.gameSystemId = filters.gameSystemId;
    }

    if (filters.factionId) {
      where.factionId = filters.factionId;
    }

    if (filters.isOfficial !== undefined) {
      where.isOfficial = filters.isOfficial;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasEvery: filters.tags,
      };
    }

    // Get total count
    const total = await this.prisma.model.count({ where });

    // Get paginated data
    const models = await this.prisma.model.findMany({
      where,
      include: {
        gameSystem: true,
        faction: true,
      },
      skip,
      take: limit,
      orderBy: [
        { isOfficial: 'desc' }, // Official models first
        { name: 'asc' },
      ],
    });

    return {
      data: models,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single library model by ID
   */
  async getModelById(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: {
        gameSystem: true,
        faction: true,
      },
    });

    if (!model) {
      throw new Error(`Model with ID ${id} not found`);
    }

    return model;
  }

  /**
   * Search models by name
   */
  async searchModels(query: string, limit: number = 10) {
    const models = await this.prisma.model.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        gameSystem: true,
        faction: true,
      },
      take: limit,
      orderBy: [{ isOfficial: 'desc' }, { name: 'asc' }],
    });

    return models;
  }

  /**
   * Get models by game system
   */
  async getModelsByGameSystem(gameSystemId: string, limit?: number) {
    const models = await this.prisma.model.findMany({
      where: { gameSystemId },
      include: {
        gameSystem: true,
        faction: true,
      },
      take: limit,
      orderBy: [
        { isOfficial: 'desc' },
        { faction: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return models;
  }

  /**
   * Get models by faction
   */
  async getModelsByFaction(factionId: string, limit?: number) {
    const models = await this.prisma.model.findMany({
      where: { factionId },
      include: {
        gameSystem: true,
        faction: true,
      },
      take: limit,
      orderBy: [{ isOfficial: 'desc' }, { name: 'asc' }],
    });

    return models;
  }

  /**
   * Get popular/featured models
   */
  async getFeaturedModels(limit: number = 10) {
    const models = await this.prisma.model.findMany({
      where: {
        isOfficial: true, // Only official models for featured
      },
      include: {
        gameSystem: true,
        faction: true,
      },
      take: limit,
      orderBy: [
        { createdAt: 'desc' }, // Newest first for now
      ],
    });

    return models;
  }
}
