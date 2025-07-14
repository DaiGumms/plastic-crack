/**
 * Model Service
 * Handles all model/miniature-related business logic and database operations
 * Implements Issue #20 acceptance criteria
 */

import { PrismaClient, Model, Prisma, PaintingStatus } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateModelData {
  name: string;
  description?: string;
  gameSystemId: string;
  factionId?: string;
  collectionId: string;
  paintingStatus?: PaintingStatus;
  pointsCost?: number;
  notes?: string;
  tags?: string[];
  purchasePrice?: number;
  purchaseDate?: Date;
  isPublic?: boolean;
}

export interface UpdateModelData {
  name?: string;
  description?: string;
  gameSystemId?: string;
  factionId?: string;
  paintingStatus?: PaintingStatus;
  pointsCost?: number;
  notes?: string;
  tags?: string[];
  purchasePrice?: number;
  purchaseDate?: Date;
  isPublic?: boolean;
}

export interface ModelFilters {
  search?: string;
  gameSystemId?: string;
  factionId?: string;
  paintingStatus?: PaintingStatus;
  tags?: string[];
  isPublic?: boolean;
  userId?: string;
  collectionId?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'paintingStatus';
  sortOrder?: 'asc' | 'desc';
}

export interface BulkUpdateData {
  modelIds: string[];
  updates: Partial<UpdateModelData>;
}

