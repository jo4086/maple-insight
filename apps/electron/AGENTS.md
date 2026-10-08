# Electron Agent Instructions

## 1. Scope

`apps/electron` 영역에 적용한다.

루트 `AGENTS.md`의 공통 규칙을 준수한다.

## 2. Technology

- React
- Electron
- Vite
- TypeScript
- TailwindCSS

## 3. Documentation

다음 문서를 참조한다.

- docs/SPEC.md
- docs/ROADMAP.md
- docs/GOAL.md
- docs/REVIEW.md

## 4. Execution

1. 기존 코드를 분석한다.
2. GOAL.md에서 현재 작업을 확인한다.
3. SPEC.md를 준수한다.
4. ROADMAP.md의 작업 의존성을 확인한다.
5. 필요한 기능을 구현한다.
6. 테스트 및 검증을 수행한다.
7. REVIEW.md에 검증 결과를 기록한다.
8. 검증을 통과하면 GOAL.md를 갱신한다.

## 5. Constraints

- 기존 컴포넌트의 재사용 가능성을 먼저 확인한다.
- 공통 패키지의 변경 영향을 확인한다.
- 불필요한 의존성을 추가하지 않는다.
- 백엔드 API 계약을 임의로 변경하지 않는다.
