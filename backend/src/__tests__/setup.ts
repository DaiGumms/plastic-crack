// Test setup file
import dotenv from 'dotenv';
import { prisma } from '../lib/database';

// Load test environment variables first
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for tests

// Global test timeout
jest.setTimeout(15000);

// Global setup and teardown for database isolation
beforeEach(async () => {
  // Clean up database before each test to ensure isolation
  // But preserve data for tests that rely on beforeAll setup
  await cleanupDatabaseBetweenTests();
});

afterAll(async () => {
  // Final cleanup and close database connection
  await cleanupDatabase();
  await prisma.$disconnect();
});

async function cleanupDatabaseBetweenTests() {
  try {
    // Clean up tables in dependency order
    await prisma.userModelTag.deleteMany({});
    await prisma.userModelPhoto.deleteMany({});
    await prisma.userModelLike.deleteMany({});
    await prisma.model.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.userRelationship.deleteMany({});
    await prisma.tag.deleteMany({});

    // Only clean up specific temporary test users, not main test users
    await prisma.user.deleteMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: 'temporary' } },
              { email: { contains: 'duplicate' } },
              { username: { contains: 'duplicate' } },
              { username: { contains: 'temp' } },
            ],
          },
          // Don't delete users with specific test emails that might be in use
          {
            NOT: {
              OR: [
                { email: { contains: 'profile-user' } },
                { email: { contains: 'auth-test' } },
                { email: { endsWith: '@plastic-crack-test.com' } },
              ],
            },
          },
        ],
      },
    });
  } catch (error) {
    // Ignore cleanup errors during tests
    if (process.env.NODE_ENV !== 'test') {
      console.error('Database cleanup error:', error);
    }
  }
}

async function cleanupDatabase() {
  try {
    // Delete all test data in correct order to respect foreign key constraints
    await prisma.userModelTag.deleteMany({});
    await prisma.userModelPhoto.deleteMany({});
    await prisma.userModelLike.deleteMany({});
    await prisma.model.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.userRelationship.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'example.com' } },
          { email: { contains: 'plastic-crack-test.com' } },
          { username: { contains: 'test' } },
          { username: { contains: 'user' } },
          { username: { contains: 'auth' } },
          { username: { contains: 'profile' } },
          { username: { contains: 'delete' } },
        ],
      },
    });
  } catch (error) {
    // Ignore cleanup errors during tests
    if (process.env.NODE_ENV !== 'test') {
      console.error('Database cleanup error:', error);
    }
  }
}
