# Agent Instructions

## Document Management

현재 프로젝트는 애플리케이션별로 개발 문서를 관리한다.

각 애플리케이션의 문서는 다음 위치에 존재한다.

- apps/frontend/docs/
- apps/back/docs/
- apps/electron/docs/
- apps/ingestor/docs/

프로젝트 전체의 방향과 개발 순서는 루트 `SPEC.md`, `ROADMAP.md`, `GOAL.md`에서 관리한다.
앱별 상세 요구사항과 검증 기록은 해당 앱 문서에서 관리한다.

## Working Rules

1. 작업을 시작하기 전에 루트 문서와 담당 앱의 기존 문서를 확인한다.
2. 현재 구현된 기능과 미구현 기능을 구분한다.
3. 루트 ROADMAP과 담당 앱의 ROADMAP이 있으면 함께 확인한다.
4. 루트 GOAL과 담당 앱의 GOAL이 있으면 작업 범위를 확인한다.
5. 구현 이후 담당 앱의 REVIEW가 있으면 검증 결과를 기록한다.
6. 검증이 완료된 항목만 해당 GOAL에서 완료 처리한다.

## Branch and Commit Rules

작업 범위에 맞는 브랜치에서 작업한다. 기존 미커밋 변경은 보존한다.
커밋할 때는 `docs/Git-Commit-Convention.md`와 최근 커밋 기록을 확인하고,
`type(scope): 변경 내용` 형식으로 한 커밋에 하나의 의도만 담는다.

## Cross-App Changes

다른 앱이나 공통 패키지의 수정이 필요하다면
변경 범위와 영향을 먼저 분석한다.

다른 앱의 GOAL을 임의로 완료 처리하지 않는다.
