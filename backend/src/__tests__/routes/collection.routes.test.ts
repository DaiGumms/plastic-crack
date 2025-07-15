/**
 * Collection Routes Tests
 * Comprehensive test suite for Collection API endpoints
 * Tests Issue #19 implementation - Collection CRUD Routes
 */

import {
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
} from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '../../generated/prisma';
import { app } from '../../app';
import jwt from 'jsonwebtoken';

describe('Collection Routes - Issue #19', () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let testUserId2: string;
  let authToken: string;
  let authToken2: string;
  let testCollectionId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'collector1@example.com',
        passwordHash: 'hashedpassword123',
        username: 'collector1',
        firstName: 'Collection',
        lastName: 'User1',
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'collector2@example.com',
        passwordHash: 'hashedpassword123',
        username: 'collector2',
        firstName: 'Collection',
        lastName: 'User2',
      },
    });
    testUserId2 = user2.id;

    // Create auth tokens
    authToken = jwt.sign(
      {
        userId: testUserId,
        email: user1.email,
        username: user1.username,
        role: user1.role,
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    authToken2 = jwt.sign(
      {
        userId: testUserId2,
        email: user2.email,
        username: user2.username,
        role: user2.role,
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create a test collection
    const testCollection = await prisma.collection.create({
      data: {
        name: 'Test Collection',
        description: 'A test collection for testing',
        isPublic: true,
        userId: testUserId,
        tags: ['Test', 'Collection'],
      },
    });
    testCollectionId = testCollection.id;
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/v1/collections', () => {
    it('should create a new collection successfully', async () => {
      const collectionData = {
        name: 'Space Marines Collection',
        description: 'My awesome Space Marines',
        isPublic: true,
        tags: ['Warhammer 40k', 'Space Marines'],
      };

      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(collectionData.name);
      expect(response.body.data.description).toBe(collectionData.description);
      expect(response.body.data.isPublic).toBe(collectionData.isPublic);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.tags).toEqual(collectionData.tags);
    });

    it('should create collection with minimal data', async () => {
      const collectionData = {
        name: 'Minimal Collection',
      };

      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(collectionData.name);
      expect(response.body.data.isPublic).toBe(true); // default value
    });

    it('should require authentication', async () => {
      const collectionData = {
        name: 'Unauthorized Collection',
      };

      await request(app)
        .post('/api/v1/collections')
        .send(collectionData)
        .expect(401);
    });

    it('should validate collection name', async () => {
      const collectionData = {
        name: '', // Invalid empty name
      };

      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);
    });

    it('should validate tags array', async () => {
      const collectionData = {
        name: 'Test Collection',
        tags: 'not-an-array', // Invalid tags format
      };

      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);
    });

    it('should limit number of tags', async () => {
      const collectionData = {
        name: 'Collection with Many Tags',
        tags: Array.from({ length: 25 }, (_, i) => `Tag${i + 1}`), // Too many tags
      };

      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);
    });
  });

  describe('GET /api/v1/collections', () => {
    beforeEach(async () => {
      // Create additional test collections
      await prisma.collection.createMany({
        data: [
          {
            name: 'Public Collection A',
            description: 'First public collection',
            isPublic: true,
            userId: testUserId,
            tags: ['Public', 'Test'],
          },
          {
            name: 'Private Collection B',
            description: 'Private collection',
            isPublic: false,
            userId: testUserId,
            tags: ['Private', 'Secret'],
          },
          {
            name: 'Public Collection C',
            description: 'Another public collection',
            isPublic: true,
            userId: testUserId2,
            tags: ['Public', 'User2'],
          },
        ],
      });
    });

    it('should return all public collections', async () => {
      const response = await request(app)
        .get('/api/v1/collections')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(3); // 2 public collections + testCollection
      expect(response.body.data.collections.every((c: any) => c.isPublic)).toBe(
        true
      );
      expect(response.body.data.total).toBe(3);
    });

    it('should paginate collections correctly', async () => {
      const response = await request(app)
        .get('/api/v1/collections?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by search term', async () => {
      const response = await request(app)
        .get('/api/v1/collections?search=Collection%20A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(1);
      expect(response.body.data.collections[0].name).toBe(
        'Public Collection A'
      );
    });

    it('should filter by user ID', async () => {
      const response = await request(app)
        .get(`/api/v1/collections?userId=${testUserId2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(1);
      expect(response.body.data.collections[0].userId).toBe(testUserId2);
    });

    it('should sort collections correctly', async () => {
      const response = await request(app)
        .get('/api/v1/collections?sortBy=name&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const names = response.body.data.collections.map((c: any) => c.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('GET /api/v1/collections/search', () => {
    beforeEach(async () => {
      await prisma.collection.create({
        data: {
          name: 'Ultramarines Space Marines',
          description: 'Blue Space Marines from Ultramar',
          isPublic: true,
          userId: testUserId,
          tags: ['Space Marines', 'Ultramarines', 'Blue'],
        },
      });
    });

    it('should search collections by query', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search?q=Ultramarines')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(1);
      expect(response.body.data.collections[0].name).toContain('Ultramarines');
    });

    it('should search in description', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search?q=Blue')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(1);
      expect(response.body.data.collections[0].description).toContain('Blue');
    });

    it('should filter search by tags', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search?q=Space&tags=Ultramarines')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collections).toHaveLength(1);
    });

    it('should require search query', async () => {
      await request(app).get('/api/v1/collections/search').expect(400);
    });
  });

  describe('GET /api/v1/collections/my', () => {
    beforeEach(async () => {
      await prisma.collection.create({
        data: {
          name: 'My Private Collection',
          description: 'A private collection',
          isPublic: false,
          userId: testUserId,
        },
      });
    });

    it('should return all user collections including private', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // testCollection + private collection
      expect(response.body.data.some((c: any) => !c.isPublic)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/v1/collections/my').expect(401);
    });
  });

  describe('GET /api/v1/collections/:id', () => {
    it('should return public collection for any user', async () => {
      const response = await request(app)
        .get(`/api/v1/collections/${testCollectionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCollectionId);
      expect(response.body.data.name).toBe('Test Collection');
    });

    it('should return private collection for owner', async () => {
      // Create private collection
      const privateCollection = await prisma.collection.create({
        data: {
          name: 'Private Collection',
          isPublic: false,
          userId: testUserId,
        },
      });

      const response = await request(app)
        .get(`/api/v1/collections/${privateCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(privateCollection.id);
    });

    it('should not return private collection for non-owner', async () => {
      // Create private collection
      const privateCollection = await prisma.collection.create({
        data: {
          name: 'Private Collection',
          isPublic: false,
          userId: testUserId,
        },
      });

      await request(app)
        .get(`/api/v1/collections/${privateCollection.id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(404);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app).get('/api/v1/collections/non-existent-id').expect(404);
    });
  });

  describe('PUT /api/v1/collections/:id', () => {
    it('should update collection successfully', async () => {
      const updateData = {
        name: 'Updated Collection Name',
        description: 'Updated description',
        isPublic: false,
        tags: ['Updated', 'Tags'],
      };

      const response = await request(app)
        .put(`/api/v1/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.isPublic).toBe(updateData.isPublic);
      expect(response.body.data.tags).toEqual(updateData.tags);
    });

    it('should update partial data', async () => {
      const updateData = {
        name: 'Partially Updated Name',
      };

      const response = await request(app)
        .put(`/api/v1/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(
        'A test collection for testing'
      ); // Should remain unchanged
    });

    it('should require authentication', async () => {
      const updateData = { name: 'Unauthorized Update' };

      await request(app)
        .put(`/api/v1/collections/${testCollectionId}`)
        .send(updateData)
        .expect(401);
    });

    it('should require ownership', async () => {
      const updateData = { name: 'Unauthorized Update' };

      await request(app)
        .put(`/api/v1/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send(updateData)
        .expect(403);
    });

    it('should validate update data', async () => {
      const updateData = {
        name: '', // Invalid empty name
      };

      await request(app)
        .put(`/api/v1/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/v1/collections/:id', () => {
    it('should delete collection successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Collection deleted successfully');

      // Verify collection is deleted
      const deletedCollection = await prisma.collection.findUnique({
        where: { id: testCollectionId },
      });
      expect(deletedCollection).toBeNull();
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/v1/collections/${testCollectionId}`)
        .expect(401);
    });

    it('should require ownership', async () => {
      await request(app)
        .delete(`/api/v1/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app)
        .delete('/api/v1/collections/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid collection ID format', async () => {
      await request(app)
        .get('/api/v1/collections/invalid-id-format')
        .expect(404);
    });

    it('should handle malformed JSON in request body', async () => {
      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json"}')
        .expect(400);
    });

    it('should validate pagination parameters', async () => {
      await request(app).get('/api/v1/collections?page=-1').expect(400);

      await request(app).get('/api/v1/collections?limit=200').expect(400);
    });

    it('should handle very long collection names', async () => {
      const longName = 'A'.repeat(300); // Exceeds 255 char limit
      const collectionData = { name: longName };

      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);
    });

    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search?q=%22special%22%20chars')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle concurrent collection creation', async () => {
      const collectionData = {
        name: 'Concurrent Collection',
        description: 'Testing concurrent creation',
      };

      const promises = Array.from({ length: 3 }, () =>
        request(app)
          .post('/api/v1/collections')
          .set('Authorization', `Bearer ${authToken}`)
          .send(collectionData)
      );

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all collections were created
      const collections = await prisma.collection.findMany({
        where: { name: 'Concurrent Collection' },
      });
      expect(collections).toHaveLength(3);
    });
  });
});
