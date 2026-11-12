# Electron Phase 목표 및 진행 상태

현재 완료 단계: **[Phase 03 — 버전 비교](./Phase03.md)**. raw JSON 비교, 버전 sidebar·리스트·선택 복원, StrictMode 파일 목록 상태의 후속 변경을 검증했다. 현재 DB에 `failed`·test 행이 없어 해당 native 표시는 미검증이다. **[Phase 04 — 편집](./Phase04.md)은 진행 중 (작업본·직업 복구 선택 복사 부분 구현)**이다. edit workbench supersession을 집중 테스트 36개로 검증했고 직업 복구 미리보기·명시적 단일 직업 metadata 복사 IPC/UI도 부분 검증했지만 native Electron IPC·실제 DB는 미검증이고 기존 에디터의 새 workbench 읽기·쓰기 전환은 미구현이다. 다음 작업 지시에서는 남은 Phase 04 기능보다 설계가 끝난 [Main process 구조 재정리](../REQUESTS/main-process-architecture.md)를 먼저 구현·검증한다.

| 단계                | 상태                                           | 목표                              | 검증 근거                         |
| ------------------- | ---------------------------------------------- | --------------------------------- | --------------------------------- |
| Phase 00 — 기반     | 완료                                           | [ROADMAP](../ROADMAP.md#phase-00) | [REVIEW](../REVIEW.md)            |
| Phase 01 — 가져오기 | 완료                                           | [ROADMAP](../ROADMAP.md#phase-01) | [REVIEW](../REVIEW.md)            |
| Phase 02 — 검증     | 완료                                           | [Phase02](./Phase02.md)           | [검증 기록](../REVIEW/Phase02.md) |
| Phase 03 — 비교     | 완료                                           | [Phase03](./Phase03.md)           | [검증 기록](../REVIEW/Phase03.md) |
| Phase 04 — 편집     | 진행 중 (작업본·직업 복구 선택 복사 부분 구현) | [Phase04](./Phase04.md)           | 작업본·선택 복사 부분 검증        |
| Phase 05 — DB 반영  | 대기                                           | [Phase05](./Phase05.md)           | 검증 전                           |
| Phase 06 — 생성     | 대기                                           | [Phase06](./Phase06.md)           | 검증 전                           |

[REQ002-Phase01 새 직업 분류 초안 흐름](./REQ002/Phase01.md)은 별도 신규 기능 목표다. Phase 상태는 [ROADMAP](../ROADMAP.md#req002-phase01)에서만 관리한다.

[요청 목표](../REQUESTS/README.md)는 기존 Phase 03 완료 기록과 별개이며 수용 검증 전에는 완료로 두지 않는다. [Main process 구조 재정리](../REQUESTS/main-process-architecture.md)는 설계만 완료됐고 구현·검증은 아직 시작하지 않았다.

단계 완료는 구현과 검증을 모두 마친 뒤에만 표시한다. 결과는 [REVIEW](../REVIEW.md)에 기록한다. 요구사항은 [SPEC](../SPEC/README.md), 단계별 순서는 [ROADMAP](../ROADMAP.md), 설계는 [아키텍처](../ARCHITECTURE.md)를 따른다.
