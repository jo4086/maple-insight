import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import pluginReact from 'eslint-plugin-react';
import pluginImport from 'eslint-plugin-import';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      import: pluginImport,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          // alwaysTryTypes: true,
          // project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
        },
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // pluginReact.configs.recommended,
  // pluginImport.configs.recommended,
  // pluginImport.configs.typescript,

  {
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/', '*.config.js', 'pnpm-lock.yaml'],
  },
  {
    files: ['apps/back/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {},
  },

  {
    files: ['apps/front-end/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    extends: [],
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      ...reactRefresh.configs.vite.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['apps/front/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    extends: [],
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      ...reactRefresh.configs.vite.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['packages/**/*.ts'],
    rules: {},
  },

  {
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      'no-console': 'warn',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
);
