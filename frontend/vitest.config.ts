/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'e2e/**', // Exclude E2E tests
      ],
    },
    exclude: [
      'node_modules/',
      'e2e/**', // Exclude E2E tests from Vitest
    ],
  },
});
