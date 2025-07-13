#!/usr/bin/env node

/**
 * Setup validation script
 * Verifies that the development environment is properly configured
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
process.chdir(projectRoot);

console.log('🔍 Validating Plastic Crack development environment...\n');

const checks = [
  {
    name: 'Node.js version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      if (major >= 18) {
        return { success: true, message: `✅ Node.js ${version}` };
      }
      return {
        success: false,
        message: `❌ Node.js ${version} (requires v18+)`,
      };
    },
  },
  {
    name: 'Root package.json',
    check: () => {
      const exists = fs.existsSync('package.json');
      return {
        success: exists,
        message: exists ? '✅ Root package.json found' : '❌ Root package.json missing',
      };
    },
  },
  {
    name: 'Workspace configuration',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasWorkspaces = pkg.workspaces && Array.isArray(pkg.workspaces);
        return {
          success: hasWorkspaces,
          message: hasWorkspaces 
            ? '✅ NPM workspaces configured' 
            : '❌ NPM workspaces not configured',
        };
      } catch (error) {
        return { success: false, message: '❌ Failed to read package.json' };
      }
    },
  },
  {
    name: 'TypeScript configuration',
    check: () => {
      const folders = ['backend', 'frontend', 'mobile', 'shared'];  
      const missingConfigs = folders.filter(folder => !fs.existsSync(path.join(folder, 'tsconfig.json')));  

      if (missingConfigs.length === 0) {  
        return { success: true, message: '✅ All workspace tsconfig.json files are configured' };  
      }  
      return {  
        success: false,  
        message: `❌ Missing tsconfig.json in: ${missingConfigs.join(', ')}`, 
      };
    },
  },
  {
    name: 'ESLint configuration',
    check: () => {
      const exists = fs.existsSync('eslint.config.js');
      return {
        success: exists,
        message: exists
          ? '✅ ESLint configured'
          : '❌ ESLint configuration missing',
      };
    },
  },
  {
    name: 'Prettier configuration',
    check: () => {
      const exists = fs.existsSync('.prettierrc.json');
      return {
        success: exists,
        message: exists
          ? '✅ Prettier configured'
          : '❌ Prettier configuration missing',
      };
    },
  },
  {
    name: 'Docker Compose',
    check: () => {
      const exists = fs.existsSync('docker-compose.yml');
      return {
        success: exists,
        message: exists
          ? '✅ Docker Compose configured'
          : '❌ docker-compose.yml missing',
      };
    },
  },
  {
    name: 'Environment template',
    check: () => {
      const exists = fs.existsSync('.env.example');
      return {
        success: exists,
        message: exists
          ? '✅ Environment template exists'
          : '❌ .env.example missing',
      };
    },
  },
  {
    name: 'Workspace folders',
    check: () => {
      const folders = ['backend', 'frontend', 'mobile', 'shared'];
      const missing = folders.filter(folder => !fs.existsSync(folder));

      if (missing.length === 0) {
        return { success: true, message: '✅ All workspace folders exist' };
      }
      return {
        success: false,
        message: `❌ Missing folders: ${missing.join(', ')}`,
      };
    },
  },
  {
    name: 'Workspace package.json files',
    check: () => {
      const workspaces = ['backend', 'frontend', 'mobile', 'shared'];
      const missing = workspaces.filter(ws => !fs.existsSync(path.join(ws, 'package.json')));

      if (missing.length === 0) {
        return { success: true, message: '✅ All workspace package.json files exist' };
      }
      return {
        success: false,
        message: `❌ Missing package.json in: ${missing.join(', ')}`,
      };
    },
  },
  {
    name: 'Backend workspace configuration',
    check: () => {
      const checks = [
        { file: 'backend/tsconfig.json', name: 'TypeScript config' },
        { file: 'backend/prisma/schema.prisma', name: 'Prisma schema' },
        { file: 'backend/src/app.ts', name: 'Express app' },
        { file: 'backend/src/index.ts', name: 'Server entry point' },
      ];

      const missing = checks.filter(check => !fs.existsSync(check.file));

      if (missing.length === 0) {
        return { success: true, message: '✅ Backend workspace properly configured' };
      }
      return {
        success: false,
        message: `❌ Backend missing: ${missing.map(m => m.name).join(', ')}`,
      };
    },
  },
  {
    name: 'Frontend workspace configuration',
    check: () => {
      const checks = [
        { file: 'frontend/tsconfig.json', name: 'TypeScript config' },
        { file: 'frontend/vite.config.ts', name: 'Vite config' },
        { file: 'frontend/src/main.tsx', name: 'React entry point' },
        { file: 'frontend/src/App.tsx', name: 'React app component' },
      ];

      const missing = checks.filter(check => !fs.existsSync(check.file));

      if (missing.length === 0) {
        return { success: true, message: '✅ Frontend workspace properly configured' };
      }
      return {
        success: false,
        message: `❌ Frontend missing: ${missing.map(m => m.name).join(', ')}`,
      };
    },
  },
  {
    name: 'Mobile workspace configuration',
    check: () => {
      const checks = [
        { file: 'mobile/tsconfig.json', name: 'TypeScript config' },
        { file: 'mobile/app.json', name: 'Expo config' },
        { file: 'mobile/App.tsx', name: 'App component' },
      ];

      const missing = checks.filter(check => !fs.existsSync(check.file));

      if (missing.length === 0) {
        return { success: true, message: '✅ Mobile workspace properly configured' };
      }
      return {
        success: false,
        message: `❌ Mobile missing: ${missing.map(m => m.name).join(', ')}`,
      };
    },
  },
  {
    name: 'Dependencies installation',
    check: () => {
      const nodeModulesExists = fs.existsSync('node_modules');
      const lockFileExists = fs.existsSync('package-lock.json');

      if (nodeModulesExists && lockFileExists) {
        return { success: true, message: '✅ Dependencies installed' };
      }
      return {
        success: false,
        message: '❌ Dependencies not installed (run npm install)',
      };
    },
  },
  {
    name: 'Git repository',
    check: () => {
      const gitExists = fs.existsSync('.git');
      return {
        success: gitExists,
        message: gitExists ? '✅ Git repository initialized' : '❌ Not a git repository',
      };
    },
  },
  {
    name: 'GitHub Actions CI',
    check: () => {
      const ciExists = fs.existsSync('.github/workflows/ci.yml');
      return {
        success: ciExists,
        message: ciExists ? '✅ GitHub Actions CI configured' : '❌ CI workflow missing',
      };
    },
  },
];

let allPassed = true;

checks.forEach(({ name, check }) => {
  try {
    const result = check();
    console.log(`${result.message}`);
    if (!result.success) {
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Development environment is ready.');
  console.log('\nNext steps:');
  console.log('1. Copy .env.example to .env and configure your environment');
  console.log('2. Install dependencies: npm install');
  console.log('3. Start database services: npm run docker:dev');
  console.log('4. Set up database: npm run db:setup');
  console.log('5. Run tests: npm run test');
  console.log('6. Start development servers: npm run dev');
  console.log('\nAvailable scripts:');
  console.log('- npm run lint          # Run linting across all workspaces');
  console.log('- npm run build         # Build all workspaces');
  console.log('- npm run type-check    # TypeScript type checking');
  console.log('- npm run test          # Run test suites');
} else {
  console.log('⚠️  Some checks failed. Please address the issues above.');
  console.log('\nCommon fixes:');
  console.log('- Run "npm install" to install dependencies');
  console.log('- Ensure all workspace folders have proper package.json files');
  console.log('- Check that all required configuration files exist');
  process.exit(1);
}
