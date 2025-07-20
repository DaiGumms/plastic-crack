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
  factionIds?: string[];
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  gameSystemId?: string;
  factionIds?: string[];
  tags?: string[];
  imageUrl?: string;
}

export interface CollectionFilters {
  search?: string;
  isPublic?: boolean;
  tags?: string[];
  userId?: string;
  gameSystem?: string;
  createdAfter?: string;
  createdBefore?: string;
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
          name: data.name,
          description: data.description,
          isPublic: data.isPublic,
          gameSystemId: data.gameSystemId,
          userId,
          tags: data.tags || [],
          imageUrl: data.imageUrl,
          ...(data.factionIds && data.factionIds.length > 0 && {
            factions: {
              connect: data.factionIds.map(id => ({ id })),
            },
          }),
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
          factions: {
            select: {
              id: true,
              name: true,
              description: true,
              gameSystemId: true,
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

    // Store tag filters separately for case-insensitive processing
    const tagFilters = filters.tags && filters.tags.length > 0 ? filters.tags : null;
    
    // Remove tags from the main where clause for now
    // We'll filter by tags after the query for case-insensitive matching
    // if (filters.tags && filters.tags.length > 0) {
    //   // For case-insensitive tag filtering, we'll fetch all collections first
    //   // and filter programmatically since Prisma doesn't support case-insensitive array operations
    //   // This is a temporary solution - for better performance, consider using raw SQL
    //   where.tags = { hasSome: filters.tags };
    // }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.gameSystem) {
      where.gameSystem = {
        shortName: { equals: filters.gameSystem, mode: 'insensitive' },
      };
    }

    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = new Date(filters.createdAfter);
      }
      if (filters.createdBefore) {
        where.createdAt.lte = new Date(filters.createdBefore);
      }
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
        factions: {
          select: {
            id: true,
            name: true,
            description: true,
            gameSystemId: true,
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
    let collectionsWithStats: CollectionWithStats[] = collections.map(
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

    // Apply case-insensitive tag filtering if tags were specified
    if (tagFilters) {
      collectionsWithStats = collectionsWithStats.filter(collection => {
        return tagFilters.some(filterTag => 
          collection.tags.some(collectionTag => 
            collectionTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
      });
    }

    // Recalculate total after filtering
    const filteredTotal = tagFilters ? collectionsWithStats.length : total;

    const totalPages = Math.ceil(filteredTotal / limit);

    return {
      collections: collectionsWithStats,
      total: filteredTotal,
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
        factions: {
          select: {
            id: true,
            name: true,
            description: true,
            gameSystemId: true,
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
              orderBy: { isPrimary: 'desc' },
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
          name: data.name,
          description: data.description,
          isPublic: data.isPublic,
          gameSystemId: data.gameSystemId,
          tags: data.tags,
          imageUrl: data.imageUrl,
          updatedAt: new Date(),
          ...(data.factionIds !== undefined && {
            factions: {
              set: data.factionIds.map(id => ({ id })),
            },
          }),
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
          factions: {
            select: {
              id: true,
              name: true,
              description: true,
              gameSystemId: true,
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
    await this.prisma.$transaction(async tx => {
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
  async getCollectionDeletionInfo(
    collectionId: string,
    userId: string
  ): Promise<{
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

  /**
   * Search for users by username for autocomplete
   */
  async searchUsers(query: string, limit: number = 10): Promise<Array<{
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  }>> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: query.trim(),
          mode: 'insensitive',
        },
        // Remove the isProfilePublic filter - all users should be searchable
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        profileImageUrl: true,
      },
      take: limit,
      orderBy: {
        username: 'asc',
      },
    });

    return users;
  }
}
