#!/usr/bin/env node

/**
 * Setup validation script
 * Verifies that the development environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Change to project root directory
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
      return { success: false, message: `❌ Node.js ${version} (requires v18+)` };
    }
  },
  {
    name: 'Package.json exists',
    check: () => {
      const exists = fs.existsSync('package.json');
      return { 
        success: exists, 
        message: exists ? '✅ package.json found' : '❌ package.json missing' 
      };
    }
  },
  {
    name: 'TypeScript configuration',
    check: () => {
      const exists = fs.existsSync('tsconfig.json');
      return { 
        success: exists, 
        message: exists ? '✅ tsconfig.json configured' : '❌ tsconfig.json missing' 
      };
    }
  },
  {
    name: 'ESLint configuration',
    check: () => {
      const exists = fs.existsSync('.eslintrc.js');
      return { 
        success: exists, 
        message: exists ? '✅ ESLint configured' : '❌ ESLint configuration missing' 
      };
    }
  },
  {
    name: 'Prettier configuration',
    check: () => {
      const exists = fs.existsSync('.prettierrc.json');
      return { 
        success: exists, 
        message: exists ? '✅ Prettier configured' : '❌ Prettier configuration missing' 
      };
    }
  },
  {
    name: 'Docker Compose',
    check: () => {
      const exists = fs.existsSync('docker-compose.yml');
      return { 
        success: exists, 
        message: exists ? '✅ Docker Compose configured' : '❌ docker-compose.yml missing' 
      };
    }
  },
  {
    name: 'Environment template',
    check: () => {
      const exists = fs.existsSync('.env.example');
      return { 
        success: exists, 
        message: exists ? '✅ Environment template exists' : '❌ .env.example missing' 
      };
    }
  },
  {
    name: 'Workspace folders',
    check: () => {
      const folders = ['backend', 'frontend', 'mobile', 'shared'];
      const missing = folders.filter(folder => 
        !fs.existsSync(folder)
      );
      
      if (missing.length === 0) {
        return { success: true, message: '✅ All workspace folders exist' };
      }
      return { 
        success: false, 
        message: `❌ Missing folders: ${missing.join(', ')}` 
      };
    }
  }
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
  console.log('2. Run "npm run docker:dev" to start services');
  console.log('3. Run "npm run dev" to start development servers');
} else {
  console.log('⚠️  Some checks failed. Please address the issues above.');
  process.exit(1);
}
