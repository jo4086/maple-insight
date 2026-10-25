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

- docs/SPEC/README.md 및 연결된 요구사항 문서
- docs/ROADMAP.md 및 단계별 상세 문서
- docs/GOAL/README.md 및 현재 Phase 목표 문서
- docs/REVIEW.md 및 단계별 검증 기록
- docs/ARCHITECTURE.md
- 독립 요청과 작은 개선은 docs/REQUESTS/README.md 및 해당 요청 문서

## 4. Execution

1. 기존 코드를 분석한다.
2. docs/GOAL/README.md에서 현재 Phase를 확인하고 해당 목표 문서를 읽는다.
3. docs/SPEC/README.md에서 해당 요구사항 문서를 찾아 준수한다.
4. docs/ROADMAP.md에서 작업 의존성과 상세 문서를 확인한다.
5. 필요한 기능을 구현한다.
6. 테스트 및 검증을 수행한다.
7. docs/REVIEW.md에서 해당 검증 기록 문서를 찾아 결과를 기록한다.
8. 검증을 통과하면 해당 Phase 목표와 docs/GOAL/README.md의 상태를 갱신한다.

## 5. Constraints

- 기존 컴포넌트의 재사용 가능성을 먼저 확인한다.
- 공통 패키지의 변경 영향을 확인한다.
- 불필요한 의존성을 추가하지 않는다.
- 백엔드 API 계약을 임의로 변경하지 않는다.
