# 2026-11-03 무기 타입 공격속도 정정

- **요구사항:** [`REQ001`](../../REQUIREMENTS/REQ001.md)
- **동작 명세:** [`REQ001-01`](../../SPEC/REQ001/weapon-types.md)

> 공격속도는 직업특성이기에 웨폰타입 테이블에서 제거

## 적용 범위

- `equipment.weapon_types`는 공격속도를 소유하지 않는다.
- 공격속도는 직업 설정의 책임으로 분류한다.
- 직업 설정 측 저장 구조나 구현 완료는 이 요청에서 주장하지 않는다.
- 이 정정은 2026-11-02 승인 설계 중 공격속도 부분만 대체하며 나머지 승인 기록과 P02 진행 기록은 보존한다.
- 현재 스키마와 코드는 이 정정을 아직 반영하지 않았다.
- `20261102000000_link_equipment_weapon_types` migration은 작성만 되었고 적용되지 않았다. Weapon type seed도 실행되지 않았다.

## 2026-11-03 무기상수 예외 구조 정정

> 무기상수 예외는 별도 테이블이나 boolean 없이 nullable `weapon_constant_overrides` JSONB 배열로 관리한다.

- SQL `NULL`은 예외 없음이다. non-null 값은 `{ "jobId": string, "weaponConstant": string }` 객체의 비어 있지 않은 배열이다.
- 단일 직업·값 scalar pair는 허용하지 않는다. 한손둔기는 히어로 `1.34`와 팔라딘 `1.24` 두 항목이 필요하다.
- 기본 상수는 한손검 `1.24`, 샤이닝 로드 `1.2`, 에너지 소드 `1.3125`다.
- 히어로 예외는 한손검·한손둔기 `1.34`, 두손검·두손둔기 `1.44`다. 팔라딘 예외는 한손둔기 `1.24`다.
- 직업 전용 `jobId` 지정은 직업 데이터에서 추후 파생하며 현재 seed에는 넣지 않는다.
- 사용자 제공 36행 원천은 `packages/game-data/equipment/data/weapon-types.json`이며 카르타를 포함한다.
- 이 결정은 2026-11-02 승인 설계의 D5와 기존 `hero_weapon_constant` 전용 구조를 대체한다. P01의 다른 결정과 당시 증거는 보존한다.
- `20261104000000_replace_hero_weapon_constant_with_overrides` migration은 작성만 되었고 적용되지 않았다. Weapon type seed도 실행되지 않았다.

## 2026-11-03 공격속도 소유권 재정정 — 현재 결정

> 공격속도는 다시 `equipment.weapon_types`가 소유한다. 위 공격속도 제거 결정은 당시 이력으로 보존하지만 현재 계약을 정의하지 않는다.

- 사용자 제공 `packages/game-data/equipment/data/weapon-types.json`은 카르타를 포함한 36행 각각에 정확한 숫자 `attackSpeed`를 제공한다.
- Prisma `WeaponType.attackSpeed`는 nullable `SmallInt`다.
- SQL CHECK는 주무기에서 `attack_speed IS NULL OR attack_speed BETWEEN 1 AND 8`, 보조무기에서 `attack_speed IS NULL`을 요구한다.
- `20261105000000_restore_weapon_type_attack_speed`는 이전 제거 migration 뒤에 컬럼과 CHECK를 다시 추가하는 additive migration이다.
- 기존 행은 복원 migration만 적용하면 공격속도 `NULL`을 유지한다. 같은 key의 기존 `NULL`과 원천 숫자는 seed 충돌이며 조용히 갱신하지 않는다.
- 기존 행을 채우는 방침, migration 적용, seed 실행은 각각 별도 확인과 승인이 필요하다. 이번 문서 정정에서는 어느 것도 실행하지 않았다.
- `REQ001-P02`, `REQ001-P03`, `REQ001-P04`는 완료로 표시하지 않는다.
