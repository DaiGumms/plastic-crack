/**
 * Model Service
 * Handles all model/miniature-related business logic and database operations
 * Implements Issue #20 acceptance criteria
 */

import {
  PrismaClient,
  UserModel,
  Prisma,
  PaintingStatus,
} from '../generated/prisma';
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

export interface AddLibraryModelData {
  modelId: string; // ID of the library model to add
  collectionId: string; // Collection to add it to
  customName?: string; // User's custom name for this instance
  paintingStatus?: PaintingStatus;
  notes?: string;
  tags?: string[];
  purchasePrice?: number;
  purchaseDate?: Date;
  customPointsCost?: number;
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
   * Add a library model to a user's collection (create UserModel instance)
   * Note: Database unique constraint has been removed to allow multiple copies
   * of the same model for different paint schemes, conversions, etc.
   */
  async addLibraryModelToCollection(
    userId: string,
    data: AddLibraryModelData
  ): Promise<UserModel> {
    // Verify the library model exists
    const libraryModel = await this.prisma.model.findUnique({
      where: { id: data.modelId },
      include: {
        gameSystem: true,
        faction: true,
      },
    });

    if (!libraryModel) {
      throw new AppError('Library model not found', 404);
    }

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

    // Verify the model's game system matches the collection's game system
    if (libraryModel.gameSystemId !== collection.gameSystemId) {
      throw new AppError(
        'Model game system does not match collection game system',
        400
      );
    }

    try {
      // Create the user model instance
      // Note: Unique constraint removed - users can now have multiple instances
      // of the same model for different paint schemes
      const userModel = await this.prisma.userModel.create({
        data: {
          modelId: data.modelId,
          collectionId: data.collectionId,
          userId,
          customName: data.customName,
          paintingStatus: data.paintingStatus || 'UNPAINTED',
          notes: data.notes,
          tags: data.tags || [],
          purchasePrice: data.purchasePrice
            ? new Prisma.Decimal(data.purchasePrice)
            : null,
          purchaseDate: data.purchaseDate,
          customPointsCost: data.customPointsCost,
          isPublic: data.isPublic ?? true,
        },
        include: {
          model: {
            include: {
              gameSystem: true,
              faction: true,
            },
          },
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

      return userModel;
    } catch (error) {
      // Handle any other database errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Failed to add model to collection', 500);
      }
      throw error;
    }
  }

  /**
   * Get user models in a collection (UserModel instances)
   */
  async getUserModelsByCollection(
    collectionId: string,
    userId?: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      paintingStatus?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<{
    data: UserModel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Verify collection access
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    // Check privacy - if collection is private, only owner can view
    if (!collection.isPublic && collection.userId !== userId) {
      throw new AppError('Collection not found or access denied', 404);
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build where clause for UserModel
    const where = {
      collectionId,
    };

    // Get total count
    const total = await this.prisma.userModel.count({ where });

    // Get user models with related data
    const userModels = await this.prisma.userModel.findMany({
      where,
      skip,
      take: limit,
      include: {
        model: {
          include: {
            gameSystem: true,
            faction: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: userModels,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Add photos to a user model instance
   */
  async addUserModelPhotos(
    userModelId: string,
    userId: string,
    photosData: ModelPhotoData[]
  ): Promise<UserModel> {
    // Verify user model exists and user owns it
    const userModel = await this.prisma.userModel.findUnique({
      where: { id: userModelId },
    });

    if (!userModel) {
      throw new AppError('User model not found', 404);
    }

    if (userModel.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // If setting a primary photo, remove primary status from existing photos
    const hasPrimary = photosData.some(photo => photo.isPrimary);
    if (hasPrimary) {
      await this.prisma.userModelPhoto.updateMany({
        where: { userModelId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Add new photos
    await this.prisma.userModelPhoto.createMany({
      data: photosData.map(photo => ({
        fileName: photo.fileName,
        originalUrl: photo.originalUrl,
        thumbnailUrl: photo.thumbnailUrl,
        description: photo.description,
        isPrimary: photo.isPrimary || false,
        sortOrder: photo.sortOrder || 0,
        fileSize: photo.fileSize,
        width: photo.width,
        height: photo.height,
        mimeType: photo.mimeType,
        userModelId,
      })),
    });

    // Return updated user model with photos
    const updatedUserModel = await this.prisma.userModel.findUnique({
      where: { id: userModelId },
      include: {
        photos: true,
        model: true,
      },
    });

    if (!updatedUserModel) {
      throw new AppError('Failed to retrieve updated user model', 500);
    }

    return updatedUserModel;
  }

  /**
   * Delete a user model
   */
  async deleteModel(modelId: string, userId: string): Promise<void> {
    // Check if user model exists and user owns it
    const existingUserModel = await this.prisma.userModel.findUnique({
      where: { id: modelId },
    });

    if (!existingUserModel) {
      throw new AppError('Model not found', 404);
    }

    if (existingUserModel.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await this.prisma.userModel.delete({
      where: { id: modelId },
    });
  }

  /**
   * Update a user model
   */
  async updateModel(
    modelId: string,
    userId: string,
    data: Partial<CreateModelData>
  ): Promise<UserModel> {
    // Check if user model exists and user owns it
    const existingUserModel = await this.prisma.userModel.findUnique({
      where: { id: modelId },
      include: {
        collection: true,
      },
    });

    if (!existingUserModel) {
      throw new AppError('Model not found', 404);
    }

    if (existingUserModel.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    try {
      const updatedUserModel = await this.prisma.userModel.update({
        where: { id: modelId },
        data: {
          customName: data.name,
          paintingStatus: data.paintingStatus,
          notes: data.notes,
          tags: data.tags || [],
          purchasePrice: data.purchasePrice
            ? new Prisma.Decimal(data.purchasePrice)
            : undefined,
          purchaseDate: data.purchaseDate,
          customPointsCost: data.pointsCost,
          isPublic: data.isPublic,
          updatedAt: new Date(),
        },
        include: {
          model: {
            include: {
              gameSystem: true,
              faction: true,
            },
          },
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

      return updatedUserModel;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Failed to update model', 500);
      }
      throw error;
    }
  }
}