export interface ModelPhotoData {
  fileName: string;
  originalUrl: string;
  thumbnailUrl?: string;
  description?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

export class ModelService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Add a new model to a collection
   */
  async addModel(userId: string, data: CreateModelData): Promise<Model> {
    // Verify collection exists and user owns it
    const collection = await this.prisma.collection.findUnique({
      where: { id: data.collectionId },
    });

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Verify game system exists
    const gameSystem = await this.prisma.gameSystem.findUnique({
      where: { id: data.gameSystemId },
    });

    if (!gameSystem) {
      throw new AppError('Game system not found', 404);
    }

    // Verify faction exists if provided
    if (data.factionId) {
      const faction = await this.prisma.faction.findUnique({
        where: { id: data.factionId },
      });

      if (!faction) {
        throw new AppError('Faction not found', 404);
      }

      if (faction.gameSystemId !== data.gameSystemId) {
        throw new AppError('Faction does not belong to the specified game system', 400);
      }
    }

    try {
      const model = await this.prisma.model.create({
        data: {
          ...data,
          userId,
          tags: data.tags || [],
          purchasePrice: data.purchasePrice ? new Prisma.Decimal(data.purchasePrice) : null,
        },
        include: {
          gameSystem: true,
          faction: true,
          collection: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
          photos: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      return model;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Model name must be unique within collection', 400);
        }
      }
      throw new AppError('Failed to create model', 500);
    }
  }

  /**
   * Get model details by ID
   */
  async getModelById(modelId: string, userId?: string): Promise<Model | null> {
    const model = await this.prisma.model.findUnique({
      where: { id: modelId },
      include: {
        gameSystem: true,
        faction: true,
        collection: {
          select: {
            id: true,
            name: true,
            userId: true,
            isPublic: true,
          },
        },
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        modelTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!model) {
      return null;
    }

    // Check privacy - if model or collection is private, only owner can view
    if ((!model.isPublic || !model.collection.isPublic) && model.userId !== userId) {
      throw new AppError('Model not found or access denied', 404);
    }

    return model;
  }

  /**
   * Update model details
   */
  async updateModel(
    modelId: string,
    userId: string,
    data: UpdateModelData
  ): Promise<Model> {
    // Check if model exists and user owns it
    const existingModel = await this.prisma.model.findUnique({
      where: { id: modelId },
      include: {
        collection: true,
      },
    });

    if (!existingModel) {
      throw new AppError('Model not found', 404);
    }

    if (existingModel.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Verify game system exists if being updated
    if (data.gameSystemId) {
      const gameSystem = await this.prisma.gameSystem.findUnique({
        where: { id: data.gameSystemId },
      });

      if (!gameSystem) {
        throw new AppError('Game system not found', 404);
      }
    }

    // Verify faction exists if provided
    if (data.factionId) {
      const faction = await this.prisma.faction.findUnique({
        where: { id: data.factionId },
      });

      if (!faction) {
        throw new AppError('Faction not found', 404);
      }

      const gameSystemId = data.gameSystemId || existingModel.gameSystemId;
      if (faction.gameSystemId !== gameSystemId) {
        throw new AppError('Faction does not belong to the specified game system', 400);
      }
    }

    try {
      const updatedModel = await this.prisma.model.update({
        where: { id: modelId },
        data: {
          ...data,
          purchasePrice: data.purchasePrice ? new Prisma.Decimal(data.purchasePrice) : undefined,
          updatedAt: new Date(),
        },
        include: {
          gameSystem: true,
          faction: true,
          collection: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
          photos: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      return updatedModel;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Model name must be unique within collection', 400);
        }
      }
      throw new AppError('Failed to update model', 500);
    }
  }

  /**
   * Update painting status
   */
  async updatePaintingStatus(
    modelId: string,
    userId: string,
    paintingStatus: PaintingStatus
  ): Promise<Model> {
    return this.updateModel(modelId, userId, { paintingStatus });
  }

  /**
   * Delete a model
   */
  async deleteModel(modelId: string, userId: string): Promise<void> {
    // Check if model exists and user owns it
    const existingModel = await this.prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!existingModel) {
      throw new AppError('Model not found', 404);
    }

    if (existingModel.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await this.prisma.model.delete({
      where: { id: modelId },
    });
  }

  /**
   * Add photos to a model
   */
  async addModelPhotos(
    modelId: string,
    userId: string,
    photosData: ModelPhotoData[]
  ): Promise<Model> {
    // Verify model exists and user owns it
    const model = await this.prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      throw new AppError('Model not found', 404);
    }

    if (model.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // If setting a primary photo, remove primary status from existing photos
    const hasPrimary = photosData.some(photo => photo.isPrimary);
    if (hasPrimary) {
      await this.prisma.modelPhoto.updateMany({
        where: { modelId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Add new photos
    await this.prisma.modelPhoto.createMany({
      data: photosData.map(photo => ({
        ...photo,
        modelId,
      })),
    });

    // Return updated model with photos
    return this.getModelById(modelId, userId) as Promise<Model>;
  }

  /**
   * Remove a photo from a model
   */
  async removeModelPhoto(
    modelId: string,
    photoId: string,
    userId: string
  ): Promise<void> {
    // Verify model exists and user owns it
    const model = await this.prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      throw new AppError('Model not found', 404);
    }

    if (model.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Verify photo exists and belongs to model
    const photo = await this.prisma.modelPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.modelId !== modelId) {
      throw new AppError('Photo not found', 404);
    }

    await this.prisma.modelPhoto.delete({
      where: { id: photoId },
    });
  }

  /**
   * Bulk update models
   */
  async bulkUpdateModels(
    userId: string,
    bulkData: BulkUpdateData
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    // Verify all models exist and user owns them
    const models = await this.prisma.model.findMany({
      where: {
        id: { in: bulkData.modelIds },
        userId,
      },
    });

    if (models.length !== bulkData.modelIds.length) {
      const foundIds = models.map(m => m.id);
      const notFound = bulkData.modelIds.filter(id => !foundIds.includes(id));
      throw new AppError(`Models not found or access denied: ${notFound.join(', ')}`, 404);
    }

    // Perform bulk update
    try {
      const result = await this.prisma.model.updateMany({
        where: {
          id: { in: bulkData.modelIds },
          userId,
        },
        data: {
          ...bulkData.updates,
          purchasePrice: bulkData.updates.purchasePrice 
            ? new Prisma.Decimal(bulkData.updates.purchasePrice) 
            : undefined,
          updatedAt: new Date(),
        },
      });

      updated = result.count;
    } catch {
      errors.push('Failed to update some models');
    }

    return { updated, errors };
  }

  /**
   * Search models with filters
   */
  async searchModels(
    filters: ModelFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{
    models: Model[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ModelWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.gameSystemId) {
      where.gameSystemId = filters.gameSystemId;
    }

    if (filters.factionId) {
      where.factionId = filters.factionId;
    }

    if (filters.paintingStatus) {
      where.paintingStatus = filters.paintingStatus;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.collectionId) {
      where.collectionId = filters.collectionId;
    }

    // For public visibility, ensure both model and collection are public
    if (filters.isPublic === true && !filters.userId) {
      where.AND = [
        { isPublic: true },
        { collection: { isPublic: true } },
      ];
    }

    // Get total count for pagination
    const total = await this.prisma.model.count({ where });

    // Get models
    const models = await this.prisma.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        gameSystem: true,
        faction: true,
        collection: {
          select: {
            id: true,
            name: true,
            userId: true,
            isPublic: true,
          },
        },
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      models,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get models by collection
   */
  async getModelsByCollection(
    collectionId: string,
    userId?: string,
    filters: Partial<ModelFilters> = {},
    pagination: PaginationOptions = {}
  ): Promise<{
    models: Model[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Verify collection access
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    // Check privacy
    if (!collection.isPublic && collection.userId !== userId) {
      throw new AppError('Collection not found or access denied', 404);
    }

    const combinedFilters: ModelFilters = {
      ...filters,
      collectionId,
      isPublic: collection.userId !== userId ? true : undefined,
    };

    return this.searchModels(combinedFilters, pagination);
  }

  /**
   * Get user's models across all collections
   */
  async getUserModels(
    userId: string,
    includePrivate: boolean = false,
    pagination: PaginationOptions = {}
  ): Promise<{
    models: Model[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filters: ModelFilters = {
      userId,
      isPublic: includePrivate ? undefined : true,
    };

    return this.searchModels(filters, pagination);
  }
}
