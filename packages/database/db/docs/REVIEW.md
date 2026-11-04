# Database Review

## 2026-10-27: Weapon type 구현 검증

### 통과

- `pnpm --filter @maple/db exec prisma validate`: Prisma schema 유효.
- `pnpm --filter @maple/db run typecheck`: 통과.
- `pnpm --filter @maple/db run build`: JavaScript와 declaration build 통과.
- `pnpm --filter @maple/data-equipment run typecheck`: 공유 타입 검사 통과.
- `pnpm --filter @maple/data-equipment run build`: 공유 패키지 build 통과.
- `pnpm --filter @maple/data-admin exec tsc --noEmit`: 통과.
- `pnpm --filter @maple/data-admin run build:js`: `seed-weapon-types`를 포함한 JavaScript build 통과.
- `pnpm --filter @maple/db exec tsx --test src/admin/seed-weapon-types.repo.test.ts`: 3개 통과, 실패 0개. 입력 검증, 동일 행 skip, 충돌 시 write 전 중단을 확인했다.
- generator build 후 in-memory `createWeaponEquipmentJson()` 확인: 199개 item, 데스티니 세이버 기본 상수 `1.24`, 데스티니 튜너 `requiredClass` `아델`, 데스티니 세이버(히어로) 상수 `1.34`.
- [`20261027000000_add_weapon_types`](../prisma/migrations/20261027000000_add_weapon_types/migration.sql): `hero_weapon_constant`를 한손검·두손검·한손도끼·두손도끼로 제한하는 CHECK 확인.
- 작성한 [`REVIEW.md`](./REVIEW.md)와 당시 [`REQUESTS/weapon-types.md`](./REQUESTS/REQ001/weapon-types.md)를 별도 검사: trailing whitespace 없음.

### 실패와 미검증

- 저장소 전체 `git diff --check`: 실패. 생성된 [`index.d.ts`](../src/generated/prisma/index.d.ts)에 trailing whitespace가 남아 있다. 이 검토의 문서 소유 범위 밖이라 수정하지 않았다.
- [`builder.ts`](../../../game-data/equipment/src/information/weapon/builder.ts)의 `WeaponMetaInput`은 `requiredClass`를 허용하지 않는다. item-level per-item override 요구사항은 미구현이다.
- [`EquipmentItem`](../prisma/schema.prisma)에 `weapon_type_id`가 없다. 전역 타입 카탈로그와 item 상속·override 연결은 미구현이다.
- migration 적용과 `seed:weapon-types` 실행은 수행하지 않았다. seed dry run과 in-memory 생성 검증은 실제 DB seed가 아니다. 실제 DB 행은 검증하지 않았다.
- Migration 적용 승인과 seed 실행 승인은 별도이며 어느 승인도 완료됐다고 기록하지 않는다.

## 2026-11-02: REQ001-P01 설계 검토와 승인

### 설계 근거와 종료 조건

- 사용자가 [`ARCHITECTURE-weapon-types-proposal.md`](./ARCHITECTURE-weapon-types-proposal.md)의 연결·override·호환성 설계를 2026-11-02 승인했다.
- 승인 설계는 일곱 결정, [`REQ001-01`](./SPEC/weapon-types.md) 수용 조건 대응, 패키지별 책임, 기존 데이터 보존·실패 처리, migration 적용·seed 실행의 별도 승인 경계를 기록한다.
- `EquipmentItem.requiredClass` non-null JSON, 미구현 FK, 전역 `WeaponType` BigInt PK와 unique key, 정적 히어로 네 예외와 팔라딘 한손둔기 `1.24`를 소스에서 확인했다.
- 장비 seed가 transaction 안에서 `ensureGameDataVersion`, 버전별 `deleteMany`, 재생성을 수행하고 기존 ready 상태를 importing으로 바꿀 수 있음을 확인했다.
- 이 승인으로 P01의 문서화와 설계 승인 종료 조건을 충족했다. P02 구현과 검증은 현재 [`GOAL`](./GOAL/weapon-types.md)을 따른다.

### 실행과 데이터 경계

- 사용자 승인은 설계 승인 기록이며 migration 작성·적용, seed 실행 또는 DB 변경의 증거가 아니다.
- 문서와 소스만 검사했다. 실제 DB, 기존 행, migration 적용, seed 실행은 검사하지 않았다.
- 사용자 제공 최종 seed 데이터와 보조무기 최종 카탈로그의 범위·값은 미해결이다.
- Migration 적용 승인과 seed 실행 승인은 별도이며 어느 실행 승인도 완료됐다고 기록하지 않는다.

## 2026-11-02: REQ001-P02 구현 체크포인트

