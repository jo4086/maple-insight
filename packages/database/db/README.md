# @maple/db

## Overview

`@maple/db`는 Maple Insight의 PostgreSQL 스키마와 Prisma migration을 관리하고, 애플리케이션용 repository와 관리 작업용 DB API를 제공하는 패키지입니다. 스키마의 실제 정의는 [Prisma schema](./prisma/schema.prisma), 배포 이력은 [migrations](./prisma/migrations/)에서 확인합니다.

## Responsibilities

- PostgreSQL의 `app`, `ranking`, `game_data`, `equipment` 스키마와 테이블 정의
- Prisma Client 생성 설정과 프로세스 단위 client 수명 주기 관리
- OCID, 검색 이력, 랭킹, 캐릭터 그룹, 장비 조회·저장 API 제공
- 게임 데이터 버전, raw 데이터, 직업·스킬·장비·보스 데이터의 관리용 조회·적재·초기화 API 제공
- 여러 행이나 테이블을 함께 변경하는 작업의 transaction 경계 제공

실행할 입력 파일과 경로를 결정하고 seed 작업을 시작하는 책임은 `@maple/data-admin`에 있습니다. 이 패키지는 DB 접근과 원자적 저장을 담당하며 관리 실행 흐름을 중복 구현하지 않습니다.

## Structure

- [`prisma/schema.prisma`](./prisma/schema.prisma): PostgreSQL datasource, Prisma generator, 모델과 관계
- [`docs/REQUIREMENTS/weapon-types-requirements.md`](./docs/REQUIREMENTS/weapon-types-requirements.md): 승인된 `REQ001` 요구사항 원본
- [`docs/SPEC/weapon-types.md`](./docs/SPEC/weapon-types.md): `REQ001-01` 수용 조건
- [`docs/ROADMAP.md`](./docs/ROADMAP.md): 무기 타입 Phase와 상태
- [`docs/GOAL/weapon-types.md`](./docs/GOAL/weapon-types.md): 현재 설계 검토 Phase의 산출물과 종료 조건
- [`docs/REQUESTS/weapon-types.md`](./docs/REQUESTS/weapon-types.md): 구현된 전역 `equipment.weapon_types` 구조, seed 경계와 미완료 item 연결 상태
- [`docs/REVIEW.md`](./docs/REVIEW.md): 실행한 검증과 DB 미적용 상태 기록
- [`prisma/migrations/`](./prisma/migrations/): 스키마 분리와 모델 변경의 SQL 이력
- [`src/lib/prisma.ts`](./src/lib/prisma.ts): 공유 Prisma Client와 종료 함수
- [`src/repositories/`](./src/repositories/): 일반 애플리케이션의 조회·저장 API
- [`src/admin/`](./src/admin/): 데이터 버전 관리, 관리 조회, seed와 reset용 DB API
- [`src/domain/`](./src/domain/): 게임 데이터 버전 파싱과 환경 판정
- [`src/generated/prisma/`](./src/generated/prisma/): `prisma generate` 산출물
- [`src/index.ts`](./src/index.ts): 기본 진입점
- [`src/clients/`](./src/clients/), [`src/config/`](./src/config/): 현재 공개 구현이 없는 빈 모듈
- [`package.json`](./package.json): 공개 subpath와 개발 명령

## Architecture

### Database schemas

| PostgreSQL schema | 주요 모델                                                           |
| ----------------- | ------------------------------------------------------------------- |
| `app`             | `Ocid`, `SearchHistory`, `CharacterGroup`, `CharacterGroupMember`   |
| `ranking`         | `RankingRun`, `RankingRawPage`, `RankingOcidCursor`, `UnionRanking` |
| `game_data`       | 보스, 게임 데이터 버전·raw 파일·raw 레코드, 직업·스킬 모델          |
| `equipment`       | `EquipmentItem`, `WeaponType`, `EquipmentPotentialOptionText`       |

초기 migration은 `public`에 테이블을 만들었고, 이후 migration이 `app`, `ranking`, `game_data`로 이동했습니다. `equipment`는 별도 migration에서 추가되었습니다. 현재 상태 판단에는 migration 하나가 아니라 [전체 migration 이력](./prisma/migrations/)과 [현재 schema](./prisma/schema.prisma)를 함께 사용합니다.

### Prisma Client lifecycle

[`src/lib/prisma.ts`](./src/lib/prisma.ts)는 생성된 client를 한 번 초기화합니다. production이 아니면 `globalThis`에 client를 보관해 모듈 재로딩 때 연결 인스턴스가 늘어나는 것을 막습니다. development에서는 `warn`, `error`, 그 외 환경에서는 `error`만 기록합니다.

기본 공개 API는 client 자체를 노출하지 않고 `disconnectDb()`만 내보냅니다. 장기 실행 프로세스는 종료 시 `disconnectDb()`를 호출해야 합니다. 연결 URL은 [schema](./prisma/schema.prisma)의 `DATABASE_URL`에서 읽습니다.

### Access layers and transactions

