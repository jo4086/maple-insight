# Electron 요청

독립 요청과 작은 개선 요청을 모두 이 목차에서 관리한다. Phase 03 완료·검증 기록을 새 요청의 완료 근거로 사용하지 않는다.

| 요청                                                        | 상태                                   | 요약                                                                  | SPEC                                                                     | ROADMAP                                              | GOAL                                                   | REVIEW                                              |
| ----------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| [버전 관리 확장](./version-management.md)                   | 진행 중 (부분 검증)                    | 탐색 접기/펼치기, 출시일 수정, 전체 복제, 소프트 삭제, 아이콘 작업 UI | [§8.2](../SPEC/01-foundation.md#spec-version-management)                 | [의존성과 순서](./version-management.md#roadmap)     | [완료 조건](./version-management.md#goal)              | [검증 상태](./version-management.md#review)         |
| [통합 비교 작업공간](./comparison-workspace.md)             | refinement 검증 완료 (route 확인 대기) | 전역 현재 버전, 저장 결과 자동 열기, 다섯 파일 batch, 3-panel 결과    | [`DIF-032`~`DIF-046`](../SPEC/03-diff-edit.md#spec-comparison-workspace) | [범위와 의존성](./comparison-workspace.md#roadmap)   | [부분 검증](./comparison-workspace.md#goal)            | [검증 기록](./comparison-workspace.md#review)       |
| [버전 비교 결과 화면 개선](./version-comparison-results.md) | 대체됨 (기록 유지)                     | 통합 비교 작업공간이 `DIF-020`~`DIF-031`의 개요·상세 분리를 대체      | [`DIF-020`~`DIF-031`](../SPEC/03-diff-edit.md#spec-diff-base)            | [적용 결과](./version-comparison-results.md#roadmap) | [과거 완료 조건](./version-comparison-results.md#goal) | [과거 검증](./version-comparison-results.md#review) |
| [아이콘 의미 정책](./icon-semantics.md)                     | 완료 (2026-10-15)                      | 현재 UI 방향 아이콘의 의미·표시·접근성 기준                           | [`APP-010`·`APP-011`](../SPEC/01-foundation.md#icon-semantics)           | [적용 결과](./icon-semantics.md#roadmap)             | [현재 UI 범위 완료](./icon-semantics.md#goal)          | [검증 완료](./icon-semantics.md#review)             |
| [Renderer App 책임 분리](./renderer-app-refactoring.md)     | 진행 중 (자동 검증 완료)               | React Router v7 도입과 App·라우트·기능 상태 분리                      | [`APP-001`~`APP-009`](../SPEC/01-foundation.md)                          | [적용 범위](./renderer-app-refactoring.md#roadmap)   | [native 확인 대기](./renderer-app-refactoring.md#goal) | [자동 검증](./renderer-app-refactoring.md#review)   |
| [화면 헤더·비교 레이아웃 정리](./page-header-layout.md)     | 완료 (2026-10-25)                      | 다섯 화면 본문 헤더 제거와 비교 화면 구분선·하단 여백 정리            | [`APP-001`·`APP-005`·`APP-006`](../SPEC/01-foundation.md)                | [범위와 의존성](./page-header-layout.md#roadmap)     | [검증 완료](./page-header-layout.md#goal)              | [검증 기록](./page-header-layout.md#review)         |

## 관리 규칙

- 독립 요청과 작은 개선도 `REQUESTS`에 기록하고 관련 [SPEC](../SPEC/README.md)을 참조한다.
- 요청이 기존 사양을 변경하면 요청 문서의 변경 이력과 해당 SPEC을 함께 갱신한다.
- Phase 의존성과 선행 작업, 타 앱·공통 패키지 영향은 요청의 ROADMAP에 먼저 분석한다. 다른 앱의 GOAL을 임의로 완료 처리하지 않는다.
- 변경 완료는 요청 GOAL을 갱신하고 관련 범위를 재검증해 REVIEW에 결과를 기록한 뒤에만 표시한다. 기존 Phase의 완료 상태는 별도로 유지한다.
