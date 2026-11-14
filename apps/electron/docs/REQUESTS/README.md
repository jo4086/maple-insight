# Electron 요청

독립 요청과 작은 개선 요청을 이 목차에서 관리한다. 신규 기능은 [REQUIREMENTS](../REQUIREMENTS/README.md)에서 관리한다. Phase 03 완료·검증 기록을 새 요청의 완료 근거로 사용하지 않는다.

| 요청                                                                 | 상태                                    | 요약                                                                  | SPEC                                                                                 | ROADMAP                                                 | GOAL                                                            | REVIEW                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Main process 구조 재정리](./main-process-architecture.md)           | 구현 완료·부분 검증                     | 얇은 bootstrap, app/runtime, 기능별 IPC와 도메인별 service 분리       | [프로세스 경계](./main-process-architecture.md#보존할-경계와-안전-조건)              | [단계 계획](./main-process-architecture.md#roadmap)     | [부분 완료](./main-process-architecture.md#goal)                | [단계별 검증과 미검증 범위](./main-process-architecture.md#review--구현-완료부분-검증-2026-11-13) |
| [버전 관리 확장](./version-management.md)                            | 진행 중 (부분 검증)                     | 탐색 접기/펼치기, 출시일 수정, 전체 복제, 소프트 삭제, 아이콘 작업 UI | [§8.2](../SPEC/01-foundation.md#spec-version-management)                             | [의존성과 순서](./version-management.md#roadmap)        | [완료 조건](./version-management.md#goal)                       | [검증 상태](./version-management.md#review)                                                       |
| [통합 비교 작업공간](./comparison-workspace.md)                      | refinement 검증 완료 (route 확인 대기)  | 전역 현재 버전, 저장 결과 자동 열기, 다섯 파일 batch, 3-panel 결과    | [`DIF-032`~`DIF-046`](../SPEC/03-diff-edit.md#spec-comparison-workspace)             | [범위와 의존성](./comparison-workspace.md#roadmap)      | [부분 검증](./comparison-workspace.md#goal)                     | [검증 기록](./comparison-workspace.md#review)                                                     |
| [버전 비교 결과 화면 개선](./version-comparison-results.md)          | 대체됨 (기록 유지)                      | 통합 비교 작업공간이 `DIF-020`~`DIF-031`의 개요·상세 분리를 대체      | [`DIF-020`~`DIF-031`](../SPEC/03-diff-edit.md#spec-diff-base)                        | [적용 결과](./version-comparison-results.md#roadmap)    | [과거 완료 조건](./version-comparison-results.md#goal)          | [과거 검증](./version-comparison-results.md#review)                                               |
| [아이콘 의미 정책](./icon-semantics.md)                              | 완료 (2026-10-15)                       | 현재 UI 방향 아이콘의 의미·표시·접근성 기준                           | [`APP-010`·`APP-011`](../SPEC/01-foundation.md#icon-semantics)                       | [적용 결과](./icon-semantics.md#roadmap)                | [현재 UI 범위 완료](./icon-semantics.md#goal)                   | [검증 완료](./icon-semantics.md#review)                                                           |
| [Renderer App 책임 분리](./renderer-app-refactoring.md)              | 진행 중 (자동 검증 완료)                | React Router v7 도입과 App·라우트·기능 상태 분리                      | [`APP-001`~`APP-009`](../SPEC/01-foundation.md)                                      | [적용 범위](./renderer-app-refactoring.md#roadmap)      | [native 확인 대기](./renderer-app-refactoring.md#goal)          | [자동 검증](./renderer-app-refactoring.md#review)                                                 |
| [화면 헤더·비교 레이아웃 정리](./page-header-layout.md)              | 완료 (2026-10-25)                       | 다섯 화면 본문 헤더 제거와 비교 화면 구분선·하단 여백 정리            | [`APP-001`·`APP-005`·`APP-006`](../SPEC/01-foundation.md)                            | [범위와 의존성](./page-header-layout.md#roadmap)        | [검증 완료](./page-header-layout.md#goal)                       | [검증 기록](./page-header-layout.md#review)                                                       |
| [직업 데이터 탭 복구 초안](./job-data-tab.md)                        | 구현 중 (자동 테스트 완료·native 대기)  | 직업 기본 정보 편집, 복구 자동 저장, 저장된 diff 알림, 무기 유형 후보 | [Phase 4 직업·스킬](../SPEC/06-phase-03-06.md#spec-phase-04-jobs)                    | [후속 DB 목표](./job-data-tab.md#후속-db-목표)          | [남은 작업](./job-data-tab.md#남은-작업)                        | [부분 검증](./job-data-tab.md#review--부분-검증)                                                  |
| [직업 taxonomy 표시 데이터 계약](./job-taxonomy-display-contract.md) | 부분 (단계 A 일부 구현, 이후 절차 계획) | 4차 대표명과 DB 원본명 표시 분리, 단일 소스·승인·생성 경로 계획       | [제안 표시 계약](./job-taxonomy-display-contract.md#proposed--단계-a-완료-표시-계약) | [단계 계획](./job-taxonomy-display-contract.md#roadmap) | [인수 기준](./job-taxonomy-display-contract.md#goal--인수-기준) | [부분 검증](./job-taxonomy-display-contract.md#review--부분-검증-2026-11-08)                      |

## 작은 개선 요청

| 요청                       | 우선순위 | 상태   | 내용                                                              | 재검토 조건                                                                              |
| -------------------------- | -------- | ------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 직업 데이터 탭 재진입 캐시 | 하       | 미착수 | 탭 재진입마다 화면이 다시 마운트되어 DB와 작업본을 다시 조회한다. | 사용자 지연이 측정되면 검토한다. 저장·복사·버전 또는 validation 입력 변경 시 무효화한다. |

현재 핵심 흐름을 막지 않으므로 구현하지 않는다.

## 추가 기능 제안

- [넥슨 Open API 명세 변경 감지](../../../../docs/electron/nexon-open-api-spec-monitoring.md): 앱 실행 시 공식 명세 변경을 감지·알림·검토하는 신규 기능 제안(`REQ001`). 구현과 검증은 아직 진행하지 않았다.

## 관리 규칙

- 앞으로 작성하는 개별 요청 문서에는 [작업 우선순위](../../README.md#작업-우선순위)에 따른 우선순위(상/중/하), 선정 이유, 재검토 조건을 기록한다. 기존 요청에는 소급 적용하지 않는다.
- 독립 요청과 작은 개선은 `REQUESTS`에 기록하고 관련 [SPEC](../SPEC/README.md)을 참조한다. 향후 신규 기능은 [REQUIREMENTS](../REQUIREMENTS/README.md)에 REQ로 등록한다.
- 요청이 기존 사양을 변경하면 요청 문서의 변경 이력과 해당 SPEC을 함께 갱신한다.
- Phase 의존성과 선행 작업, 타 앱·공통 패키지 영향은 요청의 ROADMAP에 먼저 분석한다. 다른 앱의 GOAL을 임의로 완료 처리하지 않는다.
- 변경 완료는 요청 GOAL을 갱신하고 관련 범위를 재검증해 REVIEW에 결과를 기록한 뒤에만 표시한다. 기존 Phase의 완료 상태는 별도로 유지한다.
