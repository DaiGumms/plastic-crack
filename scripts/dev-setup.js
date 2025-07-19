#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * Sets up the entire development environment with a single command
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

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

function logStep(step, message) {
  log(
    `${colors.bold}[${step}]${colors.reset} ${colors.blue}${message}${colors.reset}`
  );
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

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

async function checkDockerServices() {
  logStep('1', 'Checking Docker services...');

  // Check if Docker Compose services are running
  const psResult = execCommand(
    'docker-compose ps --services --filter status=running'
  );

  if (!psResult.success || !psResult.output.trim()) {
    logWarning('Docker services not running, starting them...');

    const startResult = execCommand('docker-compose up -d');
    if (!startResult.success) {
      logError('Failed to start Docker services');
      logError(startResult.error);
      logError('Make sure Docker Desktop is running and try again');
      process.exit(1);
    }
    logSuccess('Docker services started');

    // Wait for services to be fully ready
    log('Waiting for services to initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    logSuccess('Docker services are running');
  }
}

async function installDependencies() {
  logStep('2', 'Installing dependencies...');

  // Check if node_modules exists at root
  if (!existsSync('node_modules')) {
    log('Installing root dependencies...');
    const result = execCommand('npm install');
    if (!result.success) {
      logError('Failed to install root dependencies');
      logError(result.error);
      process.exit(1);
    }
  }

  // Clean npm cache if needed and try installing workspace dependencies
  log('Installing workspace dependencies...');
  let result = execCommand('npm run install:workspaces');
  if (!result.success) {
    logWarning('First attempt failed, clearing npm cache and retrying...');
    execCommand('npm cache clean --force');

    // Try individual installations
    const workspaces = ['backend', 'frontend', 'shared'];
    for (const workspace of workspaces) {
      log(`Installing ${workspace} dependencies...`);
      const wsResult = execCommand(`cd ${workspace} && npm install`, {
        cwd: process.cwd(),
      });
      if (!wsResult.success) {
        logError(`Failed to install ${workspace} dependencies`);
        logError(wsResult.error);
        // Continue with other workspaces rather than failing completely
      } else {
        logSuccess(`${workspace} dependencies installed`);
      }
    }
  } else {
    logSuccess('All workspace dependencies installed');
  }

  logSuccess('Dependencies installation completed');
}

async function setupDatabase() {
  logStep('3', 'Setting up database...');

  // Wait for database to be ready
  log('Waiting for database connection...');
  const waitResult = execCommand('node scripts/wait-for-db.js');
  if (!waitResult.success) {
    logError('Database connection failed');
    logError(waitResult.error);
    process.exit(1);
  }

  // Generate Prisma client
  log('Generating Prisma client...');
  const generateResult = execCommand('npm run db:generate');
  if (!generateResult.success) {
    logError('Failed to generate Prisma client');
    logError(generateResult.error);
    process.exit(1);
  }

  // Run migrations
  log('Running database migrations...');
  const migrateResult = execCommand('npm run db:migrate');
  if (!migrateResult.success) {
    logWarning('Migration may have failed, but continuing...');
    log(migrateResult.output);
  }

  // Seed database
  log('Seeding database...');
  const seedResult = execCommand('npm run db:seed');
  if (!seedResult.success) {
    logWarning('Database seeding may have failed, but continuing...');
    log(seedResult.output);
  } else {
    logSuccess('Database seeded successfully');
  }

  logSuccess('Database setup complete');
}

async function startDevelopmentServers() {
  logStep('4', 'Starting development servers...');

  log('🚀 Starting backend and frontend servers...');
  log('📝 Backend will be available at: http://localhost:3001');
  log('🌐 Frontend will be available at: http://localhost:3000');
  log('');
  log('💡 Press Ctrl+C to stop all services');
  log('');

  // Use spawn to keep the process running and show output
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  // Handle process termination
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down development servers...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });

  devProcess.on('error', error => {
    logError(`Development server error: ${error.message}`);
    process.exit(1);
  });
}

async function main() {
  try {
    log(
      `${colors.bold}🎯 Plastic Crack Development Environment Setup${colors.reset}`
    );
    log('===============================================');
    log('');

    await checkDockerServices();
    await installDependencies();
    await setupDatabase();
    await startDevelopmentServers();
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main();
