#!/usr/bin/env node

/**
 * Intelligent Database Seeding Script
 * Handles seeding based on existing data and user preferences
 */

import { PrismaClient } from '../backend/src/generated/prisma/index.js';
import { execSync } from 'child_process';
import readline from 'readline';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function checkDatabaseData() {
  const prisma = new PrismaClient();

  try {
    const [
      userCount,
      gameSystemCount,
      factionCount,
      modelCount,
      collectionCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.gameSystem.count(),
      prisma.faction.count(),
      prisma.model.count(),
      prisma.collection.count(),
    ]);

    return {
      users: userCount,
      gameSystems: gameSystemCount,
      factions: factionCount,
      models: modelCount,
      collections: collectionCount,
      hasData:
        userCount > 0 ||
        gameSystemCount > 0 ||
        factionCount > 0 ||
        modelCount > 0 ||
        collectionCount > 0,
    };
  } catch (error) {
    logError(`Failed to check database: ${error.message}`);
    return { hasData: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function executeSeed() {
  try {
    log('🌱 Running database seed...');
    execSync('npm run db:seed', {
      stdio: 'inherit',
      cwd: './backend',
    });
    logSuccess('Database seeded successfully');
    return true;
  } catch (error) {
    logError(`Seeding failed: ${error.message}`);
    return false;
  }
}

async function executeReset() {
  try {
    log('🗑️  Resetting database...');
    execSync('npm run db:reset -- --force', {
      stdio: 'inherit',
      cwd: './backend',
    });
    logSuccess('Database reset successfully');
    return true;
  } catch (error) {
    logError(`Database reset failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log(`${colors.bold}🗄️  Intelligent Database Seeding${colors.reset}`);
  log('=====================================');

  // Check for command line arguments
  const args = process.argv.slice(2);
  const isAutomated = args.includes('--automated');
  const forceReset = args.includes('--force-reset');
  const skipSeed = args.includes('--skip-seed');
  const addToExisting = args.includes('--add-to-existing');

  if (skipSeed) {
    logInfo('Skipping database seeding due to --skip-seed flag');
    return;
  }

  // Check current database state
  log('🔍 Checking current database state...');
  const dbData = await checkDatabaseData();

  if (dbData.error) {
    logError('Cannot proceed due to database connection error');
    process.exit(1);
  }

  if (!dbData.hasData) {
    logInfo('Database is empty, proceeding with initial seeding');
    const success = await executeSeed();
    if (!success) {
      process.exit(1);
    }
    return;
  }

  // Database has existing data
  log('📊 Current database contents:');
  log(`   Users: ${dbData.users}`);
  log(`   Game Systems: ${dbData.gameSystems}`);
  log(`   Factions: ${dbData.factions}`);
  log(`   Models: ${dbData.models}`);
  log(`   Collections: ${dbData.collections}`);
  log('');

  let choice;

  if (forceReset) {
    choice = '2';
    logInfo('Force reset requested via --force-reset flag');
  } else if (addToExisting) {
    choice = '3';
    logInfo('Add to existing data requested via --add-to-existing flag');
  } else if (isAutomated) {
    choice = '1';
    logInfo('Automated mode: skipping seeding to preserve existing data');
  } else {
    // Interactive mode
    logWarning('Database contains existing data. Choose an option:');
    log('1. Skip seeding (recommended - keeps existing data intact)');
    log('2. Reset database and reseed (⚠️  DESTROYS ALL EXISTING DATA)');
    log('3. Add seed data to existing database (may create duplicates)');
    log('');

    choice = await askQuestion('Enter your choice (1-3): ');
  }

  switch (choice.trim()) {
    case '1':
      logSuccess('Skipping database seeding - existing data preserved');
      break;

    case '2':
      logWarning('⚠️  This will DESTROY ALL existing data!');
      if (!isAutomated && !forceReset) {
        const confirm = await askQuestion(
          'Are you sure? Type "yes" to confirm: '
        );
        if (confirm.toLowerCase() !== 'yes') {
          logInfo('Operation cancelled');
          return;
        }
      }

      const resetSuccess = await executeReset();
      if (resetSuccess) {
        logSuccess('Database reset complete. Fresh data has been seeded.');
      } else {
        process.exit(1);
      }
      break;

    case '3':
      logWarning(
        'Adding seed data to existing database (may create duplicates)'
      );
      const seedSuccess = await executeSeed();
      if (seedSuccess) {
        logSuccess('Seed data added to existing database');
      } else {
        process.exit(1);
      }
      break;

    default:
      logError('Invalid choice. Exiting.');
      process.exit(1);
  }
}

main().catch(error => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
});
