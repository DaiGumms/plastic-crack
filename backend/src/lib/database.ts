import { PrismaClient } from '../generated/prisma';

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | null = null;

// Initialize Prisma Client only if DATABASE_URL is available
try {
  if (process.env.DATABASE_URL) {
    // Prevent multiple instances of Prisma Client in development
    prisma =
      globalThis.__prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
      });

    if (process.env.NODE_ENV !== 'production') {
      globalThis.__prisma = prisma;
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('⚠️ DATABASE_URL not provided, running without database');
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to initialize database:', error instanceof Error ? error.message : String(error));
  prisma = null;
}

export { prisma };

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!prisma) {
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

// Database transaction helper
export const db = prisma;
