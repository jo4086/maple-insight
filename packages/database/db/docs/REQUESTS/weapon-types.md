# 전역 `equipment.weapon_types` 구현 상태

- **요구사항:** 승인된 [`weapon-types-requirements.md`](../REQUIREMENTS/weapon-types-requirements.md)가 이전 범용 override 테이블 설계를 대체함
- **수명:** 게임 데이터 버전에 속하지 않는 전역 카탈로그
- **작성 완료:** Prisma 모델, migration 파일, 공유 타입, seed repository와 CLI
- **실행 안 함:** DB migration 적용 0회, weapon type seed 실행 0회

관련 문서: [`SPEC`](../SPEC/weapon-types.md) · [`ROADMAP`](../ROADMAP.md) · [`현재 GOAL`](../GOAL/weapon-types.md)

## 1. 모델과 제약

[`schema.prisma`](../../prisma/schema.prisma)의 `WeaponType`과 [`20261027000000_add_weapon_types`](../../prisma/migrations/20261027000000_add_weapon_types/migration.sql)가 `equipment.weapon_types`를 정의한다.

| 필드                      | 구현 규칙                                                     |
| ------------------------- | ------------------------------------------------------------- |
| `id`                      | DB 자동 생성 `bigint` 단독 PK                                 |
| `part`, `normalized_part` | 표시명과 정규화명. `(category, normalized_part)` unique       |
| `category`                | `weapon` 또는 `subWeapon`                                     |
| `class_group_keys`        | 직업군 제한 배열                                              |
| `allowed_job_ids`         | 직업 ID 제한 배열. 별도 관계 테이블 없음                      |
| `availability_mode`       | `common`, `class_groups`, `job_ids` 중 하나                   |
| `is_dedicated`            | `job_ids` 한 개일 때 전용 타입 표현                           |
| `hand_type`               | `weapon`은 `oneHanded` 또는 `twoHanded`; `subWeapon`은 `NULL` |
| `weapon_constant`         | `weapon`은 양수 필수; `subWeapon`은 `NULL`                    |
| `hero_weapon_constant`    | 선택적 히어로 최종 상수; `subWeapon`은 `NULL`                 |
| `attack_speed`            | `weapon`은 선택적 1~8; `subWeapon`은 `NULL`                   |

`availability_mode` CHECK가 `class_group_keys`와 `allowed_job_ids`의 활성 범위를 상호 배타적으로 제한한다. `allowed_job_ids`는 전용 직업 등 직업군만으로 표현할 수 없는 타입에 사용하며 추가 테이블을 만들지 않는다. Migration의 `weapon_types_hero_weapon_constant_check`는 히어로 상수를 한손검·두손검·한손도끼·두손도끼 네 파츠로 제한한다.

승인 프롬프트 표의 타입 표기는 예시다. 실제 구현은 주무기에서 `hand_type`과 `weapon_constant`를 필수로 강제하고 보조무기에서는 두 필드를 포함한 주무기 전용 필드를 `NULL`로 강제한다. `version`, `GameDataVersion` 관계, `mastery`, 범용 직업별 상수 override 테이블은 없다.

공유 계약은 [`weapon_type.ts`](../../../../game-data/equipment/src/types/weapon_type.ts)의 `WeaponTypeRecord`다. 주무기와 보조무기를 union으로 구분하고 히어로 전용 상수만 제공한다.

## 2. 착용 범위와 미완료 item override

타입 범위는 `class_group_keys` 또는 `allowed_job_ids`에 저장된다. 요구사항상 개별 아이템에 `requiredClass`가 있으면 타입 기본 범위를 합치지 않고 완전히 대체해야 한다.

이 item-level override는 구현되지 않았다. [`builder.ts`](../../../../game-data/equipment/src/information/weapon/builder.ts)의 `WeaponMetaInput`은 `requiredClass`를 입력 필드에서 제외하고 타입 메타의 값을 항상 주입한다. 또한 현재 [`EquipmentItem`](../../prisma/schema.prisma)에는 `weapon_type_id`가 없다. 따라서 현재 item 행은 전역 카탈로그와 연결되지 않고 타입 범위를 자동 상속하지도 않는다. per-item override, 타입 식별자 매핑, 조회·계산 wiring은 명시적 미완료 요구사항이다.

## 3. 무기상수 호환성

일반 계산은 `weapon_constant`를 사용한다. 히어로이고 `hero_weapon_constant`가 `NULL`이 아니면 해당 값을 보정치가 아닌 최종 상수로 사용한다.

[`weapon.ts`](../../../../game-data/equipment/src/rule/weapon/weapon.ts)에서 확인한 히어로 예외는 네 개다.

| 타입     | 기본값 | 히어로 값 |
| -------- | -----: | --------: |
| 한손검   |   1.24 |      1.34 |
| 한손도끼 |   1.20 |      1.34 |
| 두손검   |   1.34 |      1.44 |
| 두손도끼 |   1.34 |      1.44 |

같은 정적 map에는 팔라딘 한손둔기 `1.24` override가 유지된다. 새 테이블은 이를 표현하지 못하므로 호환성 공백이 남는다. 정적 `weaponConstantOverrideMap`은 제거하지 않았고 DB 계산 전환 전에 처리 방식을 결정해야 한다.

## 4. Seed 구현과 실행 상태

- [`seed-weapon-types.repo.ts`](../../src/admin/seed-weapon-types.repo.ts)는 transaction 안에서 `(category, normalized_part)`를 비교해 동일 행을 건너뛰고 충돌 행을 거부한다.
- [`seed-weapon-types.ts`](../../../data-admin/src/seed-weapon-types.ts)는 검증된 정적 주무기 정의를 DB row로 변환한다.
- [`data-admin/package.json`](../../../data-admin/package.json)에 `pnpm --filter @maple/data-admin seed:weapon-types` 실행 명령이 작성되어 있다.
- 코드 기반 seed 입력은 주무기 35개, 전용 타입 17개, 히어로 override 4개다. 모든 `attack_speed`는 `NULL`이다.
- in-memory 생성 검증은 무기 item 199개, 일반 한손검 상수 `1.24`, 튜너 `requiredClass` `아델`, 히어로 한손검 상수 `1.34`를 확인했다. 히어로 variant는 정적 override map 결과이며 item별 `requiredClass` override 구현 증거가 아니다.
- 사용자 소유 seed 데이터는 아직 반영하지 않았으며 추후 제공받는다. 확인되지 않은 값을 생성하지 않는다.
- migration 파일만 작성되었고 DB에는 적용하지 않았다. seed dry run 또는 입력 생성은 실제 DB seed가 아니다. 실제 seed 명령은 실행하지 않았다.

Migration 적용 승인과 seed 실행 승인은 서로 별도다. 어떤 승인이나 적용도 완료됐다고 간주하지 않는다. 두 작업 모두 실행 전 대상 `DATABASE_URL`과 입력을 확인해야 한다.

## 5. 검증 기록

실행한 검증과 범위는 [`REVIEW.md`](../REVIEW.md)에 기록한다. 실제 DB 상태 검증은 migration과 seed를 실행하지 않아 포함하지 않는다.
