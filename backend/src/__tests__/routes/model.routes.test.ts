/**
 * Model Routes Tests
 * Comprehensive test suite for Model API endpoints
 * Tests Issue #20 implementation - Model CRUD Routes
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

describe('Model Routes - Issue #20', () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let testUserId2: string;
  let authToken: string;
  let authToken2: string;
  let testCollectionId: string;
  let testGameSystemId: string;
  let testModelId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database in correct order (respecting foreign key constraints)
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.faction.deleteMany(); // Delete factions before gameSystem
    await prisma.gameSystem.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'modeler1@example.com',
        passwordHash: 'hashedpassword123',
        username: 'modeler1',
        firstName: 'Model',
        lastName: 'User1',
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'modeler2@example.com',
        passwordHash: 'hashedpassword123',
        username: 'modeler2',
        firstName: 'Model',
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

    // Create test collection
    const collection = await prisma.collection.create({
      data: {
        name: 'Test Model Collection',
        description: 'A collection for testing models',
        isPublic: true,
        userId: testUserId,
        gameSystemId: testGameSystemId,
        tags: ['Test', 'Models'],
      },
    });
    testCollectionId = collection.id;

    // Create test model
    const model = await prisma.model.create({
      data: {
        name: 'Test Space Marine',
        description: 'A test Space Marine model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
        userId: testUserId,
        paintingStatus: 'UNPAINTED',
        tags: ['Space Marine', 'Test'],
      },
    });
    testModelId = model.id;
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.gameSystem.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/v1/models', () => {
    it('should create a new model successfully', async () => {
      const modelData = {
        name: 'Ultramarine Captain',
        description: 'Captain of the Ultramarines Chapter',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
        paintingStatus: 'IN_PROGRESS',
        tags: ['Space Marine', 'Ultramarines', 'Captain'],
        purchasePrice: 25.99,
        notes: 'Detailed model with power sword',
      };

      const response = await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(modelData.name);
      expect(response.body.data.description).toBe(modelData.description);
      expect(response.body.data.gameSystemId).toBe(modelData.gameSystemId);
      expect(response.body.data.collectionId).toBe(modelData.collectionId);
      expect(response.body.data.paintingStatus).toBe(modelData.paintingStatus);
      expect(response.body.data.tags).toEqual(modelData.tags);
      expect(response.body.data.userId).toBe(testUserId);
    });

    it('should create model with minimal data', async () => {
      const modelData = {
        name: 'Minimal Model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
      };

      const response = await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(modelData.name);
      expect(response.body.data.paintingStatus).toBe('UNPAINTED'); // default value
    });

    it('should require authentication', async () => {
      const modelData = {
        name: 'Unauthorized Model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
      };

      await request(app).post('/api/v1/models').send(modelData).expect(401);
    });

    it('should validate required fields', async () => {
      const modelData = {
        description: 'Missing required fields',
      };

      await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(400);
    });

    it('should validate painting status enum', async () => {
      const modelData = {
        name: 'Invalid Status Model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
        paintingStatus: 'INVALID_STATUS',
      };

      await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(400);
    });

    it('should validate purchase price is positive', async () => {
      const modelData = {
        name: 'Negative Price Model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
        purchasePrice: -10.5,
      };

      await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(400);
    });

    it('should validate collection ownership', async () => {
      const modelData = {
        name: 'Unauthorized Collection Model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId, // Collection belongs to testUserId
      };

      await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken2}`) // Different user
        .send(modelData)
        .expect(403);
    });
  });

  describe('GET /api/v1/models/collection/:collectionId', () => {
    beforeEach(async () => {
      // Create additional test models
      await prisma.model.createMany({
        data: [
          {
            name: 'Model A',
            gameSystemId: testGameSystemId,
            collectionId: testCollectionId,
            userId: testUserId,
            paintingStatus: 'COMPLETED',
            tags: ['Completed', 'Test'],
          },
          {
            name: 'Model B',
            gameSystemId: testGameSystemId,
            collectionId: testCollectionId,
            userId: testUserId,
            paintingStatus: 'IN_PROGRESS',
            tags: ['InProgress', 'Test'],
          },
        ],
      });
    });

    it('should return models in collection', async () => {
      const response = await request(app)
        .get(`/api/v1/models/collection/${testCollectionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(3); // testModel + 2 additional
      expect(response.body.data.total).toBe(3);
    });

    it('should paginate models correctly', async () => {
      const response = await request(app)
        .get(`/api/v1/models/collection/${testCollectionId}?page=1&limit=2`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by painting status', async () => {
      const response = await request(app)
        .get(
          `/api/v1/models/collection/${testCollectionId}?paintingStatus=COMPLETED`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(1);
      expect(response.body.data.models[0].paintingStatus).toBe('COMPLETED');
    });

    it('should filter by search term', async () => {
      const response = await request(app)
        .get(`/api/v1/models/collection/${testCollectionId}?search=Model%20A`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(1);
      expect(response.body.data.models[0].name).toBe('Model A');
    });

    it('should sort models correctly', async () => {
      const response = await request(app)
        .get(
          `/api/v1/models/collection/${testCollectionId}?sortBy=name&sortOrder=asc`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      const names = response.body.data.models.map((m: any) => m.name);
      expect(names).toEqual([...names].sort());
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app)
        .get('/api/v1/models/collection/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/v1/models/search', () => {
    beforeEach(async () => {
      await prisma.model.create({
        data: {
          name: 'Ultramarine Sergeant',
          description: 'Veteran Space Marine Sergeant',
          gameSystemId: testGameSystemId,
          collectionId: testCollectionId,
          userId: testUserId,
          tags: ['Space Marine', 'Ultramarines', 'Sergeant'],
          paintingStatus: 'COMPLETED',
        },
      });
    });

    it('should search models by query', async () => {
      const response = await request(app)
        .get('/api/v1/models/search?q=Ultramarine')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(1);
      expect(response.body.data.models[0].name).toContain('Ultramarine');
    });

    it('should search in description', async () => {
      const response = await request(app)
        .get('/api/v1/models/search?q=Veteran')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(1);
      expect(response.body.data.models[0].description).toContain('Veteran');
    });

    it('should filter search by tags', async () => {
      const response = await request(app)
        .get('/api/v1/models/search?q=Space&tags=Sergeant')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(1);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/v1/models/search?q=test').expect(401);
    });

    it('should require search query', async () => {
      await request(app)
        .get('/api/v1/models/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/models/:id', () => {
    it('should return model by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/models/${testModelId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testModelId);
      expect(response.body.data.name).toBe('Test Space Marine');
    });

    it('should return 404 for non-existent model', async () => {
      await request(app).get('/api/v1/models/non-existent-id').expect(404);
    });

    it('should respect privacy settings', async () => {
      // Create private model in private collection
      const privateCollection = await prisma.collection.create({
        data: {
          name: 'Private Collection',
          isPublic: false,
          userId: testUserId,
          gameSystemId: testGameSystemId,
        },
      });

      const privateModel = await prisma.model.create({
        data: {
          name: 'Private Model',
          gameSystemId: testGameSystemId,
          collectionId: privateCollection.id,
          userId: testUserId,
          isPublic: false,
        },
      });

      // Owner should see it
      await request(app)
        .get(`/api/v1/models/${privateModel.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Non-owner should not see it
      await request(app)
        .get(`/api/v1/models/${privateModel.id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/models/:id', () => {
    it('should update model successfully', async () => {
      const updateData = {
        name: 'Updated Space Marine Captain',
        description: 'Updated description',
        paintingStatus: 'COMPLETED',
        tags: ['Updated', 'Completed'],
        notes: 'Updated notes',
      };

      const response = await request(app)
        .put(`/api/v1/models/${testModelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.paintingStatus).toBe(updateData.paintingStatus);
      expect(response.body.data.tags).toEqual(updateData.tags);
    });

    it('should update partial data', async () => {
      const updateData = {
        paintingStatus: 'IN_PROGRESS',
      };

      const response = await request(app)
        .put(`/api/v1/models/${testModelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintingStatus).toBe(updateData.paintingStatus);
      expect(response.body.data.name).toBe('Test Space Marine'); // Should remain unchanged
    });

    it('should require authentication', async () => {
      const updateData = { name: 'Unauthorized Update' };

      await request(app)
        .put(`/api/v1/models/${testModelId}`)
        .send(updateData)
        .expect(401);
    });

    it('should require ownership', async () => {
      const updateData = { name: 'Unauthorized Update' };

      await request(app)
        .put(`/api/v1/models/${testModelId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send(updateData)
        .expect(403);
    });

    it('should validate painting status', async () => {
      const updateData = {
        paintingStatus: 'INVALID_STATUS',
      };

      await request(app)
        .put(`/api/v1/models/${testModelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/v1/models/:id', () => {
    it('should delete model successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/models/${testModelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Model deleted successfully');

      // Verify model is deleted
      const deletedModel = await prisma.model.findUnique({
        where: { id: testModelId },
      });
      expect(deletedModel).toBeNull();
    });

    it('should require authentication', async () => {
      await request(app).delete(`/api/v1/models/${testModelId}`).expect(401);
    });

    it('should require ownership', async () => {
      await request(app)
        .delete(`/api/v1/models/${testModelId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);
    });

    it('should return 404 for non-existent model', async () => {
      await request(app)
        .delete('/api/v1/models/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/models/:id/photos', () => {
    it('should add photos to model successfully', async () => {
      const photoData = {
        photos: [
          {
            fileName: 'photo1.jpg',
            originalUrl: 'https://example.com/photo1.jpg',
            description: 'Front view',
            isPrimary: true,
          },
          {
            fileName: 'photo2.jpg',
            originalUrl: 'https://example.com/photo2.jpg',
            description: 'Back view',
            isPrimary: false,
          },
        ],
      };

      const response = await request(app)
        .post(`/api/v1/models/${testModelId}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(photoData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.photos).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const photoData = {
        photos: [
          {
            fileName: 'photo.jpg',
            originalUrl: 'https://example.com/photo.jpg',
          },
        ],
      };

      await request(app)
        .post(`/api/v1/models/${testModelId}/photos`)
        .send(photoData)
        .expect(401);
    });

    it('should require ownership', async () => {
      const photoData = {
        photos: [
          {
            fileName: 'photo.jpg',
            originalUrl: 'https://example.com/photo.jpg',
          },
        ],
      };

      await request(app)
        .post(`/api/v1/models/${testModelId}/photos`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send(photoData)
        .expect(403);
    });

    it('should validate photo URLs', async () => {
      const photoData = {
        photos: [{ fileName: 'photo.jpg', originalUrl: 'invalid-url' }],
      };

      await request(app)
        .post(`/api/v1/models/${testModelId}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(photoData)
        .expect(400);
    });

    it('should validate required fileName field', async () => {
      const photoData = {
        photos: [
          {
            originalUrl: 'https://example.com/photo.jpg',
            // fileName is missing
          },
        ],
      };

      await request(app)
        .post(`/api/v1/models/${testModelId}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(photoData)
        .expect(400);
    });
  });

  describe('PUT /api/v1/models/bulk-update', () => {
    let additionalModelIds: string[];

    beforeEach(async () => {
      // Create additional models for bulk operations
      await prisma.model.createMany({
        data: [
          {
            name: 'Bulk Model 1',
            gameSystemId: testGameSystemId,
            collectionId: testCollectionId,
            userId: testUserId,
            paintingStatus: 'UNPAINTED',
          },
          {
            name: 'Bulk Model 2',
            gameSystemId: testGameSystemId,
            collectionId: testCollectionId,
            userId: testUserId,
            paintingStatus: 'UNPAINTED',
          },
        ],
      });

      const createdModels = await prisma.model.findMany({
        where: { name: { startsWith: 'Bulk Model' } },
        select: { id: true },
      });
      additionalModelIds = createdModels.map(m => m.id);
    });

    it('should bulk update models successfully', async () => {
      const bulkData = {
        modelIds: [testModelId, ...additionalModelIds],
        updates: {
          paintingStatus: 'IN_PROGRESS',
          tags: ['Bulk Updated'],
        },
      };

      const response = await request(app)
        .put('/api/v1/models/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updated).toBe(3);
      expect(response.body.data.errors).toHaveLength(0);

      // Verify updates were applied
      const updatedModels = await prisma.model.findMany({
        where: { id: { in: bulkData.modelIds } },
      });
      expect(updatedModels.every(m => m.paintingStatus === 'IN_PROGRESS')).toBe(
        true
      );
    });

    it('should require authentication', async () => {
      const bulkData = {
        modelIds: [testModelId],
        updates: { paintingStatus: 'COMPLETED' },
      };

      await request(app)
        .put('/api/v1/models/bulk-update')
        .send(bulkData)
        .expect(401);
    });

    it('should validate model IDs array', async () => {
      const bulkData = {
        modelIds: [], // Empty array
        updates: { paintingStatus: 'COMPLETED' },
      };

      await request(app)
        .put('/api/v1/models/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);
    });

    it('should validate painting status in updates', async () => {
      const bulkData = {
        modelIds: [testModelId],
        updates: { paintingStatus: 'INVALID_STATUS' },
      };

      await request(app)
        .put('/api/v1/models/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);
    });

    it('should handle ownership validation', async () => {
      // Try to update someone else's models
      const bulkData = {
        modelIds: [testModelId], // Belongs to testUserId
        updates: { paintingStatus: 'COMPLETED' },
      };

      await request(app)
        .put('/api/v1/models/bulk-update')
        .set('Authorization', `Bearer ${authToken2}`) // Different user
        .send(bulkData)
        .expect(404); // Models not found for this user
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid model ID format', async () => {
      await request(app).get('/api/v1/models/invalid-id-format').expect(404);
    });

    it('should handle malformed JSON in request body', async () => {
      await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json"}')
        .expect(400);
    });

    it('should validate pagination parameters', async () => {
      await request(app)
        .get(`/api/v1/models/collection/${testCollectionId}?page=-1`)
        .expect(400);

      await request(app)
        .get(`/api/v1/models/collection/${testCollectionId}?limit=200`)
        .expect(400);
    });

    it('should handle very long model names', async () => {
      const longName = 'A'.repeat(300); // Exceeds 255 char limit
      const modelData = {
        name: longName,
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
      };

      await request(app)
        .post('/api/v1/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(400);
    });

    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/v1/models/search?q=%22special%22%20chars')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle concurrent model creation', async () => {
      const modelData = {
        name: 'Concurrent Model',
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
        description: 'Testing concurrent creation',
      };

      const promises = Array.from({ length: 3 }, () =>
        request(app)
          .post('/api/v1/models')
          .set('Authorization', `Bearer ${authToken}`)
          .send(modelData)
      );

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all models were created
      const models = await prisma.model.findMany({
        where: { name: 'Concurrent Model' },
      });
      expect(models).toHaveLength(3);
    });

    it('should handle large bulk update operations', async () => {
      // Create many models for bulk update
      const manyModels = Array.from({ length: 10 }, (_, i) => ({
        name: `Bulk Model ${i + 1}`,
        gameSystemId: testGameSystemId,
        collectionId: testCollectionId,
        userId: testUserId,
        paintingStatus: 'UNPAINTED' as const,
      }));

      await prisma.model.createMany({ data: manyModels });

      const allModelIds = await prisma.model.findMany({
        where: { name: { startsWith: 'Bulk Model' } },
        select: { id: true },
      });

      const bulkData = {
        modelIds: allModelIds.map(m => m.id),
        updates: { paintingStatus: 'COMPLETED' },
      };

      const response = await request(app)
        .put('/api/v1/models/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updated).toBe(10);
    });
  });
});