### 구현 확인

- `EquipmentItem`의 nullable `weaponTypeId` FK와 nullable `requiredClassOverride`, `ON DELETE RESTRICT` 제약을 [`20261102000000_link_equipment_weapon_types`](../prisma/migrations/20261102000000_link_equipment_weapon_types/migration.sql)에 추가했다.
- `game-data/equipment` 원천 override를 generator JSON과 DB 저장·버전 복사 경로까지 전달하고, 레거시 `requiredClass` 최종값을 유지했다.
- 읽기 resolver가 연결된 타입 기본값, 명시적 공용·완전 대체 override, FK 없는 기존 행의 레거시 fallback을 구분한다.
- 사용자 제공 최종 카탈로그가 없으므로 실제 FK 할당과 기존 행 backfill을 하지 않는다. 검증된 최종 카탈로그를 받은 뒤 `REQ001-P04`에서 수행한다.

### 현재 검증 근거

- Prisma Client generate와 `pnpm --filter @maple/db exec prisma validate`: 통과.
- DB 관련 테스트: 최종 집중 실행에서 28개 통과, 실패 0개. 기존 ready 버전의 재적재 차단, bundle 사전 확인, FK 미할당 상태를 포함한다.
- `@maple/db`, `@maple/data-equipment`, generator typecheck와 build: 통과.
- `@maple/data-equipment` override 테스트: 2개 통과.
- generator override 테스트: 격리된 임시 runtime 설정에서는 통과했다. 표준 호출은 declaration import path 해석 오류로 실패해 표준 경로 통과로 기록하지 않는다.

### 미완료와 실행 경계

