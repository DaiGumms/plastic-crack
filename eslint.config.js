import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/__tests__/**/*', '**/generated/**/*'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // General
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/__tests__/**/*'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./*/tsconfig.test.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.config.{ts,js}', '**/vite.config.{ts,js}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      '**/generated/**/*',
      '**/prisma/generated/**/*',
      'backend/src/generated/**/*',
    ],
  },
  prettier,
];
