1. 기본 구조 확인:
   현재 eslint.config.js 파일에 다음 내용이 있는지 확인해주세요.

```js
// /home/rice/projects/maple_repo/eslint.config.js

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals'; // globals 패키지 임포트

// React 및 Import 관련 플러그인 임포트 (아직 설치 안 했으면 에러
날 수 있음)
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import pluginImport from 'eslint-plugin-import';


export default tseslint.config(
  // 1. ESLint의 기본 권장 규칙
  js.configs.recommended,

  // 2. TypeScript ESLint의 권장 규칙
  ...tseslint.configs.recommended,

  // 여기에 기존 .eslintrc.cjs의 설정들을 하나씩 옮겨올 예정입니다.
  {
    // 이 객체 안에 parser, parserOptions, plugins, settings,
  rules, ignores 등을 넣을 겁니다.
  }
);
```

2. `parser`와 `parserOptions` 옮기기:

기존 .eslintrc.cjs에서 parser와 parserOptions는 다음과 같았습니다.

```cjs
// .eslintrc.cjs
  parser: "@typescript-eslint/parser",
  perserOption: { // 오타: parserOptions
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
```

이것을 eslint.config.js의 {} 객체 안으로 languageOptions 속성 아래에 옮깁니다.

```js
// /home/rice/projects/maple_repo/eslint.config.js (수정 부분)

export default tseslint.config(
  // ... (기존 내용) ...
  {
    languageOptions: {
      parser: tseslint.parser, // @typescript-eslint/parser 대신 tseslint.parser 사용
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
);
```

3. `plugins` 옮기기:

기존 .eslintrc.cjs에서 plugins는 다음과 같았습니다.

```cjs
// .eslintrc.cjs
plugins: ["@typescript-eslint", "react", "import"],
```

Flat Config에서는 plugins 속성 아래에 임포트한 플러그인 객체를 직접
할당합니다.

```js
// /home/rice/projects/maple_repo/eslint.config.js (수정 부분)

export default tseslint.config(
  // ... (기존 내용) ...
  {
    languageOptions: {
      // ...
    },
    plugins: {
      // @typescript-eslint는 tseslint 임포트 시 자동으로 플러그인으로 등록됩니다.
      react: pluginReact,
      import: pluginImport,
      'react-hooks': reactHooks, // 임포트한 변수 이름 그대로 사용
      'react-refresh': reactRefresh, // 임포트한 변수 이름 그대로 사용
    },
  },
);
```

4. `settings` 옮기기:

기존 .eslintrc.cjs에서 settings는 다음과 같았습니다.

```cjs
// .eslintrc.cjs
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {}, //tsconfig.json 경로/alias 인식
    },
  },
```

이것을 eslint.config.js의 {} 객체 안으로 settings 속성 아래에 옮깁니다.

```js
// /home/rice/projects/maple_repo/eslint.config.js (수정 부분)

export default tseslint.config(
  // ... (기존 내용) ...
  {
    languageOptions: {
      // ...
    },
    plugins: {
      // ...
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {}, // tsconfig.json 경로/alias 인식
      },
    },
  },
);
```

5. `extends` 옮기기:

기존 .eslintrc.cjs에서 extends는 다음과 같았습니다.

```cjs
// .eslintrc.cjs
  extends: [
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:import/recommended", // 중복
    "plugin:import/typescript",
    "prettier",
  ],
```

Flat Config에서는 extends를 배열 내의 각 설정 객체에 직접 적용합니다.
plugin:@typescript-eslint/recommended는 이미 ...tseslint.configs.recommended로
처리되었고, plugin:import/recommended는 중복이 있었으니 정리합니다. prettier는
나중에 별도로 처리합니다.

```js
// /home/rice/projects/maple_repo/eslint.config.js (수정 부분)

export default tseslint.config(
  // ... (기존 내용) ...
  {
    languageOptions: {
      // ...
    },
    plugins: {
      // ...
    },
    settings: {
      // ...
    },
    // extends는 이 설정 객체에 추가됩니다.
    extends: [
      pluginImport.configs.recommended, // "plugin:import/recommended"
      pluginImport.configs.typescript, // "plugin:import/typescript"
      pluginReact.configs.recommended, // "plugin:react/recommended"
      // prettier는 나중에 별도로 처리
    ],
  },
);
```

6. `rules` 옮기기:

기존 .eslintrc.cjs에서 rules는 다음과 같았습니다.

```cjs
// .eslintrc.cjs
  rules: {
    // 공통 룰 정의
    "no-console": "warn",
    "no-unsed-vars": [ // 오타: no-unused-vars
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "react/react-in-jsx-scope": "off", // React 17+ 일 경우 필요 없음
    "react/prop-types": "off", // TS 쓰는 경우 필요 없음
  },
```

이것을 eslint.config.js의 {} 객체 안으로 rules 속성 아래에 옮깁니다.
no-unsed-vars 오타도 수정합니다.

```js
// /home/rice/projects/maple_repo/eslint.config.js (수정 부분)

export default tseslint.config(
  // ... (기존 내용) ...
  {
    languageOptions: {
      // ...
    },
    plugins: {
      // ...
    },
    settings: {
      // ...
    },
    extends: [
      // ...
    ],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': [
        // 오타 수정
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // React 관련 규칙은 프론트엔드 전용 설정으로 옮기는 것이 좋습니다.
      // "react/react-in-jsx-scope": "off",
      // "react/prop-types": "off",
    },
  },
);
```

7. `ignorePatterns` 옮기기:

기존 .eslintrc.cjs에서 ignorePatterns는 다음과 같았습니다.

```cjs
// .eslintrc.cjs
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    "*.config.js",
  ],
```

Flat Config에서는 ignores 속성을 사용합니다.

```js
// /home/rice/projects/maple_repo/eslint.config.js (수정 부분)

export default tseslint.config(
  // ... (기존 내용) ...
  {
    languageOptions: {
      // ...
    },
    plugins: {
      // ...
    },
    settings: {
      // ...
    },
    extends: [
      // ...
    ],
    rules: {
      // ...
    },
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.config.js', // eslint.config.js 자체도 무시
      'pnpm-lock.yaml', // pnpm lockfile 무시
    ],
  },
);
```

이 과정을 통해 eslint.config.js의 첫 번째 설정 객체에 기존 .eslintrc.cjs의
대부분의 공통 설정이 옮겨졌습니다.
