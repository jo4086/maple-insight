# @maple/data-admin

## Overview

`@maple/data-admin`은 초기 데이터 등록과 관리 작업을 실행하는 패키지다. CLI 전용 진입점이 입력 버전과 경로를 정하고, 실제 검증·변환·DB 저장은 주로 [`@maple/db`](../db/README.md)의 관리자 API에 위임한다.

현재 패키지 루트 모듈 [`src/index.ts`](./src/index.ts)는 비어 있다. 따라서 라이브러리 함수 대신 [`package.json`](./package.json)의 스크립트를 실행하는 방식이 공개된 사용 경로다.

## Responsibilities

- Seed·export 명령의 실행 진입점 제공
- CLI 인자와 환경 변수에서 버전·입출력 경로 결정
- `@maple/data-potential`, `@maple/data-skill` 데이터를 관리 작업용 형태로 조립
- `@maple/db`, `@maple/db/admin`, `@maple/db/game-data-version`의 공개 API 호출
- 실행 결과 출력, 실패 코드 설정, Prisma 연결 종료

Prisma Schema, 트랜잭션, 저장 순서, 버전 상태와 중복 처리의 소유자는 `@maple/db`다. 이 패키지는 DB 접근 로직을 별도로 구현하지 않는다.

## Structure

| 경로                                                                                 | 역할                                               |
| ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| [`src/game-data-path.ts`](./src/game-data-path.ts)                                   | 버전에서 `test` 또는 `production` 데이터 경로 계산 |
| [`src/seed-boss.ts`](./src/seed-boss.ts)                                             | 보스 스펙 Seed 실행                                |
| [`src/seed-equipment.ts`](./src/seed-equipment.ts)                                   | 장비 JSON Seed 실행                                |
| [`src/seed-equipment-potential-option.ts`](./src/seed-equipment-potential-option.ts) | 잠재능력 옵션 문구 조합 생성과 Seed 실행           |
| [`src/seed-game-data-raw.ts`](./src/seed-game-data-raw.ts)                           | 디렉터리의 원본 JSON 전체 보존                     |
| [`src/seed-game-data.ts`](./src/seed-game-data.ts)                                   | 직업·스킬 JSON 정규화 Seed 실행                    |
| [`src/seed-game-data-bundle.ts`](./src/seed-game-data-bundle.ts)                     | raw, 정규화 게임 데이터, 장비를 순서대로 등록      |
| [`src/seed-weapon-types-loader.ts`](./src/seed-weapon-types-loader.ts)               | 36행 무기 타입 JSON 입력 파일 로드                  |
| [`src/seed-weapon-types.ts`](./src/seed-weapon-types.ts)                             | 무기 타입 Seed 실행                                |
| [`src/export-game-skills-by-raw-job.ts`](./src/export-game-skills-by-raw-job.ts)     | DB 스킬을 raw 직업 기준 JSON으로 export            |
| [`tsup.config.ts`](./tsup.config.ts)                                                 | CommonJS 빌드 진입점 설정                          |

## Architecture

실행 진입점은 다음 흐름을 따른다.

1. `dotenv/config`로 실행 작업 디렉터리 기준 환경 변수를 읽는다.
2. 버전·경로가 필요한 명령은 진입점에서 CLI 인자·환경 변수·기본값을 사용해 결정한다. 보스·잠재능력 옵션 Seed에는 버전 인자가 없다.
3. 파일 기반 Seed의 검증·변환·저장은 `@maple/db/admin` API가 맡는다. 잠재능력 옵션의 입력 조합과 export 파일 작성은 이 패키지가 맡는다.
4. 진입점이 실행 결과를 `console.log`로 출력한다.
5. 오류는 `console.error`로 출력하고 `process.exitCode = 1`을 설정한다.
6. 성공·실패와 관계없이 `disconnectDb()`를 호출한다.

