import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'build', 'coverage', '*.config.js', 'pnpm-lock.yaml']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      pluginImport.flatConfigs.recommended,
      pluginImport.flatConfigs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      'prefer-const': 'off',
      'import/no-unresolved': 'off',
      'no-unused-vars': 'off',
      /*       [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ], */
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/array-type': 'error',
    },
  },

  {
    files: ['apps/back/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ['apps/TEST/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // COMMENT: TEST
    files: ['apps/TEST/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {},
  },
  {
    // COMMENT: Front-End
    files: ['apps/front/**/*.{ts,tsx}', 'apps/ricemc/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  {
    files: ['packages/**/**/*.ts'],
  },
]);
