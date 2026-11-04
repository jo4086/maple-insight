# REQ001-P02: 무기 타입 연결과 예외 계약 구현

- **요구사항:** [`REQ001`](../../REQUIREMENTS/REQ001.md)
- **대상 명세:** [`REQ001 무기 타입 명세`](../../SPEC/REQ001/weapon-types.md)
- **상태와 의존성:** [`ROADMAP.md`](../../ROADMAP.md)
- **승인 설계와 정정:** [`ARCHITECTURE-weapon-types-proposal.md`](../../ARCHITECTURE-weapon-types-proposal.md)
- **사용자 결정:** [`REQUESTS/weapon-types-request.md`](../../REQUESTS/REQ001/weapon-types.md)

## 구현 범위

- 버전별 `EquipmentItem`과 전역 `WeaponType`의 nullable FK, `RESTRICT` 삭제 제약과 아이템별 착용 override를 유지한다.
- `equipment.weapon_types`에 nullable `attackSpeed` `SmallInt`를 두고 주무기 `NULL` 또는 `1..8`, 보조무기 `NULL`을 검증한다.
- `hero_weapon_constant`를 nullable `weapon_constant_overrides` JSONB 배열로 대체한다. 별도 테이블이나 boolean은 추가하지 않는다.
- SQL `NULL`, 비어 있지 않은 객체 배열, 양수 decimal 문자열, 배열 내 unique `jobId`를 검증하고 scalar pair를 거부한다.
- 기본 상수와 히어로·팔라딘 예외를 확정값대로 resolver와 seed 경로에 전달한다.
- 사용자 제공 `packages/game-data/equipment/data/weapon-types.json` 36행을 읽고 카르타를 포함해 검증한다.
- dedicated job ID는 seed에 넣지 않고 추후 직업 데이터에서 파생한다.
- 이전 제거 migration 뒤에 nullable 공격속도 컬럼과 CHECK를 복원하는 additive migration 파일 및 대표·경계 회귀 테스트를 작성한다.

## 종료 조건

- [`REQ001` 명세](../../SPEC/REQ001/weapon-types.md)의 AC01~AC05 중 P02 구현 범위를 정적 검사와 관련 테스트로 검증해야 한다.
- JSONB shape, unique job ID, 양수 문자열 상수, 한손둔기 2개 예외와 fallback을 검증해야 한다.
- 36행·카르타·사용자 제공 36개 숫자 공격속도·확정 기본값·예외값과 dedicated job ID 유예를 검증해야 한다.
- 기존 행 ID 보존과 충돌 거부가 확인되어야 한다.
- 실행한 검사 결과만 [`REVIEW.md`](../../REVIEW.md)에 기록해야 한다.

## 수동 실행 경계

P02 범위는 migration 파일 작성까지다. Migration 적용, seed 실행, `prisma db push`, reset, FK 연결과 backfill은 각각 승인 및 검증 경계를 따른다. 사용자 수동 적용 절차는 [`db README`](../../../README.md#manual-migration-user-only)에 있다.

## 2026-11-03: 최초 weapon type seed 검증 근거

- Nullable JSON의 SQL `NULL` 저장 오류와 rollback, repository 수정, 36행 최초 삽입 및 원천값 일치가 기록되었다.
- 36개 unique key, 공격속도, 기본 decimal, override pair와 한손둔기 hero `1.34`·paladin `1.24`를 확인했다.
- 상세 실행 및 미검증 경계는 [`REVIEW.md`](../../REVIEW.md#2026-11-03-최초-weapon-type-seed-실제-db-실행)에 있다.

## 2026-11-03: equipment 연결 체크포인트

- 새 equipment seed의 주무기 catalog 연결, 보조무기 `NULL`, legacy availability 검증과 dedicated override를 집중 테스트했다.
- Ready `1.2.424`의 weapon 199개와 subweapon 239개 FK가 모두 `NULL`임을 read-only 검사로 확인했고, dedicated legacy 109개는 유예했다.
- 상세 제약, 테스트와 미실행 경계는 [`REVIEW.md`](../../REVIEW.md#2026-11-03-equipment-catalog-연결-구현-체크포인트)에 있다.

## 2026-11-03: 1.2.419 import 검증 체크포인트

- Partial import를 보존하고 equipment만 재개해 production `1.2.419`의 1,446개 장비를 검증했다.
- Weapon 199개는 catalog FK와 일치했고 override는 SQL `NULL` 90개와 명시적 109개였다. Catalog가 없는 subweapon 239개 FK는 `NULL`이었다.
- 상세 count, 실패 복구와 잔여 검증은 [`REVIEW.md`](../../REVIEW.md#2026-11-03-12419-장비-import-검증-체크포인트)에 있다.
