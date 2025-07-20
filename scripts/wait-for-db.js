#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;

/**
 * Wait for database to be ready
 * Supports both PostgreSQL (default) and MySQL
 */
async function waitForDatabase() {
  const maxRetries = 30;
  const retryDelay = 2000; // 2 seconds

  // Database configuration from environment or defaults
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'plastic_crack',
  };

  console.log('🔌 Waiting for database connection...');
  console.log(
    `📍 Connecting to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Try PostgreSQL connection
      const client = new Client(dbConfig);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();

      console.log('✅ Database is ready!');
      return;
    } catch (error) {
      console.log(
        `⏳ Attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );

      if (attempt === maxRetries) {
        console.error('❌ Database connection failed after maximum retries');
        console.error(
          '🔍 Make sure Docker services are running with: npm run docker:up'
        );
        process.exit(1);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

waitForDatabase().catch(error => {
  console.error('❌ Database connection error:', error);
  process.exit(1);
});