DB 연결에는 Prisma Schema가 요구하는 `DATABASE_URL`이 필요하다. 버전을 받는 명령의 우선순위는 첫 번째 `--`가 아닌 위치 인자, `GAME_DATA_VERSION`, 기본값 `1.2.424` 순서다. 버전은 `major.minor.patch` 형식이어야 하며 patch `100`~`299`는 `test`, `300`~`499`는 `production` 경로로 해석된다.

패키지 스크립트로 실행할 때 기본 경로는 다음과 같다.

- 게임 JSON: 저장소 루트의 `data/{environment}/{version}/json`
- 장비 JSON: 저장소 루트의 `packages/generator/src/generated/equipment`
- 직업별 스킬 export: 저장소 루트의 `data/{environment}/{version}/generated/skills-by-raw-job.json`
- 무기 타입 JSON: `packages/game-data/equipment/data/weapon-types.json`

`GAME_DATA_JSON_DIR`은 게임 JSON 입력 경로를, `EQUIPMENT_JSON_DIR`은 장비 입력 경로를 바꾼다. `GAME_DATA_SKILL_BY_JOB_OUTPUT`은 export 파일 경로를 바꾼다. 상대 경로 계산이 `process.cwd()`를 기준으로 하므로 아래 패키지 스크립트 사용을 권장한다.

### 검증·변환·저장 경계

진입점은 입력 경로와 버전만 조립한다. JSON 배열이며 각 원소가 객체인지 확인하는 검증, 문자열 숫자·불리언 변환, 장비 이름 정규화, chunk 분할과 저장은 `@maple/db/admin`의 Seed repository가 수행한다. 전체 필드에 대한 별도 런타임 스키마 검증은 없다.

잠재능력 옵션 진입점은 레벨·종류·부위 조합을 `@maple/data-potential`로 전개한 뒤 관리자 API에 전달한다. 보스 Seed의 원본과 HP 변환은 `@maple/db`가 의존하는 `@maple/data-monster` 및 보스 Seed repository가 담당한다. Export는 `@maple/data-skill`의 raw 직업 분류와 DB 조회 결과를 합쳐 JSON을 작성한다.

### 재실행과 중복 처리

- 보스와 잠재능력 옵션 Seed는 각 대상 테이블 전체를 트랜잭션 안에서 삭제한 뒤 다시 생성한다.
- 장비와 정규화 게임 데이터 Seed는 해당 버전의 기존 행을 삭제한 뒤 다시 생성한다.
- raw Seed는 `(version, fileName)`을 upsert하고 해당 파일의 기존 레코드를 교체한다. 입력 디렉터리에서 사라진 파일의 기존 DB 행은 삭제하지 않는다.
- `createMany` 호출은 `skipDuplicates`를 사용하지 않는다. 입력 내부의 고유 키 충돌은 DB 오류로 처리된다.
- Bundle은 `raw → gameData → equipment` 순서로 호출하고 버전 상태를 `importing → ready`로 바꾼다. 세 작업은 하나의 통합 트랜잭션이 아니며, 실패하면 버전 상태를 `failed`로 바꾸고 오류를 다시 던진다.

## Public API / Entry Points

| 스크립트                          | 입력과 동작                                                                                                             | 성공 출력                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `seed:boss`                       | 별도 CLI 입력 없이 등록된 보스 스펙 전체 교체                                                                           | 난이도·페이즈·대상 건수               |
| `seed:equipment`                  | `weapon.json`, `armor.json`, `accessory.json`, `subWeapon.json`                                                         | 버전과 종류별·전체 장비 건수          |
| `seed:equipment-potential-option` | 코드에 정의된 레벨·종류·부위 조합 생성                                                                                  | potential·additional·전체 건수        |
| `seed:game-data-raw`              | 입력 디렉터리의 `.json` 파일을 이름순으로 저장                                                                          | 버전, 파일 수, 레코드 수, 파일별 건수 |
| `seed:game-data`                  | `ms_job.json`, `ms_skill.json`, `ms_skillCommon.json`, `ms_skillH.json`, `ms_skillLevel.json`, `ms_skillPVPCommon.json` | 버전과 파일 종류별 행 수              |
| `seed:game-data-bundle`           | raw, 정규화 게임 데이터, 장비 Seed 연속 실행                                                                            | 세 Seed 결과를 포함한 객체            |
| `seed:weapon-types`              | 카르타 포함 36행 `weapon-types.json`; 버전 입력 없음                                                                     | inserted·skipped 건수                 |
| `export:game-skills-by-raw-job`   | 버전별 스킬 조회 후 raw 직업 ID 그룹 JSON 작성                                                                          | 버전, 직업 수, 스킬 수, 출력 경로     |

