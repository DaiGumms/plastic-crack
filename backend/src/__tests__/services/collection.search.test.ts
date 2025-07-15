import { it, expect, describe, beforeAll, afterAll } from '@jest/globals';
import { CollectionService } from '../../services/collection.service';
import { PrismaClient } from '../../generated/prisma';

describe('CollectionService Search and Filter Functions', () => {
  let gameSystemId1: string;
  let gameSystemId2: string;
  let userId: string;
  let collectionService: CollectionService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Initialize prisma and service
    prisma = new PrismaClient();
    await prisma.$connect();
    collectionService = new CollectionService(prisma);

    // Clean up database
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gameSystem.deleteMany();

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        passwordHash: 'hashed_password',
        emailVerified: true,
      },
    });
    userId = user.id;

    // Create or get game systems
    const gameSystem1 = await prisma.gameSystem.upsert({
      where: { shortName: 'W40K' },
      update: {},
      create: {
        name: 'Warhammer 40,000',
        shortName: 'W40K',
        description: 'Grimdark sci-fi tabletop game'
      }
    });

    const gameSystem2 = await prisma.gameSystem.upsert({
      where: { shortName: 'AOS' },
      update: {},
      create: {
        name: 'Age of Sigmar',
        shortName: 'AOS',
        description: 'Fantasy tabletop game'
      }
    });

    gameSystemId1 = gameSystem1.id;
    gameSystemId2 = gameSystem2.id;

    // Create test collections
    await prisma.collection.createMany({
      data: [
        {
          name: 'Ultramarines Army',
          description: 'Space Marine collection focused on Ultramarines chapter',
          gameSystemId: gameSystemId1,
          userId: userId,
          isPublic: true,
        },
        {
          name: 'Stormcast Eternals',
          description: 'Age of Sigmar golden warriors collection',
          gameSystemId: gameSystemId2,
          userId: userId,
          isPublic: true,
        },
        {
          name: 'Chaos Space Marines',
          description: 'Dark forces of chaos Space Marine armies',
          gameSystemId: gameSystemId1,
          userId: userId,
          isPublic: true,
        },
      ],
    });
  });

  afterAll(async () => {
    // Clean up database
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gameSystem.deleteMany();
    await prisma.$disconnect();
  });

  describe('Search functionality', () => {
    it('should search collections by name', async () => {
      const result = await collectionService.getCollections(
        { search: 'Ultramarines' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(1);
      expect(result.collections[0].name).toBe('Ultramarines Army');
    });

    test('should search collections by description', async () => {
      const result = await collectionService.getCollections(
        { search: 'warriors' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(1);
      expect(result.collections[0].name).toBe('Stormcast Eternals');
    });

    test('should perform case-insensitive search', async () => {
      const result = await collectionService.getCollections(
        { search: 'CHAOS' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(1);
      expect(result.collections[0].name).toBe('Chaos Space Marines');
    });

    test('should search across multiple fields', async () => {
      const result = await collectionService.getCollections(
        { search: 'Space' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(2);
      const names = result.collections.map(c => c.name);
      expect(names).toContain('Ultramarines Army');
      expect(names).toContain('Chaos Space Marines');
    });

    test('should return all collections when search is empty', async () => {
      const result = await collectionService.getCollections(
        { search: '' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(3);
    });
  });

  describe('Game system filtering', () => {
    test('should filter by W40K game system', async () => {
      const result = await collectionService.getCollections(
        { gameSystem: 'W40K' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(2);
      const names = result.collections.map(c => c.name);
      expect(names).toContain('Ultramarines Army');
      expect(names).toContain('Chaos Space Marines');
    });

    test('should filter by AOS game system', async () => {
      const result = await collectionService.getCollections(
        { gameSystem: 'AOS' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(1);
      expect(result.collections[0].name).toBe('Stormcast Eternals');
    });

    test('should return empty array for invalid game system', async () => {
      const result = await collectionService.getCollections(
        { gameSystem: 'INVALID' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(0);
    });
  });

  describe('Combined search and filter', () => {
    test('should combine search and game system filter', async () => {
      const result = await collectionService.getCollections(
        { search: 'Space', gameSystem: 'W40K' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(2);
      const names = result.collections.map(c => c.name);
      expect(names).toContain('Ultramarines Army');
      expect(names).toContain('Chaos Space Marines');
    });

    test('should return empty when search and filter do not match', async () => {
      const result = await collectionService.getCollections(
        { search: 'Stormcast', gameSystem: 'W40K' },
        { page: 1, limit: 10 }
      );

      expect(result.collections).toHaveLength(0);
    });
  });

  describe('Pagination', () => {
    test('should work with page 1', async () => {
      const result = await collectionService.getCollections(
        {},
        { page: 1, limit: 2 }
      );

      expect(result.collections).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    test('should work with page 2', async () => {
      const result = await collectionService.getCollections(
        {},
        { page: 2, limit: 2 }
      );

      expect(result.collections).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
    });

    test('should handle pagination with search', async () => {
      const result = await collectionService.getCollections(
        { search: 'Space' },
        { page: 1, limit: 1 }
      );

      expect(result.collections).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  describe('User collections', () => {
    test('should get user collections', async () => {
      const result = await collectionService.getUserCollections(userId);

      expect(result).toHaveLength(3);
    });

    test('should include private collections when requested', async () => {
      // Create a private collection
      await prisma.collection.create({
        data: {
          name: 'Private Collection',
          description: 'Secret collection',
          gameSystemId: gameSystemId1,
          userId: userId,
          isPublic: false,
        },
      });

      const publicResult = await collectionService.getUserCollections(userId, false);
      expect(publicResult).toHaveLength(3); // Only public collections

      const allResult = await collectionService.getUserCollections(userId, true);
      expect(allResult).toHaveLength(4); // Include private collection

      // Clean up
      await prisma.collection.deleteMany({
        where: { name: 'Private Collection' }
      });
    });
  });
});
