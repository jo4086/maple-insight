# REQ001-P01 무기 타입 승인 설계

> **상태: 2026-11-02 사용자 승인, 2026-11-03 D4·D5 사용자 정정 및 D4 재정정.** 당시 승인과 공격속도 제거 기록은 날짜가 있는 이력으로 보존한다. 현재 D4는 이후 공격속도 복원 결정, D5는 JSONB 예외 결정이 대체한다. 이 문서는 구현, migration 적용, seed 실행 또는 DB 변경의 증거가 아니다.

- 요구사항: [`REQ001`](./REQUIREMENTS/REQ001.md)
- 수용 조건: [`REQ001-01`](./SPEC/REQ001/weapon-types.md)
- Phase 상태: [`ROADMAP`](./ROADMAP.md)
- 사용자 정정: [`REQUESTS/weapon-types-request`](./REQUESTS/REQ001/weapon-types.md)

## 승인된 결정 7개

### D1. 전역 타입과 버전별 아이템 연결

- 전역 `WeaponType`은 `BigInt` PK를 유지하고, 버전별 `EquipmentItem`에 nullable `weaponTypeId` FK를 추가한다.
- FK 삭제 정책은 `RESTRICT`다. 타입 삭제가 연결된 과거 아이템 의미를 바꾸면 안 된다.
- 입력 카테고리 `무기`는 `weapon`, `보조무기`는 `subWeapon`으로 명시 변환한다. part의 모든 공백을 제거한 `normalizedPart`로 조회하며 `(category, normalizedPart)`를 unique로 유지한다.
- nullable FK는 기존·미매칭 행과 방어구·장신구를 보존한다. 카탈로그 추가는 기존 아이템에 역사적 효과를 주지 않으며, 명시적 FK 없이는 소비하지 않는다.
- 기존 카탈로그 행의 의미·키를 조용히 바꾸지 않는다. 변경은 충돌로 보고하고 별도 승인한다.

### D2. 아이템별 착용 범위

- `EquipmentItem.requiredClassOverride`를 nullable JSON 컬럼으로 추가한다. SQL `NULL`은 타입 기본 착용 범위 상속이다.
- JSON 문자열 `"공용"`은 명시적 공용, 그 밖의 문자열 또는 배열은 타입 기본값과 합치지 않는 완전 대체다. 요구 레벨은 착용 범위 판정에 쓰지 않는다.
- 이 컬럼은 `weapon`·`subWeapon`에만 선택적으로 허용한다. 방어구·장신구에는 쓰지 않는다.
- 기존 non-null `requiredClass` JSON은 표시·레거시 소비용 최종 유효값으로 유지한다. 타입 기본 또는 override에서 계산해 함께 저장한다.
- FK 없는 기존 행은 현재 `requiredClass`를 그대로 보존한다. Backfill 후보는 기존 유효값과 새 타입 기본값을 비교해, 다르면 확인된 아이템별 override로 보존하거나 연결을 보류한다. 같아도 명시적 공용 등 출처가 불명확하면 연결을 보류한다. 출처를 임의 추론하지 않는다.

### D3. 생성·적재·조회 호환성

- `game-data/equipment` 입력부터 generator JSON, `db` 적재까지 상속 없음과 명시적 override를 구분해 전달하고, 적재 시 레거시 `requiredClass` 최종값도 계산한다.
- 현재 아이템 이름, variant 분리, 정적 무기상수 경로는 유지한다. 기존 FK 없는 행과 미전환 소비자는 저장된 `requiredClass`·기존 정적 계산으로 fallback한다.
- 읽기 repository가 타입 기본값, override, 레거시 최종값을 한 규칙으로 제공한다. P05 전까지 기존 계산 경로를 제거하지 않는다.

### D4. 카테고리와 속성 소유권 — 2026-11-03 재정정

