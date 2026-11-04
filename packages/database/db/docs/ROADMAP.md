# Database Roadmap

이 문서는 [`REQ001`](./REQUIREMENTS/REQ001.md)의 Phase 상태를 소유한다. 요구사항 명세는 [`SPEC/REQ001/weapon-types.md`](./SPEC/REQ001/weapon-types.md), 승인 제안서는 [`ARCHITECTURE-weapon-types-proposal.md`](./ARCHITECTURE-weapon-types-proposal.md)에 있다. 작성된 코드와 정적 검증은 선행 작업이며 아래 Phase의 완료를 뜻하지 않는다.

| Phase | 목표 | 의존성 | 상태 |
| --- | --- | --- | --- |
| `REQ001-P01` | 설계 정합성 검토와 승인 | [`REQ001` 명세](./SPEC/REQ001/weapon-types.md) | 완료 |
| [`REQ001-P02`](./GOAL/REQ001/Phase02.md) | 연결, 공격속도, 아이템별 착용·무기상수 예외 계약, 회귀 테스트와 필요한 migration 파일 작성 | `REQ001-P01` 승인과 2026-11-03 정정 | 진행 중 |
| `REQ001-P03` | 별도 승인 후 migration 적용과 실제 DB 제약 검증 | `REQ001-P02` 검증 | 진행 중: 제약 확인, 실제 링크·backfill 미실행 |
| `REQ001-P04` | 36행 seed와 기존 행 충돌 방침 확인, 별도 승인 후 실행·재실행 검증 | `REQ001-P03`, 별도 사용자 확인 | 진행 중: weapon type 최초 실행 완료, equipment 재seed·재실행 미검증 |
| `REQ001-P05` | 소비자 경로와 기존 정적 계산 호환성 확인 및 최종 검증 | `REQ001-P02`~`REQ001-P04` | 대기: dedicated 데이터 출처·호환성 미확정 |

## Phase 경계

### REQ001-P01

전역 타입과 버전별 아이템의 연결, `NULL`과 아이템별 착용 대체 조건, 데이터 소유권을 결정했다. D5의 `hero_weapon_constant` 전용 구조는 2026-11-03 사용자 결정으로 대체되었고 나머지 역사적 승인은 보존한다. 승인 설계는 [`ARCHITECTURE-weapon-types-proposal.md`](./ARCHITECTURE-weapon-types-proposal.md), 종료 근거는 [`REVIEW.md`](./REVIEW.md#2026-11-02-req001-p01-설계-검토와-승인)에 있다.

### REQ001-P02

승인된 설계와 2026-11-03 정정 이력을 반영한다. 현재 계약은 nullable `attack_speed SMALLINT`, `weapon_constant_overrides` JSONB, 공격속도 숫자를 포함한 36행 원천과 충돌 거부를 포함한다. 필요한 migration 파일 작성까지만 포함하고 실제 DB 적용과 seed 실행은 포함하지 않는다. 범위와 종료 조건은 [`GOAL/REQ001/Phase02.md`](./GOAL/REQ001/Phase02.md)에 있다. 실행 근거는 [`REVIEW.md`](./REVIEW.md#2026-11-03-최초-weapon-type-seed-실제-db-실행)에 있다.

### REQ001-P03

Migration 적용 승인을 별도로 확인한 뒤 대상 DB 제약과 기존 데이터 호환성을 검증한다. Seed 실행 승인을 대신하지 않는다. FK `ON DELETE RESTRICT`, 공격속도·JSON CHECK와 기존 ready 데이터의 검증 근거 및 남은 backfill 경계는 [`REVIEW.md`](./REVIEW.md#2026-11-03-equipment-catalog-연결-구현-체크포인트)에 있다.

### REQ001-P04

카르타와 숫자 공격속도를 포함한 사용자 제공 36행 원천, 기존 행 충돌 방침, 최초 실행과 재실행을 검증한다. 기존 ready 버전은 재seed하지 않으며 제한적 backfill과 재실행은 별도 승인 경계를 따른다. 최초 seed 근거는 [`REVIEW.md`](./REVIEW.md#2026-11-03-최초-weapon-type-seed-실제-db-실행), equipment 연결 근거는 [`REVIEW.md`](./REVIEW.md#2026-11-03-equipment-catalog-연결-구현-체크포인트)에 있다.

### REQ001-P05

DB 소비자 경로와 기존 정적 계산의 호환성을 검증한다. Dedicated 무기의 데이터 출처와 기존 정적 계산 호환성을 확정하고 직업별 JSONB 예외의 동등성을 확인하기 전 정적 계산 경로를 제거하지 않는다.

각 Phase는 [`REVIEW.md`](./REVIEW.md)에 종료 조건의 검증 근거가 기록된 뒤에만 완료로 변경한다.

## 2026-11-03: 1.2.419 import 체크포인트

Production `1.2.419` import, weapon 199개 catalog 연결, dedicated override 109개, subweapon 239개 `NULL` FK와 남은 검증은 [`REVIEW.md`](./REVIEW.md#2026-11-03-12419-장비-import-검증-체크포인트)에 기록되어 있다.
