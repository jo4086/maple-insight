# 현재 목표

## G-001. Electron Phase 04 편집 작업본

### 상태

현재 다음 마일스톤은 [Electron Phase 04 — 직업·스킬·장비 데이터 편집](apps/electron/docs/GOAL/Phase04.md)이며 **진행 중 (작업본·직업 복구 선택 복사 부분 구현)** 상태다. edit workbench supersession을 집중 테스트 36개로 검증했고 직업 복구 미리보기·명시적 단일 직업 metadata 복사 IPC/UI도 부분 검증했지만 native Electron IPC·실제 DB는 미검증이고 기존 에디터의 새 workbench 읽기·쓰기 전환은 미구현이다. Phase 04 구현·검증 완료로 처리하지 않는다. 다음 작업 지시에서는 남은 Phase 04 기능보다 설계가 끝난 [Main process 구조 재정리](apps/electron/docs/REQUESTS/main-process-architecture.md)를 먼저 구현·검증한다. 단계 상태는 [Electron GOAL](apps/electron/docs/GOAL/README.md), 검증 결과는 [Electron REVIEW](apps/electron/docs/REVIEW.md)를 우선한다.

### 완료 이력

- Phase 02 검증 및 작업본 기반은 [목표](apps/electron/docs/GOAL/Phase02.md)와 [최종 검증](apps/electron/docs/REVIEW/Phase02.md#7-el-g002-완료-검증-2026-10-15)에 따라 완료됐다.
- Phase 03 버전 비교는 [목표](apps/electron/docs/GOAL/Phase03.md)와 [검증 기록](apps/electron/docs/REVIEW/Phase03.md)에 따라 완료됐다. 현재 DB에 `failed`·test 행이 없어 해당 native 표시는 미검증이라는 잔여 조건을 유지한다.

### 다음 범위

- [Main process 구조 재정리](apps/electron/docs/REQUESTS/main-process-architecture.md)를 문서 → 서비스 이동 → IPC 추출 → app/window/runtime 분리 순서로 먼저 구현하고 단계별 독립 검증한다.
- 구조 재정리 뒤 기존 에디터의 읽기·쓰기를 새 workbench로 전환하고 native Electron IPC·실제 DB 흐름을 검증한다.
- `newWeaponTypes`·전직 연결 등 복구 초안의 도메인별 필드를 설계·승인된 mapping으로 보강한다.
- Phase 4a 직업·스킬 보강, Phase 4b 스킬 유형·조건부 피해 규칙, Phase 4c 장비 수동 입력·스크린샷 후보 검토를 순서대로 진행한다.
- 실제 Electron 편집·저장·재열기 흐름을 검증하고 결과를 Electron REVIEW에 기록한 뒤에만 Phase 04를 완료 처리한다.

### 제외

- Phase 04 구현 또는 검증 완료 선언.
- Phase 05 DB dry-run·publish와 Phase 06 타입·정적 데이터 생성의 착수 또는 완료 선언.
- frontend character API, 수집, 시뮬레이션 등 다른 앱 마일스톤의 완료 선언.

### 완료 조건

- [ ] [Phase 04 목표](apps/electron/docs/GOAL/Phase04.md)의 공통 편집 경계와 Phase 4a~4c 완료 조건을 충족한다.
- [ ] 직업 → 스킬 → 새 무기 유형 → 장비 변경을 하나의 버전 작업본에서 재열어 검토한다.
- [ ] 검토 전 후보, 참조 오류, 저장·이미지 분석 실패가 확정값이나 publish 대상에 들어가지 않고 기존 작업본을 보존함을 확인한다.
- [ ] 실제 Electron 검증 결과와 남은 위험을 [Electron REVIEW](apps/electron/docs/REVIEW.md)에 기록한다.
- [ ] 앱 소유 [Electron GOAL](apps/electron/docs/GOAL/README.md)이 검증 근거와 함께 Phase 04 완료로 갱신된 뒤 루트 상태를 갱신한다.
