# REQ001-Phase01 검토

## 관련 문서

- [요구사항](../../REQUIREMENTS/REQ001.md)
- [로드맵](../../ROADMAP.md)
- [목표](../../GOAL/REQ001/Phase01.md)

## 확인 결과

- [x] 공유 분류기가 원본 `jobID`를 유지하고 해석용 5자리 ID를 별도로 반환한다.
  - 근거: [공유 분류기](../../../src/taxonomy/job-id-classifier.ts), [분류기 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 알려진 직업, 더미, 미분류, 정확한 스킬 그룹, 6자리 시스템 ID, 잘못된 ID를 별도 결과로 분류한다.
  - 근거: [분류기 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 루미너스, 에반, 듀얼블레이드 1.5차·2.5차, `3001`, 제논 예외를 코드 fixture로 검사한다.
  - 근거: [예외 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] Electron 검증기가 공유 분류기를 사용하고 분류 경고와 원본 보존을 검사한다.
  - 근거: [Electron 직업 검증기](../../../../../../apps/electron/src/main/services/class-data-validator.ts), [Electron 통합 테스트](../../../../../../apps/electron/src/main/services/class-data-validator.test.ts)
- [ ] 접두어 `19` 레테 taxonomy 매핑, `3001` 추가 문맥, 듀얼블레이드 1.5차·2.5차를 실제 원본 fixture로 확정한다.
- [ ] 실제 원본 데이터셋의 분류 결과를 사용자와 검토한다.
- [ ] 스킬 그룹과 개별 스킬의 정확한 연결 정책을 확정한다.

## Electron 연동 동작

- 알려진 비모호 직업 ID는 기존 직업 레코드 검증을 계속하며 분류 경고를 추가하지 않는다.
- 미분류, 더미, 스킬 그룹, 6자리 시스템 ID, `3001` 같은 모호한 ID는 각각 `UNCLASSIFIED_JOB_ID`, `DUMMY_JOB_ID`, `SKILL_GROUP_JOB_ID`, `SYSTEM_JOB_ID`, `AMBIGUOUS_JOB_ID` 경고를 만든다.
- 에반 6차 `2220`의 빈 `jobName`은 `EMPTY_EVAN_SIXTH_JOB_NAME` 경고를 만들고 빈 원본 값을 유지한다.
- 미해결 경고가 생기면 검증 상태가 `ready`에서 `review`로 바뀔 수 있다. 원본 ID 분류 건수는 아래에서 예비 확인했으나 Electron 전체 검증의 최종 경고 수와 상태 영향은 별도로 확인해야 한다.
- 검증은 입력 원본 레코드를 변경하지 않는다. 이 변경에는 DB 쓰기 경로가 없다.

## 실행 근거

공유 분류기, Electron 전체 테스트와 빌드를 독립적으로 재실행했고, 화면은 모의 데이터로 검증했다.

- `pnpm --filter @maple/data-core exec tsx --test src/taxonomy/job-id-classifier.test.ts`
  - 결과: 통과, 5 tests passed.
- `pnpm --filter @maple/data-core run typecheck`
  - 결과: 통과.
- `pnpm --filter @maple/data-core run build`
  - 결과: 통과.
- `pnpm --filter @apps/electron test`
  - 결과: 통과, 202 tests passed.
- `pnpm --filter @apps/electron run typecheck:node`
  - 결과: 통과.
- `pnpm --filter @apps/electron exec electron-vite build`
  - 결과: 통과.
- `node apps/electron/scripts/verify-job-classification-playwright.mjs`
  - 결과: Playwright Chromium 모의 데이터로 desktop 1480×920·mobile 390×844의 검증 시작, 분류 경고 확인, 경고 승인 및 직업 화면 왕복 통과.

## 원본 데이터 예비 확인

- 읽기 전용으로 `data/production/1.2.419/json/ms_job.json`의 341개 ID에 공유 분류기를 적용했다. 알려진 직업 254개, 미분류 17개, 더미 17개, 스킬 그룹 9개, 시스템 ID 44개였다. 알려진 직업 중 `3001` 하나가 모호했고 에반 `2220`의 이름은 빈 문자열이었다.
- 미분류 17개에는 레테 `19000`, `19200`, `19210`, `19211`, `19212`, `19214` 여섯 건이 포함된다. 접두어 `19`는 허용되나 `classJobIdMap`에 레테가 없어 자동 확정하지 않는다. 나머지에는 매니저·운영자, 이벤트 직업, `30000`이 포함된다. 이 수치는 분류기 출력이며 Electron 검증 작업본의 최종 경고 수가 아니다.

## 미검증 범위

- Chromium 모의 화면은 확인했으나 네이티브 Electron UI와 실제 게임 데이터 전체에 대한 검증은 하지 않았다.
- 실제 DB 무변경은 검증하지 않았다. 코드 경로상 DB 쓰기는 없다.
