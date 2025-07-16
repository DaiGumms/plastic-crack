/**
 * Collection Service
 * Handles all collection-related business logic and database operations
 * Implements Issue #19 acceptance criteria
 */

import { PrismaClient, Collection, Prisma } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateCollectionData {
  name: string;
  description?: string;
  isPublic?: boolean;
  gameSystemId: string;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  gameSystemId?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface CollectionFilters {
  search?: string;
  isPublic?: boolean;
  tags?: string[];
  userId?: string;
  gameSystem?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionWithStats extends Collection {
  _count: {
    userModels: number;
  };
  totalValue?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userModels?: Array<any>; // For detailed view with models
}

export class CollectionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new collection
   */
  async createCollection(
    userId: string,
    data: CreateCollectionData
  ): Promise<Collection> {
    try {
      const collection = await this.prisma.collection.create({
        data: {
          ...data,
          userId,
          tags: data.tags || [],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImageUrl: true,
            },
          },
          gameSystem: {
            select: {
              id: true,
              name: true,
              shortName: true,
              description: true,
              publisher: true,
            },
          },
          _count: {
            select: {
              userModels: true,
            },
          },
        },
      });

      return collection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Collection name must be unique for user', 400);
        }
      }
      throw new AppError('Failed to create collection', 500);
    }
  }

  /**
   * Get collections with pagination and filtering
   */
  async getCollections(
    filters: CollectionFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{
    collections: CollectionWithStats[];
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
    const where: Prisma.CollectionWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    } else if (!filters.userId) {
      // Default to public collections only when no user filter is specified
      where.isPublic = true;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.gameSystem) {
      where.gameSystem = {
        shortName: { equals: filters.gameSystem, mode: 'insensitive' },
      };
    }

    // Get total count for pagination
    const total = await this.prisma.collection.count({ where });

    // Get collections with stats
    const collections = await this.prisma.collection.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        gameSystem: {
          select: {
            id: true,
            name: true,
            shortName: true,
            description: true,
            publisher: true,
          },
        },
        _count: {
          select: {
            userModels: true,
          },
        },
        userModels: {
          select: {
            purchasePrice: true,
          },
        },
      },
    });

    // Calculate total value for each collection
    const collectionsWithStats: CollectionWithStats[] = collections.map(
      collection => {
        const totalValue = collection.userModels.reduce((sum, model) => {
          return sum + (model.purchasePrice?.toNumber() || 0);
        }, 0);

        return {
          ...collection,
          totalValue: totalValue > 0 ? totalValue : undefined,
        };
      }
    );

    const totalPages = Math.ceil(total / limit);

    return {
      collections: collectionsWithStats,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a collection by ID with full details
   */
  async getCollectionById(
    collectionId: string,
    userId?: string
  ): Promise<CollectionWithStats | null> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        gameSystem: {
          select: {
            id: true,
            name: true,
            shortName: true,
            description: true,
            publisher: true,
          },
        },
        userModels: {
          include: {
            model: {
              include: {
                gameSystem: true,
                faction: true,
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            userModels: true,
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    // Check privacy - if collection is private, only owner can view
    if (!collection.isPublic && collection.userId !== userId) {
      throw new AppError('Collection not found or access denied', 404);
    }

    // Calculate total value
    const totalValue = collection.userModels.reduce((sum, model) => {
      return sum + (model.purchasePrice?.toNumber() || 0);
    }, 0);

    const { userModels, ...collectionData } = collection;
    return {
      ...collectionData,
      userModels,
      totalValue: totalValue > 0 ? totalValue : undefined,
    };
  }

  /**
   * Update a collection
   */
  async updateCollection(
    collectionId: string,
    userId: string,
    data: UpdateCollectionData
  ): Promise<Collection> {
    // Check if collection exists and user owns it
    const existingCollection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!existingCollection) {
      throw new AppError('Collection not found', 404);
    }

    if (existingCollection.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    try {
      const updatedCollection = await this.prisma.collection.update({
        where: { id: collectionId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImageUrl: true,
            },
          },
          gameSystem: {
            select: {
              id: true,
              name: true,
              shortName: true,
              description: true,
              publisher: true,
            },
          },
          _count: {
            select: {
              userModels: true,
            },
          },
        },
      });

      return updatedCollection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Collection name must be unique for user', 400);
        }
      }
      throw new AppError('Failed to update collection', 500);
    }
  }

  /**
   * Delete a collection (with cascade deletion of user models)
   */
  async deleteCollection(collectionId: string, userId: string): Promise<void> {
    // Check if collection exists and user owns it
    const existingCollection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: {
            userModels: true,
          },
        },
      },
    });

    if (!existingCollection) {
      throw new AppError('Collection not found', 404);
    }

    if (existingCollection.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Delete all user models in the collection first
      await tx.userModel.deleteMany({
        where: { collectionId },
      });

      // Then delete the collection
      await tx.collection.delete({
        where: { id: collectionId },
      });
    });
  }

  /**
   * Get collection deletion info (for confirmation dialog)
   */
  async getCollectionDeletionInfo(collectionId: string, userId: string): Promise<{
    collection: { id: string; name: string };
    modelCount: number;
  }> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      select: {
        id: true,
        name: true,
        userId: true,
        _count: {
          select: {
            userModels: true,
          },
        },
      },
    });

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return {
      collection: { id: collection.id, name: collection.name },
      modelCount: collection._count.userModels,
    };
  }

  /**
   * Add a model to a collection (handled in model service, but validation here)
   */
  async validateCollectionAccess(
    collectionId: string,
    userId: string
  ): Promise<Collection> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return collection;
  }

  /**
   * Search collections with advanced filters
   */
  async searchCollections(
    query: string,
    filters: CollectionFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{
    collections: CollectionWithStats[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchFilters: CollectionFilters = {
      ...filters,
      search: query,
    };

    return this.getCollections(searchFilters, pagination);
  }

  /**
   * Get user's collections with stats
   */
  async getUserCollections(
    userId: string,
    includePrivate: boolean = false
  ): Promise<CollectionWithStats[]> {
    const where: Prisma.CollectionWhereInput = {
      userId,
    };

    if (!includePrivate) {
      where.isPublic = true;
    }

    const collections = await this.prisma.collection.findMany({
      where,
      include: {
        gameSystem: {
          select: {
            id: true,
            name: true,
            shortName: true,
            description: true,
            publisher: true,
          },
        },
        _count: {
          select: {
            userModels: true,
          },
        },
        userModels: {
          select: {
            purchasePrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return collections.map(collection => {
      const totalValue = collection.userModels.reduce((sum, model) => {
        return sum + (model.purchasePrice?.toNumber() || 0);
      }, 0);

      return {
        ...collection,
        totalValue: totalValue > 0 ? totalValue : undefined,
      };
    });
  }
}
