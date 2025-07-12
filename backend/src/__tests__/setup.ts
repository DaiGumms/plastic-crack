// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for tests

// Global test timeout
jest.setTimeout(10000);