- 주무기는 손 타입·기본 무기상수를 필수로 하고 보조무기는 주무기 전용 필드를 `NULL`로 둔다. 보조무기 최종 범위와 값은 사용자 최종 데이터 승인 전 확정하지 않는다.
- 2026-11-03의 앞선 공격속도 제거 결정은 역사로 보존한다. 이후 사용자 정정에 따라 공격속도는 다시 `equipment.weapon_types`가 소유한다.
- Prisma는 nullable `attackSpeed` `SmallInt`를 사용한다. SQL CHECK는 주무기의 `NULL` 또는 `1..8`과 보조무기의 `NULL`을 허용한다. 사용자 제공 36행 원천은 각 주무기의 숫자 값을 소유한다.
- 기존 행은 복원 migration만으로 `NULL`을 유지한다. 같은 key의 원천 숫자와 다르므로 seed가 충돌을 거부하며 조용히 갱신하지 않는다. 실제 채움은 migration과 seed의 별도 승인 및 기존 행 처리 결정 뒤에만 가능하다.
- `classGroupKeys`·`allowedJobIds`는 도메인 코드이고 기존 `requiredClass`는 한국어 표시값이다. P02에서 명시적 매핑·검증을 설계하며 값을 추측하지 않는다.

### D5. 무기상수 호환성 — 2026-11-03 결정으로 대체

- 2026-11-02 승인 당시의 `hero_weapon_constant` 전용 구조와 도끼 예외 범위는 역사적 결정으로 보존하지만 현재 설계가 아니다.
- 현재 구조는 별도 테이블·boolean 없이 nullable `weapon_constant_overrides` JSONB 배열 하나를 사용한다. SQL `NULL`은 예외 없음이며 non-null 값은 `{jobId, weaponConstant}` 객체의 비어 있지 않은 배열이다. 단일 scalar pair는 한손둔기의 히어로·팔라딘 두 예외를 표현하지 못하므로 거부한다.
- 현재 확정값은 히어로 한손검·한손둔기 `1.34`, 두손검·두손둔기 `1.44`, 팔라딘 한손둔기 `1.24`다. 기본값은 한손검 `1.24`, 샤이닝 로드 `1.2`, 에너지 소드 `1.3125`다.
- 직업 전용 `jobId` 지정은 현재 seed에서 비워 두고 직업 데이터에서 추후 파생한다. P05 회귀 검증 전 현재 계산 경로를 제거하지 않는다.

### D6. 카탈로그 우선 전환

- 2026-11-02 승인 당시 정적 정의 기반 주무기 35종은 후보였고 사용자 최종 seed가 아니었다. 현재 사용자 원천은 카르타와 정확한 숫자 공격속도를 포함한 36행 JSON으로 확정되었으며 출처·고유성·카테고리별 필수값 검증은 여전히 필요하다.
- 승인된 최종 카탈로그를 적재한 뒤에만 신규·기존 아이템 FK를 할당하거나 backfill한다. 기존 행은 검증 가능한 것만 제자리에서 연결해 ID와 표시값을 보존한다.
- 미매칭, 중복 `(category, normalizedPart)`, 입력과 카탈로그의 category/part 불일치는 거부하고 목록으로 보고한다. 출처·유효값이 불명확한 기존 행은 연결을 보류하고 검토 목록에 남긴다. 임의 보정이나 충돌 행 덮어쓰기를 금지한다.
- 기존 행의 backfill은 별도 transaction으로 처리하고 실패 시 rollback한다. 신규 버전 장비 적재 시 필요한 FK 할당은 해당 장비 seed transaction에 포함한다. 현 bundle은 raw·게임 데이터·장비 seed가 각각 독립 transaction이므로 전체 rollback을 보장하지 않는다.
- 현재 장비 seed는 `ensureGameDataVersion` 후 버전 행 `deleteMany`를 수행해 기존 ID를 잃고 `ready`를 `importing`으로 바꿀 수 있다. 기존 ready 버전을 이 경로로 재적재하지 않으며, 재적재가 필요하면 별도 보존·복구 절차를 설계하고 승인받는다.

### D7. Phase와 승인 게이트

