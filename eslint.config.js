// INFO: --COMMON--
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';

// INFO: --REACT--
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // COMMENT: global settings
  js.configs.recommended,
  tseslint.configs.recommended,
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
    plugins: {},
    settings: {
      react: {
        version: 'detect',
      },
      typescript: {
        alwaysTryTypes: true,
      },
      'import/resolver': {
        node: {
          paths: ['src'],
        },
      },
    },
    /* COMMENT: ESLint Flat Config
     * - `extends` = must be array of plain objects (not strings, not spreads)
     * - `rules`   = single plain object (spread allowed)
     */
    extends: [pluginImport.flatConfigs.recommended, pluginImport.flatConfigs.typescript],
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      'import/no-unresolved': 'off',
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
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // COMMENT: Ignore Files
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/', '*.config.js', 'pnpm-lock.yaml'],
  },
  {
    // COMMENT: Back-End
    files: ['apps/back/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {},
  },
  {
    // COMMENT: Front-End
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
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/array-type': 'error',
    },
    plugins: {
      react: pluginReact,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
  },

  {
    // COMMENT: Package
    files: ['packages/**/**/*.ts'],
    rules: {},
  },
);
