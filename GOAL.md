# 현재 목표

## G-001. Electron Phase 2 검증 및 작업본 기반 검증

### 상태

진행 중. 이 목표는 `apps/electron/docs/GOAL.md`의 `EL-G002`와 같은 Phase 2 목표를 루트 수준에서 추적한다. Phase 0·1은 검증 기록이 있으나, Phase 2는 작업 트리의 미커밋 변경과 미완료 UI·검증 항목 때문에 아직 검증되지 않았다.

### 이유

게임 데이터를 입력해야 이후 데이터 기능을 신뢰할 수 있다. 따라서 버전별 게임 데이터를 validation, diff, 작업본 편집, dry-run·publish, 생성으로 이어지는 Electron 경로를 최우선으로 검증한다.

### 범위

- 변환 결과에서 분리된 작업본을 공통·도메인 규칙으로 검증한다.
- 검증 시작·진행·취소 IPC와 결과 UI를 완료한다.
- 파일·레코드·필드 issue, 정규화 전후 값, 경고 확인과 예외 사유, publish 가능 상태를 확인한다.
- `EL-G002`의 작업본·validator 구현과 UI를 실제 흐름에서 검증한다.
- 검증 완료 뒤에만 Phase 3 diff를 다음 목표로 선택한다.

### 제외

- Phase 3 버전 diff, Phase 4 작업본 편집, Phase 5 DB dry-run·publish, Phase 6 생성 구현.
- frontend character API 계약·UI 작업의 완료 선언.
- Electron Phase 2 완료 전 버전 게임 데이터 의존 기능의 제공.
- package 소유권을 Electron으로 이전.

### 완료 조건

- [ ] Electron `EL-G002`의 미완료 IPC·UI·대용량 renderer 응답성 항목을 구현하고, 각 항목의 검증 근거를 남긴다.
- [ ] 변환 결과에서 작업본을 만들고 검증을 시작·진행·취소하여, 오류·경고·위치·정규화 전후 값·publish 가능 상태를 UI에서 확인한다.
- [ ] 경고 확인 여부와 예외 사유를 저장하고 다시 조회한다.
- [ ] 오류가 있는 작업본이 다음 반영 단계로 갈 수 없음을 확인한다.
- [ ] Electron node/web typecheck, 테스트, lint, production build를 Phase 2 변경 기준으로 통과시킨다.
- [ ] `apps/electron/docs/REVIEW.md`에 최신 검증 결과와 남은 위험을 기록하고, `EL-G002` 완료 조건을 근거와 함께 완료 처리한다.

### 병행 작업과 의존성

- `apps/frontend`·`apps/back`은 character API 계약과 실제 API 표시를 Electron과 독립적으로 진행할 수 있다. 이 작업은 Electron publish를 기다리지 않는다.
- Phase 3 diff, Phase 4 편집, Phase 5 dry-run·명시 승인 publish, Phase 6 생성은 이 목표의 검증 완료 뒤 순서대로 진행한다.
- 신뢰된 버전 게임 데이터가 필요한 계산, 시뮬레이션과 데이터 소비 기능은 성공 publish 뒤에 진행한다.

완료 전에는 이 목표의 미완료 항목을 체크하지 않는다.
