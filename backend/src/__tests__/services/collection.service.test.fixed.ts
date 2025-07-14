/**
 * Collection Service Tests - Fixed Version
 * Tests Issue #19 implementation - Collection CRUD Service
 */

import { beforeAll, beforeEach, afterAll, describe, it, expect } from '@jest/globals';
import { PrismaClient } from '../../generated/prisma';
import { CollectionService } from '../../services/collection.service';
import { AppError } from '../../middleware/errorHandler';

describe('CollectionService', () => {
  let prisma: PrismaClient;
  let collectionService: CollectionService;
  let testUserId: string;
  let testUserId2: string;
  let testGameSystemId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    collectionService = new CollectionService(prisma);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.gameSystem.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'test1@example.com',
        passwordHash: 'hashedpassword',
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User1',
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'test2@example.com',
        passwordHash: 'hashedpassword',
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User2',
      },
    });
    testUserId2 = user2.id;

    // Create test game system
    const gameSystem = await prisma.gameSystem.create({
      data: {
        name: 'Warhammer 40,000',
        shortName: 'WH40K',
        description: 'In the grim dark future there is only war',
        isActive: true,
      },
    });
    testGameSystemId = gameSystem.id;
  });

  describe('createCollection', () => {
    it('should create a collection successfully', async () => {
      const collectionData = {
        name: 'New Collection',
        description: 'A brand new collection',
        isPublic: true,
        tags: ['New', 'Test'],
      };

      const collection = await collectionService.createCollection(testUserId, collectionData);

      expect(collection.id).toBeDefined();
      expect(collection.name).toBe(collectionData.name);
      expect(collection.description).toBe(collectionData.description);
      expect(collection.isPublic).toBe(collectionData.isPublic);
      expect(collection.tags).toEqual(collectionData.tags);
      expect(collection.userId).toBe(testUserId);
    });

    it('should create collection with minimal data', async () => {
      const collectionData = {
        name: 'Minimal Collection',
      };

      const collection = await collectionService.createCollection(testUserId, collectionData);

      expect(collection.id).toBeDefined();
      expect(collection.name).toBe(collectionData.name);
      expect(collection.isPublic).toBe(true);
      expect(collection.tags).toEqual([]);
    });

    it('should throw error for invalid user ID', async () => {
      const collectionData = {
        name: 'Invalid User Collection',
      };

      await expect(
        collectionService.createCollection('invalid-user-id', collectionData)
      ).rejects.toThrow();
    });
  });

  describe('getCollections', () => {
    beforeEach(async () => {
      // Create additional test collections
      await prisma.collection.createMany({
        data: [
          {
            name: 'Public Collection 1',
            description: 'Public description 1',
            isPublic: true,
            userId: testUserId,
            tags: ['Public', 'Test1'],
          },
          {
            name: 'Public Collection 2',
            description: 'Public description 2',
            isPublic: true,
            userId: testUserId2,
            tags: ['Public', 'Test2'],
          },
          {
            name: 'Private Collection',
            description: 'Private description',
            isPublic: false,
            userId: testUserId,
            tags: ['Private', 'Test'],
          },
        ],
      });
    });

    it('should return paginated collections with default parameters', async () => {
      const result = await collectionService.getCollections();

      expect(result.collections).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.collections.length).toBeGreaterThan(0);
    });

    it('should only return public collections when no user filter', async () => {
      const result = await collectionService.getCollections();

      const allPublic = result.collections.every(c => c.isPublic === true);
      expect(allPublic).toBe(true);
    });
  });

  describe('updateCollection', () => {
    let testCollectionId: string;

    beforeEach(async () => {
      const collection = await prisma.collection.create({
        data: {
          name: 'Test Collection for Update',
          description: 'Original description',
          isPublic: true,
          userId: testUserId,
          tags: ['Original', 'Tags'],
        },
      });
      testCollectionId = collection.id;
    });

    it('should update collection successfully', async () => {
      const updateData = {
        name: 'Updated Collection Name',
        description: 'Updated description',
        isPublic: false,
        tags: ['Updated', 'Tags'],
      };

      const updatedCollection = await collectionService.updateCollection(
        testCollectionId,
        testUserId,
        updateData
      );

      expect(updatedCollection.name).toBe(updateData.name);
      expect(updatedCollection.description).toBe(updateData.description);
      expect(updatedCollection.isPublic).toBe(updateData.isPublic);
      expect(updatedCollection.tags).toEqual(updateData.tags);
    });

    it('should throw error for unauthorized user', async () => {
      const updateData = { name: 'Updated Name' };

      await expect(
        collectionService.updateCollection(testCollectionId, testUserId2, updateData)
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteCollection', () => {
    let testCollectionId: string;

    beforeEach(async () => {
      const collection = await prisma.collection.create({
        data: {
          name: 'Test Collection for Delete',
          description: 'A collection to be deleted',
          userId: testUserId,
          tags: ['ToDelete'],
        },
      });
      testCollectionId = collection.id;
    });

    it('should delete collection successfully', async () => {
      await collectionService.deleteCollection(testCollectionId, testUserId);

      const deletedCollection = await prisma.collection.findUnique({
        where: { id: testCollectionId },
      });
      expect(deletedCollection).toBeNull();
    });

    it('should throw error for unauthorized user', async () => {
      await expect(
        collectionService.deleteCollection(testCollectionId, testUserId2)
      ).rejects.toThrow(AppError);
    });
  });
});