- P01은 이 설계의 검토와 2026-11-02 사용자 승인을 근거로 종료한다. 이 승인은 구현이나 DB 실행 승인을 대신하지 않는다.
- P02는 승인된 설계의 additive migration 파일과 코드·회귀 테스트만 작성한다. 기존 committed migration은 수정하지 않고 DB에 적용하지 않는다. 작성된 `20261102000000_link_equipment_weapon_types` migration도 적용하지 않았다.
- P03은 별도 migration 적용 승인 후 대상·백업·rehearsal을 확인하고 적용한다. destructive down/reset은 사용하지 않는다.
- P04는 사용자 최종 데이터 검증 승인과 seed 실행 승인을 분리한다. 승인 후 카탈로그 적재와 FK backfill을 검증한다.
- P05는 읽기 소비자, 버전 복사, soft delete, 최신/지정 ready-version 조회, 이름·variant, 팔라딘 예외를 포함해 회귀 검증한다.

## 소유권과 데이터 보존

- `db`: Prisma 관계·제약, additive migration, transaction, seed 검증·저장, repository와 fallback을 소유한다.
- `data-admin`: 승인된 입력 경로·버전·실행 진입점과 실행 전 확인을 소유하며 DB 로직을 복제하지 않는다.
- `game-data/equipment`: 타입·아이템의 정적 원천, 이름·variant, 기존 상수와 명시적 override 입력을 소유한다.
- `generator`: 원천의 상속/override 구분과 최종 `requiredClass`를 JSON에 손실 없이 출력한다.
- 읽기 소비자: `db` repository 계약을 사용하고 FK가 없는 과거 행은 레거시 값으로 처리한다.
- 적용 전 대상 백업과 복구 가능성을 확인하고 rehearsal한다. 실패 시 transaction rollback 또는 백업 복구를 사용하며 `migrate reset`, destructive down, 기존 행 일괄 삭제를 복구 수단으로 쓰지 않는다.

## 수용 조건 대응

- **AC01:** D2·D3이 상속, 명시적 공용, 완전 대체, 레벨 무시와 레거시 최종값을 정의한다.
- **AC02:** 정정된 D5가 기본 상수와 직업별 JSONB 배열 예외, 레거시 호환 경계를 정의한다.
- **AC03:** D1·D4가 카테고리 매핑, nullable 공격속도와 `1..8` 범위, 보조무기 `NULL`을 정의한다.
- **AC04:** D6이 35종 후보에서 36행 사용자 원천으로 바뀐 이력, 충돌 거부, transaction 재실행 경계를 정의한다.
- **AC05:** D1·D3·D7이 FK, 소비자 fallback, 단계별 회귀와 migration/seed 별도 승인을 정의한다.

## 승인 후 남은 데이터와 검증 경계

- 기존 `requiredClass: "공용"`의 provenance를 확인할 수 없으면 D2에 따라 레거시 값만 보존하고 연결을 보류한다.
- 보조무기 최종 카탈로그의 범위와 실제 값은 미해결이며 사용자 최종 데이터가 필요하다.
- 사용자 제공 36행 원천은 `packages/game-data/equipment/data/weapon-types.json`이며 카르타와 36개 숫자 공격속도를 포함한다. 기존 행의 `NULL` 공격속도와 충돌할 때 덮어쓸지 보존할지는 별도 확인 전 결정하지 않는다.
- 오래된 ready 버전은 D3의 관계·fallback 계약으로 구현하고 P02·P05에서 검증한다.

이 설계 검토 당시에는 소스 파일만 대조했고 실제 DB를 검사하지 않았다. 이후 사용자가 migration을 독립 적용했으며 read-only status에서 18개 migration이 모두 적용된 상태를 확인했다. 사용자 승인 아래 최초 weapon type seed는 실패 rollback과 nullable JSON SQL `NULL` 수정 뒤 36행을 삽입했다. Assistant는 migration을 적용하지 않았고 seed 재실행, FK/backfill과 그 밖의 DB 불변식은 검증하지 않았다.
