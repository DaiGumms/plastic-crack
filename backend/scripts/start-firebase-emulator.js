#!/usr/bin/env node

/**
 * Simple Firebase Storage Emulator Starter
 * This script starts the Firebase Storage emulator without requiring authentication
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔥 Starting Firebase Storage Emulator...');

// Start Firebase emulator with demo project
const emulator = spawn('firebase', [
  'emulators:start',
  '--only', 'storage',
  '--project', 'demo-plastic-crack'
], {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    FIREBASE_EMULATOR_HUB: 'localhost:4400',
    GCLOUD_PROJECT: 'demo-plastic-crack'
  }
});

emulator.on('close', (code) => {
  console.log(`Firebase emulator exited with code ${code}`);
});

emulator.on('error', (error) => {
  console.error('Failed to start Firebase emulator:', error);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🔥 Stopping Firebase Storage Emulator...');
  emulator.kill('SIGINT');
});
