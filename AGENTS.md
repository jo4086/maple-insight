# Agent Instructions

## Document Management

현재 프로젝트는 애플리케이션별로 개발 문서를 관리한다.

각 애플리케이션의 문서는 다음 위치에 존재한다.

- apps/frontend/docs/
- apps/back/docs/
- apps/electron/docs/
- apps/ingestor/docs/

프로젝트 전체를 관리하는 문서는 아직 도입하지 않는다.

Electron의 독립 요청과 작은 개선은 `apps/electron/docs/REQUESTS/README.md`에서 관리한다. 기존 Phase의 완료 기록과 요청의 검증 상태를 혼동하지 않는다.

## Working Rules

1. 작업을 시작하기 전에 담당 앱의 문서를 확인한다.
2. 현재 구현된 기능과 미구현 기능을 구분한다.
3. 해당 앱의 ROADMAP을 기준으로 작업한다.
4. GOAL에서 현재 작업을 선택한다.
5. 구현 이후 REVIEW에 검증 결과를 기록한다.
6. 검증이 완료된 항목만 GOAL에서 완료 처리한다.

## Cross-App Changes

다른 앱이나 공통 패키지의 수정이 필요하다면
변경 범위와 영향을 먼저 분석한다.

다른 앱의 GOAL을 임의로 완료 처리하지 않는다.

## Screenshot Management

- 스크린샷 관리 규칙은 `screenshots/README.md`를 참조한다.
- UI 분석 및 수정 시 관련된 `screenshots/manual/`의 사용자 제공 이미지를 확인한다.
- Playwright를 이용한 UI 검증 시 스크린샷은 `screenshots/playwright/`의 해당 애플리케이션 디렉터리에 저장한다.
- 사용자 제공 스크린샷은 임의로 수정하거나 삭제하지 않는다.
- Playwright 검증 시 필요한 경우 스크린샷을 촬영하고 실제 UI와 요구사항을 비교한다.
- 이미지 산출물은 Git에 커밋하지 않는다.
