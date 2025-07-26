#!/usr/bin/env node

/**
 * Database Status Checker
 * Quick utility to check current database contents
 */

import { PrismaClient } from '../backend/src/generated/prisma/index.js';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  const prisma = new PrismaClient();

  try {
    log(`${colors.bold}📊 Database Status${colors.reset}`);
    log('===================');

    const [
      userCount,
      gameSystemCount,
      factionCount,
      modelCount,
      collectionCount,
      userModelCount,
      tagCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.gameSystem.count(),
      prisma.faction.count(),
      prisma.model.count(),
      prisma.collection.count(),
      prisma.userModel.count(),
      prisma.tag.count(),
    ]);

    const hasData =
      userCount > 0 ||
      gameSystemCount > 0 ||
      factionCount > 0 ||
      modelCount > 0 ||
      collectionCount > 0;

    log(`Users:          ${userCount}`, colors.blue);
    log(`Game Systems:   ${gameSystemCount}`, colors.blue);
    log(`Factions:       ${factionCount}`, colors.blue);
    log(`Master Models:  ${modelCount}`, colors.blue);
    log(`Collections:    ${collectionCount}`, colors.blue);
    log(`User Models:    ${userModelCount}`, colors.blue);
    log(`Tags:           ${tagCount}`, colors.blue);
    log('');

    if (hasData) {
      log('✅ Database contains data', colors.green);

      // Show recent activity
      const recentCollections = await prisma.collection.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          createdAt: true,
          user: {
            select: { username: true },
          },
        },
      });

      if (recentCollections.length > 0) {
        log('\n📚 Recent Collections:', colors.bold);
        recentCollections.forEach(collection => {
          log(
            `   "${collection.name}" by ${collection.user.username} (${collection.createdAt.toLocaleDateString()})`
          );
        });
      }
    } else {
      log('📭 Database is empty', colors.yellow);
      log('   Run "npm run db:seed" to add test data');
    }
  } catch (error) {
    log(`❌ Error checking database: ${error.message}`, '\x1b[31m');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
