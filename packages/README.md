# Packages

## Build Order

직업 taxonomy 데이터는 `@maple/data-core`에 입력 데이터와 생성 결과가 함께 있고,
초기 생성 로직은 `@maple/bootstrap`에 있다.

관련 파일:

- 입력 데이터: `game-data/core/src/taxonomy`
- 생성기 입력 설정: `game-data/core/src/taxonomy/generator/input.ts`
- 생성 결과: `game-data/core/src/taxonomy/generator/generated.ts`
- 생성 로직: `bootstrap/src/taxonomy/generator.ts`
- 실행 스크립트: `bootstrap/src/scripts/generate-core-taxonomy.ts`

현재 필요한 빌드 순서는 다음과 같다.

1. `@maple/bootstrap`으로 core taxonomy 생성 결과를 갱신한다.
2. `@maple/data-core`를 빌드한다.
3. `@maple/data-equipment`, `@maple/data-skill` 등 나머지 패키지를 빌드한다.
4. 전체 generator를 빌드하고 나머지 데이터를 생성한다.

```text
bootstrap core taxonomy 생성
-> data-core 빌드
-> 나머지 패키지 빌드
-> 나머지 데이터 생성
```

## Bootstrap Problem

`@maple/data-core`는 다음 생성 파일을 공개 API로 내보낸다.

```text
game-data/core/src/taxonomy/generator/generated.ts
```

하지만 이 파일을 만드는 코드를 전체 `@maple/generator`에 두면, generator 빌드 과정에서
`@maple/data-core`와 다른 game-data 패키지의 빌드 결과를 참조하게 된다.

따라서 생성 파일이 없는 완전히 깨끗한 상태에서는 다음 순환 관계가 생긴다.

```text
data-core 빌드에는 generated.ts가 필요
generated.ts 생성에는 generator 빌드가 필요
generator 빌드에는 data-core와 다른 패키지 빌드가 필요
```

현재는 `@maple/bootstrap`이 `data-core/src`의 원천 TypeScript 파일을 직접 읽어
`generated.ts`를 만든다. 따라서 `data-core`나 `generator`를 먼저 빌드하지 않아도 된다.
그래도 깨끗한 checkout에서 바로 빌드할 수 있도록 `generated.ts`는 Git에 포함한다.

다음 규칙을 지켜야 한다.

- `generated.ts`를 `.gitignore`에 추가하지 않는다.
- taxonomy 입력을 변경하면 `pnpm run bootstrap:core-taxonomy`를 실행하고 생성 결과도 함께 커밋한다.
- 생성 파일을 직접 수정하지 않는다.
- 생성 이후 `data-core`를 다시 빌드하거나 타입 검사한다.

## Current Limitation

`@maple/bootstrap`은 전체 빌드 전에 필요한 최소 생성 작업만 담당한다.

다음 규칙을 지킨다.

1. bootstrap은 `data-core/src` 원천 데이터만 읽는다.
2. bootstrap은 `data-core/dist`, equipment, skill, db, generator에 의존하지 않는다.
3. bootstrap에는 전체 데이터 생성 로직을 넣지 않는다.
4. CI에서 생성 결과가 최신인지 검사한다.

목표 빌드 순서는 다음과 같다.

```text
bootstrap
-> data-core
-> equipment/skill 등 나머지 패키지
-> 전체 데이터 generator
```

## `@maple/game-data` Migration TODO

다음 목록은 `.legacy` 파일과 `game-data-legacy` 패키지 내부를 제외하고,
현재 빌드 대상 소스에서 `@maple/game-data`를 직접 import하는 곳을 정리한 것이다.

### 완료된 import 교체

- [x] `simulator/src/stat/calculator.ts`
  - `StatClassType` -> `@maple/data-core`
- [x] `simulator/src/symbol/constants.ts`
  - 심볼 이름 타입 -> `@maple/data-symbol`
- [x] `simulator/src/symbol/calculator.ts`
  - 심볼 이름, 메타 데이터 -> `@maple/data-symbol`
- [x] `contracts/internal/src/code-system/index.ts`
  - `Affiliation`, `ClassGroup` -> `@maple/data-core`
- [x] `contracts/internal/src/skill/commonGroup.ts`
  - `commonSkillGroupCombinations`, `CommonSkillGroup` -> `@maple/data-skill`
- [x] `generator/src/class/generator.ts`
  - 직업 트리, 직업군 데이터와 타입 -> `@maple/data-core`
- [x] `generator/src/class/types.ts`
  - 직업 taxonomy 타입 -> `@maple/data-core`
- [x] `generator/src/game-skill/job-id-map.ts`
  - 최종 직업명 타입 -> `@maple/data-core`
- [x] `generator/src/game-skill/generator.ts`
  - raw job 직업명 조회 -> `@maple/data-skill`
- [x] `generator/src/equipment/types.ts`
  - `EquipmentClassType`, `EquipmentStatOption` -> `@maple/data-core`
- [x] `generator/src/monster/generator.ts`
  - 보스 원천 데이터와 타입 -> `@maple/data-monster`
- [x] `generator/src/monster/types.ts`
  - `BossName`, `BossSpec` -> `@maple/data-monster`
- [x] `database/data-admin/src/export-game-skills-by-raw-job.ts`
  - raw job 데이터와 타입 -> `@maple/data-skill`
- [x] `database/db/src/admin/seed-boss.repo.ts`
  - `bossSpecJson` -> `@maple/data-monster`

### 완료된 데이터 이관

- [x] 공용 스킬 그룹 규칙
  - 위치: `game-data/skill/src/common`
- [x] raw job 데이터
  - 위치: `game-data/skill/src/raw`
- [x] 생성된 보스 스펙 JSON
  - 위치: `game-data/monster/src/boss/generated/bossSpec.json`

### 완료된 의존성 정리

- [x] `simulator/package.json`
- [x] `contracts/internal/package.json`
- [x] `database/data-admin/package.json`
- [x] `database/db/package.json`
- [x] `generator/package.json`
- [x] `game-data/core/package.json`
- [x] `game-data/class/package.json`
- [x] `game-data/equipment/package.json`
- [x] `game-data/item/package.json`
- [x] `game-data/skill/package.json`

### 완료된 빌드 스크립트 정리

- [x] `generator/package.json`
  - `pretypecheck`, `prebuild`에서 legacy `@maple/game-data` 빌드를 제거했다.
- [x] `database/data-admin/package.json`
  - `preexport:game-skills-by-raw-job`를 `@maple/data-skill` 빌드 기준으로 변경했다.
- [x] `packages/package.json`
  - legacy `@maple/game-data` 필터를 `@maple/game-data-workspace` 필터로 변경했다.

### 남은 작업

- [ ] `game-data-legacy` 패키지를 실제로 제거할지 결정한다.
- [x] class/taxonomy bootstrap 전용 명령을 분리한다.
- [ ] CI에서 생성 결과가 최신인지 검사한다.

### 완료 조건

- [x] 빌드 대상 소스에서 `@maple/game-data` 직접 import가 0건이다.
- [x] workspace package 의존성에서 `@maple/game-data`가 0건이다.
- [x] 빌드 및 생성 스크립트에서 `@maple/game-data` 참조가 0건이다.
- [x] 전체 packages typecheck와 build가 통과한다.
- [ ] 깨끗한 checkout에서 class/taxonomy 생성과 전체 데이터 생성이 가능하다.
