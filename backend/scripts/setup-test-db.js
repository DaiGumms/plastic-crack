#!/usr/bin/env node
/**
 * Test database setup script
 * Creates and migrates the test database using Prisma
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

async function setupTestDatabase() {
  console.log('Setting up test database...');

  try {
    // Create and deploy migrations on test database
    console.log('Creating test database and running migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
    console.log('✅ Test database migrations completed');

    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✅ Prisma client generated');

    console.log('🎉 Test database setup completed successfully!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error.message);
    console.log('Note: You may need to manually create the database first.');
    console.log(`Run: createdb plastic_crack_ci`);
    process.exit(1);
  }
}

setupTestDatabase();
