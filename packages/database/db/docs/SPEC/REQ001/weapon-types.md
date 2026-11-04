# REQ001-01: 전역 무기 타입 동작 명세

- **상위 요구사항:** [`REQ001`](../../REQUIREMENTS/REQ001.md)
- **사용자 결정:** [`REQUESTS/weapon-types-request.md`](../../REQUESTS/REQ001/weapon-types.md)
- **검증 이력:** [`REVIEW.md`](../../REVIEW.md)

이 문서는 `REQ001`의 수용 조건을 구현·검증 가능한 단위로 구분한다. 확정값과 원천 소유권은 상위 요구사항이 소유한다.

## 수용 조건

### AC01. 착용 범위

- 무기 타입의 기본 착용 범위가 정의되어야 한다.
- 아이템별 착용 조건이 없으면 타입 기본값을 사용해야 한다.
- 아이템별 착용 조건이 있으면 타입 기본값과 합치지 않고 완전히 대체해야 한다.
- 명시적 공용과 조건 없음이 구별되어야 한다.
- 요구 레벨은 착용 가능 직업군 결정에 사용하지 않아야 한다.
- 현재 seed에는 dedicated job ID를 지정하지 않아야 한다.

### AC02. 무기상수

- 일반 계산은 타입의 기본 무기상수를 사용해야 한다.
- SQL `NULL` override는 예외 없음으로 해석해야 한다.
- non-null override는 비어 있지 않은 `{jobId, weaponConstant}` 객체 배열이어야 한다. 배열이 아닌 scalar pair는 거부해야 한다.
- 현재 직업과 같은 `jobId` 항목이 있으면 그 양수 decimal 문자열을 최종 상수로 사용하고, 없으면 기본값을 사용해야 한다.
- 한손둔기는 hero `1.34`와 paladin `1.24`를 함께 표현해야 한다.
- 한손검 hero `1.34`, 두손검·두손둔기 hero `1.44`를 표현해야 하며 현재 원천에는 히어로 도끼 예외가 없어야 한다.
- 한손검 `1.24`, 샤이닝 로드 `1.2`, 에너지 소드 `1.3125` 기본값을 보존해야 한다.

### AC03. 주무기와 보조무기

- `equipment.weapon_types.attack_speed`는 nullable `SMALLINT`여야 한다.
- 주무기는 hand type과 기본 무기상수를 가져야 하며, 공격속도는 SQL `NULL` 또는 `1..8` 정수여야 한다.
- 보조무기는 주무기 전용 속성, override, 공격속도를 SQL `NULL`로 유지해야 한다.
- 카테고리별 필수값과 `NULL` 규칙은 스키마와 입력 검증에서 일치해야 한다.

### AC04. 데이터 검증과 충돌

- `packages/game-data/equipment/data/weapon-types.json`의 카르타 포함 36행을 단일 seed 원천으로 읽어야 한다.
- unique key, 정규화 파츠명, 직업군 코드, 카테고리별 필드, override 배열과 사용자 제공 36개 숫자 `attackSpeed`를 write 전에 검증해야 한다.
- 같은 key의 기존 행이 동일하면 ID를 유지하고 건너뛰어야 한다.
- 같은 key의 값이 다르면 임의로 덮어쓰지 않고 전체 write 전에 충돌로 거부해야 한다. 기존 행의 `NULL` 공격속도와 원천의 숫자도 충돌이다.
- 기존 행이 있다면 충돌 처리 방침을 확인하기 전 그 행을 갱신하거나 seed를 실행하지 않아야 한다. 최초 실행 전 DB 행은 없었다.

### AC05. 연결, migration과 회귀

- 버전별 `EquipmentItem`은 승인된 방식으로 전역 무기 타입을 식별해야 한다.
- 조회와 계산 경로가 타입 기본값, 직업별 상수 override, 아이템별 착용 override와 FK 없는 레거시 fallback을 일관되게 사용해야 한다.
- 교체 migration은 기존 non-null 히어로 값을 배열로 보존해야 하며 기존 도끼 값도 임의 삭제하지 않아야 한다.
- 현재 원천과 legacy 도끼 값의 불일치는 실제 적용 전 별도 확인해야 한다.
- Migration 적용과 seed 실행은 각각 별도 승인을 받은 뒤 실제 DB에서 검증해야 한다.

## 현재 구현 경계

현재 구현과 검증 사실은 [`REVIEW.md`](../../REVIEW.md)에 기록한다. 사용자가 관련 migration을 독립적으로 적용했고 read-only status에서 18개 migration이 모두 적용된 상태를 확인했다. 사용자 승인 아래 최초 weapon type seed가 36행을 삽입했으며 검증한 값은 원천 JSON과 일치했다. `1.2.419` 주무기 199개의 catalog FK 연결도 검증했다. Assistant는 migration을 적용하지 않았다. Seed 재실행과 비활성화된 `1.2.424`의 기존 행 backfill, 그 밖의 DB 불변식은 검증하지 않았으므로 `REQ001-P02`, `REQ001-P03`, `REQ001-P04`는 완료로 표시하지 않는다.
