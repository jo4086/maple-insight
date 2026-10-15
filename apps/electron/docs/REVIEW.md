# Maple Insight Data Studio Review

검증 원칙: 구현과 검증을 구분하고, 근거 없는 항목은 완료로 기록하지 않는다. 실행하지 못한 GUI·외부 호출은 미검증으로 남긴다. 실패와 경고는 다음 조치와 함께 기록한다.

| 범위                                            | 검증 기록                            |
| ----------------------------------------------- | ------------------------------------ |
| Phase 00·01 — 앱 기반, 가져오기·변환, 초기 감사 | [Phase00-01](./REVIEW/Phase00-01.md) |
| Phase 02 — 작업본·검증 진행 기록                | [Phase02](./REVIEW/Phase02.md)       |
| Phase 03 — raw JSON 버전 비교                   | [Phase03](./REVIEW/Phase03.md)       |
| Phase 03~06 설계 및 문서 분리 점검              | [Planning](./REVIEW/Planning.md)     |

Phase 02와 Phase 03의 기존 검증은 **완료**했다. Phase 03은 Node/Web typecheck, production build, ESLint, Prettier와 production·React dev StrictMode native Electron Playwright를 통과했다. 독립 검토 보완 뒤 자동 검사는 18 Vitest 파일·124개 테스트, build, Node/Web typecheck와 ESLint를 통과했다. 해당 보완의 native 최종 실행도 통과했다. 현재 DB에 `failed`·test 행이 없어 해당 native 표시는 미검증이다. native script 범위, 다섯 파일 fixture 근거와 대량 성능은 [Phase03](./REVIEW/Phase03.md)에 분리 기록했다. [진행 상태](./GOAL/README.md)를 따른다. 이전 날짜 기록의 `SPEC.md`, `GOAL.md` 등은 당시 파일 이름이다.