패키지 루트 export `@maple/data-admin`은 [`src/index.ts`](./src/index.ts)에 export가 없어 현재 공개 심벌이 없다. `bin` 진입점도 없다. `build:js`의 tsup 진입점에는 `seed-game-data-bundle.ts`가 포함되지 않지만, `seed:game-data-bundle` 스크립트는 `tsx`로 원본 TypeScript를 직접 실행한다.

## Development

저장소 루트에서 실행한다.

```bash
pnpm --filter @maple/data-admin typecheck
pnpm --filter @maple/data-admin lint
pnpm --filter @maple/data-admin build
```

Seed는 DB를 변경하므로 실행 전 대상 `DATABASE_URL`, 버전, 입력 디렉터리를 확인해야 한다. 버전 인자는 `--` 뒤에 전달한다.

```bash
pnpm --filter @maple/data-admin seed:game-data -- 1.2.424
pnpm --filter @maple/data-admin seed:equipment -- 1.2.424
# DB 변경 명령: 대상과 현재 행을 확인한 뒤 실행
pnpm --filter @maple/data-admin seed:weapon-types
pnpm --filter @maple/data-admin seed:game-data-bundle -- 1.2.424
pnpm --filter @maple/data-admin export:game-skills-by-raw-job -- 1.2.424
```

각 명령의 `pre<명령>` 스크립트가 필요한 workspace 패키지를 먼저 빌드한다. 게임 데이터·장비·export 명령은 결과 건수만 출력하며 dry-run 옵션은 제공하지 않는다.

`seed:weapon-types`도 dry-run이 아니다. 현재 원천은 카르타를 포함한 36행이며 dedicated job ID는 비어 있다. 같은 `(category, normalizedPart)`의 기존 행과 값이 다르면 충돌로 중단해야 하며 자동 덮어쓰기를 허용하지 않는다.

사용자가 migration을 독립적으로 적용한 뒤 read-only status에서 18개 migration이 모두 적용된 상태를 확인했다. 최초 seed 전 count는 `0`이었다. 첫 시도는 nullable JSON의 bundled `Prisma.DbNull`이 JSON `{}`로 저장되어 PostgreSQL `23514`로 rollback되었고 count는 `0`을 유지했다. Repository가 필드를 omit해 SQL `NULL`을 저장하도록 수정되고 집중 테스트 5개와 typecheck가 통과한 뒤, 사용자 승인 아래 이 명령을 재실행해 `inserted: 36`, `skipped: 0`을 확인했다. 36행의 원천값 일치와 SQL `NULL` override 32행, 한손둔기 hero `1.34`·paladin `1.24`를 read-only로 검증했다. Assistant는 migration을 적용하지 않았다. Seed 재실행, FK/backfill과 그 밖의 DB 불변식은 검증하지 않았다.

## Related Packages

- [`@maple/db`](../db/README.md): Prisma Client, repository, 관리자 Seed API와 버전 상태 관리
- [`@maple/db` package manifest](../db/package.json): `@maple/db`, `@maple/db/admin`, `@maple/db/game-data-version` export 정의
- [`@maple/data-potential`](../../game-data/potential/package.json): 잠재능력 옵션 문구 생성
- [`@maple/data-skill`](../../game-data/skill/package.json): raw 직업 ID·분류와 클래스 이름 제공
- [`@maple/generator`](../../generator/package.json): 기본 장비 JSON 입력 생성 위치
