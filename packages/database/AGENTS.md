# Database Agent Instructions

## 1. Scope

`packages/database/` 및 하위 패키지에 적용한다.

루트 `AGENTS.md`의 공통 규칙을 준수한다.

기존 코드와 패키지 구조를 분석한 뒤 작업한다.

## 2. Package Responsibilities

### `db`

- Prisma Schema 및 Migration 관리
- DB Client 및 Repository 관리
- 데이터 조회·저장·수정 로직 제공
- 공통 DB 관리 및 Seed 처리 로직 제공

### `data-admin`

- 초기 데이터 등록 및 관리 작업 실행
- Seed 실행 진입점과 입력 데이터 경로 관리
- `@maple/db`의 기존 API 활용

위 역할은 현재 구조에 대한 기본 기준이다.

실제 구현을 확인하고 세부 책임을 확정한다.

두 패키지에 동일한 DB 접근 로직을 중복 구현하지 않는다.

## 3. Documentation

다음 문서를 참조한다.

- `db/README.md`
- `data-admin/README.md`
- `db/docs/ARCHITECTURE.md`
- `db/docs/SPEC/README.md` 및 연결된 요구사항 문서
- `db/docs/GOAL/README.md` 및 현재 Phase 목표
- `db/docs/ROADMAP.md` 및 단계별 상세 문서
- `db/docs/REVIEW.md` 및 검증 기록
- `db/docs/REQUESTS/README.md` 및 개별 요청 문서

문서 체계는 기존 `apps/electron/docs/`를 참고한다.

문서가 존재하지 않으면 작업 목적에 필요한 문서만 생성한다.

공통 설계를 두 패키지에 중복 작성하지 않고 링크로 연결한다.

## 4. Execution

1. 기존 코드와 패키지 의존 관계를 분석한다.
2. 관련 README 및 ARCHITECTURE 문서를 확인한다.
3. 현재 GOAL과 ROADMAP의 작업 단계를 확인한다.
4. SPEC 및 관련 REQUESTS 문서를 확인한다.
5. 신규 DB 구조가 필요하면 설계 문서를 작성한다.
6. 설계 리뷰를 수행하고 사용자 승인을 기다린다.
7. 승인된 설계에 따라 구현한다.
8. 관련 테스트 및 정적 검사를 수행한다.
9. REVIEW에 검증 결과와 미해결 사항을 기록한다.
10. 검증 완료 항목만 ROADMAP과 GOAL에 반영한다.

기존 기능의 단순 수정에는 불필요한 설계 승인 절차를 추가하지 않는다.

## 5. Schema & Migration

- 기존 Prisma 모델, 컬럼명, 타입 및 스키마 구성을 우선 확인한다.
- 기존 데이터와의 호환성을 유지한다.
- 테이블 및 컬럼의 삭제·변경은 영향 범위를 먼저 분석한다.
- Migration 파일을 생성하는 것과 실제 DB에 적용하는 것을 구분한다.
- 실제 Migration 적용은 사용자 승인 후 실행한다.
- `prisma db push`, `migrate reset` 등 데이터 변경·초기화 명령을 임의로 실행하지 않는다.

## 6. Seed & Data Integrity

- 기존 Seed 실행 구조를 우선 재사용한다.
- Seed는 가능한 한 멱등성을 보장한다.
- 데이터의 고유성과 참조 무결성을 검증한다.
- 기존 데이터를 무조건 삭제하거나 덮어쓰지 않는다.
- 확인되지 않은 데이터를 임의로 생성하지 않는다.
- 실제 DB에 Seed를 실행하기 전에 사용자 승인을 받는다.
- 관련 데이터의 원자적 저장이 필요하면 Transaction을 사용한다.

## 7. Cross-Package Changes

`packages/equipment`, `packages/game-data`, `apps/electron` 등 다른 영역의 수정이 필요한 경우 변경 범위와 영향을 먼저 분석한다.

기존 정적 데이터 정의를 DB로 이전하더라도 호환성을 확인하기 전에는 제거하지 않는다.

다른 패키지의 구조나 공개 API를 임의로 변경하지 않는다.

## 8. Constraints

- 불필요한 파일, 디렉터리 및 의존성을 추가하지 않는다.
- 기존 DB 접근 계층을 우회하지 않는다.
- Schema와 Seed 로직을 불필요하게 중복 구현하지 않는다.
- 테스트 성공 여부를 확인하지 않고 완료 처리하지 않는다.
- 설계 승인과 실제 DB 적용 승인을 별도로 관리한다.
- 참고 문서는 가능한 200줄 이하로 유지한다.