- `src/repositories`: 런타임 기능용 API입니다. 단건 CRUD뿐 아니라 upsert, 상태 전이, 페이지 조회를 포함합니다. 유니온 랭킹 저장과 캐릭터 그룹 버전 생성·수정은 transaction으로 관련 행을 함께 갱신합니다.
- `src/admin`: 운영 데이터의 import, version lifecycle, seed, reset을 위한 API입니다. seed와 reset은 대체로 transaction을 사용합니다. 게임 데이터 버전 복사는 별도 transaction과 제한된 batch로 실행됩니다.
- `src/clients`: 현재 구현과 export가 없습니다. Prisma Client의 실제 소유 위치는 `src/lib/prisma.ts`입니다.

각 함수가 자체 transaction을 시작하는지, 호출자가 `Prisma.TransactionClient`를 전달해야 하는지는 함수별 구현에서 확인해야 합니다. 예를 들어 `cloneGameDataVersion()`은 transaction을 열고, `cloneGameDataVersionInTransaction()`은 기존 transaction에 참여합니다.

## Public API / Entry Points

[`package.json`](./package.json)의 `exports`가 지원하는 진입점의 기준입니다.

### `@maple/db`

[`src/index.ts`](./src/index.ts)가 다음 repository API와 `disconnectDb()`를 공개합니다.

- 캐릭터 그룹: 후보·활성 그룹 조회, 새 그룹 버전 생성, 활성 그룹 수정, superseded 처리
- 장비: 이름과 버전 기준 장비 조회, 잠재옵션 문구 전체 조회
- OCID: upsert, 이름·row ID·OCID 조회, 기존 이름과 검색 대상 조회
- 랭킹: 실행과 raw page 저장, 완료 실행 조회, OCID cursor 상태 전이, 실행 완료·실패 처리
- 검색 이력: 날짜별 조회, 일자 단위 upsert, 날짜별 목록 조회
- 유니온 랭킹: OCID·account key 조회와 캐릭터별 저장

### `@maple/db/admin`

[`src/admin/index.ts`](./src/admin/index.ts)는 다음 관리 API를 묶어 공개합니다.

- 게임 데이터 버전 import 시작·완료·실패, 조회, release date 수정, 복사·복사 완료·불완전 복사 reset, soft delete
- raw 게임 데이터, 정규화 게임 데이터, 장비, 장비 잠재옵션 문구, 보스 데이터와 전역 무기 타입 seed
- raw·게임 데이터·장비를 순서대로 처리하는 bundle seed
- 직업 ID별 게임 스킬 조회
- 비랭킹 데이터 reset
- 게임 데이터 버전 파싱과 환경 판정 도메인 API

### Exported subpaths

관리 기능은 `@maple/db/admin` 외에 `@maple/db/admin/game-skill-query`, `@maple/db/admin/game-data-version`, `@maple/db/admin/seed-game-data-raw`, `@maple/db/admin/seed-game-data-bundle`, `@maple/db/admin/seed-game-data`, `@maple/db/admin/seed-equipment`, `@maple/db/admin/seed-equipment-potential-option`으로도 공개됩니다. 런타임 repository는 `@maple/db/character-group`, `@maple/db/equipment`, `@maple/db/ocid`, `@maple/db/ranking`, `@maple/db/search-history`, `@maple/db/union-ranking`으로 직접 가져올 수 있습니다. 버전 도메인은 `@maple/db/game-data-version`에서 가져올 수 있습니다.

`src/lib/prisma.ts`, 생성된 Prisma Client, `src/types/api.ts`는 `package.json`의 공개 subpath가 아닙니다. 내부 경로 import에 의존하지 않습니다.

## Development

저장소 루트에서 실행합니다. 아래 명령은 [`package.json`](./package.json)에 정의된 script만 사용합니다.

```bash
pnpm --filter @maple/db run prisma:generate
pnpm --filter @maple/db run typecheck
pnpm --filter @maple/db run lint
pnpm --filter @maple/db run build
pnpm --filter @maple/db run dev
```

- schema 변경 뒤 `prisma:generate`로 `src/generated/prisma`를 갱신합니다.
- `typecheck`는 emit 없이 검사합니다.
- `build`는 CommonJS JavaScript와 declaration을 `dist`에 생성합니다.
- `dev`는 watch build입니다.
- [`src/admin/game-data-version.repo.test.ts`](./src/admin/game-data-version.repo.test.ts)는 Node test 기반 단위 테스트지만, 현재 패키지에는 `test` script가 없습니다.
- 패키지에는 migration 생성·적용·reset script가 없습니다. 데이터베이스를 변경하는 Prisma 명령은 별도 승인과 실행 절차 없이 사용하지 않습니다.

## Related Packages

- [`@maple/data-admin`](../data-admin/package.json): 입력 경로와 관리 작업 실행 진입점을 소유하며 `@maple/db`의 admin API를 사용합니다.
- [`packages` README](../../README.md): 공통 패키지의 빌드 순서와 데이터 패키지 관계를 설명합니다.
- [`@maple/data-monster`](../../game-data/monster/package.json): 보스 seed 구현이 사용하는 원천 데이터 패키지입니다.
