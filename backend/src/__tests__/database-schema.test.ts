/**
 * Database Schema Tests for Issue #18
 * Tests the enhanced database schemas including tagging system,
 * enhanced models, collections, and user management features.
 */

import { PrismaClient } from '../generated/prisma';

describe('Database Schema - Issue #18 Implementation', () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let testGameSystemId: string;
  let testFactionId: string;
  let testCollectionId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-schema@example.com',
        username: 'test-schema-user',
        passwordHash: 'test-hash',
        experienceLevel: 'INTERMEDIATE',
        preferredGameSystems: ['Warhammer 40K', 'Age of Sigmar'],
        preferredPaintBrands: ['Citadel', 'Vallejo'],
      },
    });
    testUserId = testUser.id;

    // Create test game system
    const testGameSystem = await prisma.gameSystem.create({
      data: {
        name: 'Test Game System',
        shortName: 'TGS',
        description: 'Test game system for schema testing',
      },
    });
    testGameSystemId = testGameSystem.id;

    // Create test faction
    const testFaction = await prisma.faction.create({
      data: {
        name: 'Test Faction',
        gameSystemId: testGameSystemId,
      },
    });
    testFactionId = testFaction.id;

    // Create test collection
    const testCollection = await prisma.collection.create({
      data: {
        name: 'Test Collection',
        description: 'Test collection for schema testing',
        userId: testUserId,
        gameSystemId: testGameSystemId,
        tags: ['test', 'collection'],
      },
    });
    testCollectionId = testCollection.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.modelTag.deleteMany();
    await prisma.modelPhoto.deleteMany();
    await prisma.modelLike.deleteMany();
    await prisma.model.deleteMany();
    await prisma.tag.deleteMany({ where: { name: { startsWith: 'test-' } } });
    await prisma.collection.deleteMany();
    await prisma.faction.deleteMany({ where: { name: 'Test Faction' } });
    await prisma.gameSystem.deleteMany({ where: { name: 'Test Game System' } });
    await prisma.user.deleteMany({
      where: { email: 'test-schema@example.com' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Model Enhancements', () => {
    it('should create user with enhanced fields', async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(user).toBeTruthy();
      expect(user?.experienceLevel).toBe('INTERMEDIATE');
      expect(user?.preferredGameSystems).toEqual([
        'Warhammer 40K',
        'Age of Sigmar',
      ]);
      expect(user?.preferredPaintBrands).toEqual(['Citadel', 'Vallejo']);
      expect(user?.role).toBe('USER');
      expect(user?.permissions).toEqual([]);
    });

    it('should enforce experience level enum constraints', async () => {
      const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

      for (const level of validLevels) {
        const user = await prisma.user.create({
          data: {
            email: `test-${level.toLowerCase()}@example.com`,
            username: `test-${level.toLowerCase()}`,
            passwordHash: 'test-hash',
            experienceLevel: level as any,
          },
        });

        expect(user.experienceLevel).toBe(level);

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }
    });
  });

  describe('Collection Model Enhancements', () => {
    it('should create collection with tags and metadata', async () => {
      const collection = await prisma.collection.findUnique({
        where: { id: testCollectionId },
      });

      expect(collection).toBeTruthy();
      expect(collection?.tags).toEqual(['test', 'collection']);
      expect(collection?.isPublic).toBe(true);
    });

    it('should support collection cover images', async () => {
      const collection = await prisma.collection.update({
        where: { id: testCollectionId },
        data: {
          imageUrl: 'https://example.com/collection-cover.jpg',
        },
      });

      expect(collection.imageUrl).toBe(
        'https://example.com/collection-cover.jpg'
      );
    });
  });

  describe('Model Enhancements', () => {
    let testModelId: string;

    beforeEach(async () => {
      const model = await prisma.model.create({
        data: {
          name: 'Test Model',
          gameSystemId: testGameSystemId,
          factionId: testFactionId,
          collectionId: testCollectionId,
          userId: testUserId,
          paintingStatus: 'IN_PROGRESS',
          pointsCost: 100,
          tags: ['infantry', 'troop'],
          purchasePrice: 35.0,
          purchaseDate: new Date('2024-01-15'),
          isPublic: true,
        },
      });
      testModelId = model.id;
    });

    it('should create model with enhanced fields', async () => {
      const model = await prisma.model.findUnique({
        where: { id: testModelId },
      });

      expect(model).toBeTruthy();
      expect(model?.tags).toEqual(['infantry', 'troop']);
      expect(model?.purchasePrice?.toString()).toBe('35');
      expect(model?.isPublic).toBe(true);
      expect(model?.pointsCost).toBe(100);
    });

    it('should support painting status tracking', async () => {
      const validStatuses = [
        'UNPAINTED',
        'PRIMED',
        'BASE_COATED',
        'IN_PROGRESS',
        'COMPLETED',
        'SHOWCASE',
      ];

      for (const status of validStatuses) {
        const model = await prisma.model.update({
          where: { id: testModelId },
          data: { paintingStatus: status as any },
        });

        expect(model.paintingStatus).toBe(status);
      }
    });
  });

  describe('Tagging System', () => {
    let testTagId: string;

    beforeEach(async () => {
      const tag = await prisma.tag.create({
        data: {
          name: 'test-tag',
          description: 'A test tag for schema testing',
          category: 'GENERAL',
          color: '#FF0000',
          isOfficial: false,
        },
      });
      testTagId = tag.id;
    });

    it('should create tags with all properties', async () => {
      const tag = await prisma.tag.findUnique({
        where: { id: testTagId },
      });

      expect(tag).toBeTruthy();
      expect(tag?.name).toBe('test-tag');
      expect(tag?.description).toBe('A test tag for schema testing');
      expect(tag?.category).toBe('GENERAL');
      expect(tag?.color).toBe('#FF0000');
      expect(tag?.isOfficial).toBe(false);
      expect(tag?.usageCount).toBe(0);
    });

    it('should enforce tag name uniqueness', async () => {
      await expect(
        prisma.tag.create({
          data: {
            name: 'test-tag', // Same name as existing tag
            category: 'CUSTOM',
          },
        })
      ).rejects.toThrow();
    });

    it('should support all tag categories', async () => {
      const categories = [
        'GENERAL',
        'PAINTING',
        'GAME_SYSTEM',
        'FACTION',
        'UNIT_TYPE',
        'TECHNIQUE',
        'STATUS',
        'CUSTOM',
      ];

      for (const category of categories) {
        const tag = await prisma.tag.create({
          data: {
            name: `test-${category.toLowerCase()}`,
            category: category as any,
          },
        });

        expect(tag.category).toBe(category);

        // Clean up
        await prisma.tag.delete({ where: { id: tag.id } });
      }
    });

    it('should create model-tag relationships', async () => {
      // Create a test model
      const model = await prisma.model.create({
        data: {
          name: 'Test Tagged Model',
          gameSystemId: testGameSystemId,
          factionId: testFactionId,
          collectionId: testCollectionId,
          userId: testUserId,
        },
      });

      // Create model-tag relationship
      const modelTag = await prisma.modelTag.create({
        data: {
          modelId: model.id,
          tagId: testTagId,
        },
      });

      expect(modelTag).toBeTruthy();
      expect(modelTag.modelId).toBe(model.id);
      expect(modelTag.tagId).toBe(testTagId);

      // Verify the relationship
      const modelWithTags = await prisma.model.findUnique({
        where: { id: model.id },
        include: {
          modelTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      expect(modelWithTags?.modelTags).toHaveLength(1);
      expect(modelWithTags?.modelTags[0].tag.name).toBe('test-tag');

      // Clean up
      await prisma.modelTag.delete({ where: { id: modelTag.id } });
      await prisma.model.delete({ where: { id: model.id } });
    });

    it('should prevent duplicate model-tag relationships', async () => {
      const model = await prisma.model.create({
        data: {
          name: 'Test Model for Duplicate Tags',
          gameSystemId: testGameSystemId,
          factionId: testFactionId,
          collectionId: testCollectionId,
          userId: testUserId,
        },
      });

      // Create first relationship
      await prisma.modelTag.create({
        data: {
          modelId: model.id,
          tagId: testTagId,
        },
      });

      // Attempt to create duplicate relationship
      await expect(
        prisma.modelTag.create({
          data: {
            modelId: model.id,
            tagId: testTagId,
          },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.modelTag.deleteMany({
        where: { modelId: model.id },
      });
      await prisma.model.delete({ where: { id: model.id } });
    });
  });

  describe('Enhanced Model Photos', () => {
    let testModelId: string;

    beforeEach(async () => {
      const model = await prisma.model.create({
        data: {
          name: 'Test Model for Photos',
          gameSystemId: testGameSystemId,
          factionId: testFactionId,
          collectionId: testCollectionId,
          userId: testUserId,
        },
      });
      testModelId = model.id;
    });

    it('should create model photos with enhanced metadata', async () => {
      const photo = await prisma.modelPhoto.create({
        data: {
          modelId: testModelId,
          fileName: 'test-photo.jpg',
          originalUrl: 'https://example.com/test-photo.jpg',
          thumbnailUrl: 'https://example.com/test-photo-thumb.jpg',
          description: 'A test photo',
          isPrimary: true,
          sortOrder: 1,
          fileSize: 1024000,
          width: 1920,
          height: 1080,
          mimeType: 'image/jpeg',
        },
      });

      expect(photo).toBeTruthy();
      expect(photo.fileName).toBe('test-photo.jpg');
      expect(photo.fileSize).toBe(1024000);
      expect(photo.width).toBe(1920);
      expect(photo.height).toBe(1080);
      expect(photo.mimeType).toBe('image/jpeg');
    });
  });

  describe('Data Integrity and Relationships', () => {
    it('should maintain referential integrity on cascade deletes', async () => {
      // Create a model with photos and tags
      const model = await prisma.model.create({
        data: {
          name: 'Test Model for Cascade',
          gameSystemId: testGameSystemId,
          factionId: testFactionId,
          collectionId: testCollectionId,
          userId: testUserId,
        },
      });

      // Add a photo
      const photo = await prisma.modelPhoto.create({
        data: {
          modelId: model.id,
          fileName: 'test.jpg',
          originalUrl: 'https://example.com/test.jpg',
        },
      });

      // Add a tag relationship
      const tag = await prisma.tag.create({
        data: {
          name: 'test-cascade-tag',
          category: 'GENERAL',
        },
      });

      const modelTag = await prisma.modelTag.create({
        data: {
          modelId: model.id,
          tagId: tag.id,
        },
      });

      // Delete the model - should cascade delete photos and model-tag relationships
      await prisma.model.delete({ where: { id: model.id } });

      // Verify photos were deleted
      const photoExists = await prisma.modelPhoto.findUnique({
        where: { id: photo.id },
      });
      expect(photoExists).toBeNull();

      // Verify model-tag relationships were deleted
      const modelTagExists = await prisma.modelTag.findUnique({
        where: { id: modelTag.id },
      });
      expect(modelTagExists).toBeNull();

      // Verify tag still exists (should not be cascade deleted)
      const tagExists = await prisma.tag.findUnique({
        where: { id: tag.id },
      });
      expect(tagExists).toBeTruthy();

      // Clean up
      await prisma.tag.delete({ where: { id: tag.id } });
    });
  });
});