- 기존 버전 보호, bundle 사전 확인, 버전 복사 보존을 단위 테스트로 확인했다. 실제 DB의 기존 행과 전체 import transaction 경계는 확인하지 못했다. 최종 카탈로그가 없어 FK 할당·backfill도 미구현이며 P02 종료 조건은 완료되지 않았다.
- Migration status/deploy, 실제 DB FK·제약 확인, FK assignment/backfill, seed는 실행하지 않았다.
- `prisma db push`, `prisma migrate reset`도 실행하지 않았다. 수동 migration은 [`db README`](../README.md#manual-migration-user-only)의 사용자 전용 절차를 따른다.
- P02 완료 또는 실제 DB 검증 완료를 주장하지 않으며 [`ROADMAP`](./ROADMAP.md)의 상태를 변경하지 않는다.

## 2026-11-03: 공격속도 소유권 사용자 정정

### 정정 내용

- 사용자는 공격속도를 직업 특성으로 정정하고 `equipment.weapon_types`에서 제거하도록 요청했다.
- 직업 설정 측 저장 구조나 구현 완료는 확인하지 않았으며 이 문서에서 주장하지 않는다.
- 2026-11-02 승인 설계와 P02 체크포인트는 당시 기록으로 보존하고, 현재 요구사항·명세·설계·GOAL·ROADMAP에 정정 범위를 반영했다.

### 구현과 실행 경계

- Prisma `WeaponType` 모델·생성된 client, seed 계약·입력, 공유 `WeaponTypeRecord`에서 공격속도를 제거했다. `EquipmentItem.weaponSpeed`와 직업 설정 구조는 변경하지 않았다.
- [`20261103000000_remove_weapon_type_attack_speed`](../prisma/migrations/20261103000000_remove_weapon_type_attack_speed/migration.sql)는 기존 CHECK를 공격속도 참조 없이 재작성한 뒤 컬럼을 삭제한다. 기존 값이 있으면 삭제되므로 적용 전 백업 확인이 필요하다.
- `20261102000000_link_equipment_weapon_types`와 공격속도 제거 migration은 파일만 작성했고 이 작업에서 적용하지 않았다. Weapon type seed, Migration status/deploy, `prisma db push`, `prisma migrate reset`도 실행하지 않았다.
- `prisma generate`와 `prisma validate`, weapon type seed 테스트 3개, equipment 타입 테스트 1개, db·equipment 타입 검사는 통과했다. Data-admin 타입 검사는 이전 db 빌드 산출물의 구 계약을 참조해 한 차례 실패했지만, 최신 db 빌드 후 재실행해 통과했다. DB build, Prisma validate, `git diff --check`도 통과했다. P02는 진행 중이다.

## 2026-11-03: 무기상수 예외 구조 사용자 정정

### 결정과 현재 산출물

- 사용자는 별도 테이블·boolean 없이 nullable `weapon_constant_overrides` JSONB 배열을 사용하도록 결정했다. 배열이 아닌 scalar pair는 한손둔기의 hero·paladin 두 항목을 표현할 수 없어 거부한다.
- 확정값은 한손검 기본 `1.24`, 샤이닝 로드 `1.2`, 에너지 소드 `1.3125`, hero 한손검·한손둔기 `1.34`, 두손검·두손둔기 `1.44`, paladin 한손둔기 `1.24`다.
- [`weapon-types.json`](../../../game-data/equipment/data/weapon-types.json)은 카르타를 포함한 36행이며 dedicated job ID를 지정하지 않는다. 기존 35종 정적 후보를 최종 원천으로 사용하지 않는다.
- Prisma schema와 [`20261104000000_replace_hero_weapon_constant_with_overrides`](../prisma/migrations/20261104000000_replace_hero_weapon_constant_with_overrides/migration.sql)가 작성되었다.

### 보존과 충돌 위험

- 교체 migration은 기존 non-null `hero_weapon_constant`를 `{jobId: "hero", weaponConstant: string}` 배열로 옮긴다. 과거 히어로 도끼 값도 삭제하지 않고 그대로 보존한다.
- 현재 36행 원천에는 히어로 도끼 override가 없다. Migration으로 보존한 기존 행과 seed 원천이 다르면 현재 동일 key 충돌 정책이 write 전에 거부한다.
- 기존 행을 갱신할지 legacy 값을 보존할지는 별도 사용자 확인이 필요하다. 자동 덮어쓰기나 seed 실행으로 결정하지 않는다.

### 실행 경계

- `20261104000000_replace_hero_weapon_constant_with_overrides`는 파일만 작성했고 적용하지 않았다. 기존 두 관련 migration도 적용하지 않았다.
- Migration status/deploy, 실제 DB 확인, weapon type seed, `prisma db push`, `prisma migrate reset`을 실행하지 않았다.
- Prisma generate·validate, `@maple/db` build, `@maple/data-admin` typecheck·build, `@maple/data-equipment` typecheck, 집중 테스트(DB 5개·입력 로더 3개·상수 resolver 1개), `git diff --check`가 통과했다. DB 테스트는 36행 JSON을 모의 트랜잭션으로 전부 검증했다. 정적 샤이닝 로드 상수도 확정값 `1.2`로 맞추고 별도 assertion·타입 검사를 통과했다.
- 실제 DB migration·seed 검증은 수행하지 않았다. P02·P03·P04 완료를 주장하지 않는다.

## 2026-11-03: 공격속도 소유권 재정정

### 현재 결정과 산출물

- 사용자는 앞선 공격속도 제거 결정을 다시 정정했다. 공격속도는 현재 `equipment.weapon_types`가 소유하며, 앞선 결정과 제거 migration은 날짜가 있는 이력으로 보존한다.
- [`weapon-types.json`](../../../game-data/equipment/data/weapon-types.json)은 카르타를 포함한 36행 각각에 사용자 제공 숫자 `attackSpeed`를 가진다.
- Prisma `WeaponType.attackSpeed`는 nullable `SmallInt`다. [`20261105000000_restore_weapon_type_attack_speed`](../prisma/migrations/20261105000000_restore_weapon_type_attack_speed/migration.sql)는 이전 제거 migration 뒤에 nullable 컬럼을 추가하고, 주무기는 `NULL` 또는 `1..8`, 보조무기는 `NULL`만 허용하도록 CHECK를 다시 작성한다.

### 데이터와 실행 경계

- 복원 migration은 기존 행의 공격속도를 채우지 않으므로 기존 행은 `NULL`을 유지한다. 같은 key의 기존 `NULL`과 36행 원천의 숫자는 현재 seed 비교에서 충돌하며 조용히 갱신되지 않는다.
- `prisma validate`, `@maple/db` build, `@maple/data-admin`·`@maple/data-equipment` typecheck, 집중 테스트(DB seed 5개·JSON loader 3개·무기상수 타입 1개), `git diff --check`가 통과했다. DB seed 모의 트랜잭션은 36행을 읽어 검증하고 공격속도만 다른 기존 행의 충돌을 확인했다.
- Migration status/deploy와 weapon type seed를 실행하지 않았다. 실제 DB 상태도 확인하지 않았다.
- P02는 진행 중이며 P03·P04는 대기다. 어느 Phase도 이번 정정으로 완료 처리하지 않는다.

## 2026-11-03: 최초 weapon type seed 실제 DB 실행

### Migration 상태와 실행 전 기준

- Read-only `pnpm --filter @maple/db exec prisma migrate status`는 exit `0`이었고 `localhost:5432`의 `maple_ingestor`, schema `app, equipment, game_data, ranking`에서 18개 migration이 모두 적용된 최신 상태를 보고했다.
- Migration은 사용자가 독립적으로 적용했다. Assistant는 `prisma migrate deploy`를 실행하지 않았다.
- 최초 실행 전 read-only count는 `0`이었다.

### 실패, 수정과 재실행

- 최초 seed 시도는 bundled `Prisma.DbNull`이 nullable JSON 필드에서 SQL `NULL` 대신 JSON `{}`로 직렬화되어 PostgreSQL `23514` CHECK 오류로 실패했다. Transaction은 rollback되었고 read-only count는 다시 `0`이었다.
- DB repository는 DB default가 없는 nullable JSON 필드를 omit해 SQL `NULL`을 저장하도록 수정되었다.
- 집중 테스트는 5개 통과, 실패 0개였고 typecheck도 통과했다.
- 사용자 승인 아래 `pnpm --filter @maple/data-admin run seed:weapon-types`를 다시 실행한 결과 exit `0`, `inserted: 36`, `skipped: 0`이었다.

### 실행 후 검증과 미검증

- Read-only 검증에서 36행 모두 unique `(category, normalized_part)`였고 part, 공격속도, 기본 decimal과 override pair가 원천 JSON과 일치했다.
- `weapon_constant_overrides IS NULL`은 32행이었다. 한손둔기 override는 hero `1.34`, paladin `1.24`였다.
- Seed 재실행의 멱등성, FK/backfill과 그 밖의 DB 불변식은 검증하지 않았다. P02·P03·P04 완료를 주장하지 않는다.

## 2026-11-03: 에너지 소드 직업군 정정

- 사용자 요청에 따라 `packages/game-data/equipment/data/weapon-types.json`의 에너지 소드 `classGroupKeys`를 `["thief", "pirate"]`로 변경했다. 카테고리는 `weapon` 그대로다.
- `localhost:5432/maple_ingestor`에서 수정 전 `(category, normalized_part) = (weapon, 에너지소드)`인 ID `18`의 직업군은 `["pirate"]`였다. 해당 ID와 원래 값이 일치하는 행 하나만 갱신했고 결과 `updated: 1`을 확인했다.
- 갱신 뒤 조회에서 ID `18`, 에너지 소드의 `availabilityMode = class_groups`, 직업군 `["thief", "pirate"]`를 확인했다. 전체 seed 재실행이나 migration은 수행하지 않았다.

## 2026-11-03: Equipment catalog 연결 구현 체크포인트

### 구현과 정적 검증

- 새 equipment seed는 정확한 primary weapon catalog ID를 연결하고 catalog에 없는 subweapon은 `NULL`로 유지한다. Write 전에 legacy availability를 검증하며 static dedicated weapon restriction은 명시적 override로 생성한다.
- 기존 ready 버전에만 제한적으로 적용하는 guarded backfill API를 추가했다. 기존 행에는 안전한 제한적 backfill이 필요하고 dedicated legacy 109개는 데이터 출처와 호환성이 확정될 때까지 유예한다.
- 집중 테스트는 seed 16개, backfill 5개, resolver 7개가 통과했고 equipment와 db typecheck가 통과했다. Fresh in-memory 생성 주무기 199개는 모두 catalog synthetic ID와 일치했다.
- 기존 generated JSON은 override가 없어 stale 상태다. Dedicated 데이터 출처와 기존 정적 계산 호환성 우려로 P05 소비자를 DB 경로로 전환하지 않았다.

### Read-only DB 확인

- 18개 migration은 모두 최신이고 `equipment.weapon_types`는 weapon 36행, subweapon 0행이다.
- Ready version `1.2.424`에는 weapon item 199개와 subweapon item 239개가 있으며 모두 FK `NULL`이다. 주무기 199개는 canonical single-group 90개와 dedicated legacy 109개이며, 199개 모두 required-class override가 SQL `NULL`이다.
- FK `ON DELETE RESTRICT`와 attack-speed·JSON CHECK의 존재와 validation 상태를 확인했다. 실제 item-catalog 연결은 없으므로 연결 결과를 검증했다고 주장하지 않는다.

### 미실행과 Phase 경계

- Guarded backfill과 weapon type seed 재실행은 실행하지 않았다. 기존 ready 버전의 equipment 재seed는 ID 보존 조건 때문에 수행하지 않는다. 실제 DB 연결과 109개 dedicated 행의 처리 방침은 별도 승인 전까지 남아 있다.
- P02~P04는 진행 중이고 P05는 대기다. 이 체크포인트로 어느 Phase도 완료 처리하지 않는다.

## 2026-11-03: 1.2.419 장비 import 검증 체크포인트

- 사용자는 `1.2.419` 장비 데이터가 `1.2.424`와 같음을 확인했다. 기존 production `1.2.419`는 release metadata 외 import 데이터가 비어 있었고, release date `2026-09-17`과 6개 JSON을 검증했다.
- 저장소 generated JSON이 아닌 fresh temporary generator 결과는 weapon 199, armor 139, accessory 869, subweapon 239로 총 1,446개였고 dedicated 명시적 override는 109개였다.
- 최초 승인 bundle은 `Unsupported equipment category: 기타`로 실패했다. Raw 6개·총 254,206개와 normalized 6개가 commit되고 equipment는 0개, 상태는 `failed`였다.
- Validator에 `기타`, `엠블렘/파워소스`를 포함하고 nullable `requiredClassOverride`가 없으면 `createMany` 입력에서 필드를 생략해 SQL `NULL`을 기록하도록 수정했다. 집중 테스트 18개, DB typecheck, 1,446개 입력 사전 검증이 통과했다.
- Partial data를 확인한 뒤 destructive 재실행 없이 기존 admin API `startImport`/`seedEquipment`/`complete`로 equipment만 수동 재개했고 exit `0`이었다.
- 최종 read-only 검증에서 production `1.2.419`는 `ready`, `releasedOn = 2026-09-17`이었다. Raw와 normalized 6개 count는 manifest 순서대로 각각 `341/11295/54181/9490/173665/5234`, equipment는 1,446개였다.
- Weapon 199개는 catalog FK와 전부 정확히 join되었고 SQL `NULL` override 90개, `requiredClass`와 일치하는 명시적 override 109개였다. Subweapon 239개는 catalog 부재로 FK `NULL`이었다.
- 버전 지정 조회에서 `1.2.419`의 일반 무기는 타입 기본값, 전용 무기는 명시적 override를 사용했고 `1.2.424`의 같은 두 아이템은 legacy 값을 사용했다. 기본 최신 ready 조회는 계속 `1.2.424`를 선택했다. 브라우저 검증은 수행하지 않았다.
- 기존 ready `1.2.424`와 FK 미연결 상태는 변경되지 않았다. `1.2.424` safe backfill은 미실행이고 seed 재실행은 미검증이며 P05 전체 소비자 경로는 확인하지 않았으므로 `REQ001` 전체를 완료 처리하지 않는다.

## 2026-11-04: 1.2.424 비활성화 검증

- 실행 전 `1.2.424`와 `1.2.419`는 모두 `ready`였다. `1.2.424`는 raw 파일 6개·레코드 245,358개, 정규화 테이블별 `333/10862/51921/9109/167503/5630`개, equipment 1,446개였다. `1.2.419`는 raw 파일 6개·레코드 254,206개, 정규화 테이블별 `341/11295/54181/9490/173665/5234`개, equipment 1,446개였다.
- 기존 공개 admin API `softDeleteGameDataVersion('1.2.424')`만 실행해 상태를 `deleted`로 변경했다. 물리 삭제, migration, seed, 다른 버전 변경은 수행하지 않았다.
- 실행 후 `1.2.424`는 `deleted`, `1.2.419`는 `ready`였다. 두 버전의 raw·정규화·equipment 수와 파일별 raw 수 및 equipment 카테고리별 수는 실행 전과 같았다.
- `ready` 조회 결과는 `1.2.419`만 포함했고 `1.2.424`의 `ready` 일치 결과는 없었다. 기본 최신 `ready` 버전과 기본 equipment 조회는 `1.2.419`를 선택했으며, `1.2.424`를 명시한 equipment 조회는 0개를 반환했다.
- 파일·GOAL·ROADMAP은 변경하지 않았으며 Phase 완료를 주장하지 않는다.

## 2026-11-04: Equipment repository mock 테스트 체크포인트

- 새 `equipment.repo.test.ts` mock repository 테스트는 기본 최신 `ready` 버전 조회 조건과 inherited·override·legacy mapping을 검증하며, 명시한 `deleted` 버전은 equipment query에서 제외됨을 검증한다.
- 집중 테스트는 2/2, exit `0`; `@maple/db` typecheck는 exit `0`; `git diff --check`는 exit `0`이었다.
- 테스트는 live DB나 app consumer가 아니라 `ready` 버전 resolution을 mock으로 검증한다. `1.2.424`가 `deleted`, `1.2.419`가 `ready`인 상태는 앞선 체크포인트에서 검증했다.
- DB write는 수행하지 않았다. GOAL·ROADMAP 완료 표시는 변경하지 않았으며 P02~P05는 미완료다.
