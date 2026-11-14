# REQ001-Phase01: jobID 분류 검증 기반 구축

## 관련 문서

- [요구사항](../../REQUIREMENTS/REQ001.md)
- [로드맵](../../ROADMAP.md)
- [검토](../../REVIEW/REQ001/Phase01.md)

## 산출물

- [x] 원본과 해석용 ID를 분리하고 1~5자리 숫자 문자열, 선행 0, 6자리 시스템 ID를 처리하는 공유 순수 분류 규칙을 구현한다.
  - 근거: [공유 분류기](../../../src/taxonomy/job-id-classifier.ts), [분류기 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 허용 접두어, 더미 범위, 알 수 없는 값, 기본 직업군·분기·전직 진행을 구분한다.
  - 근거: [분류 규칙과 결과 타입](../../../src/taxonomy/job-id-classifier.ts), [일반·더미·미분류 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 루미너스와 에반의 확정 예외를 명시하고 레거시 에반 레코드를 원본 보존 상태로 enrichment 후보에서 제외한다.
  - 근거: [예외 및 retired ID 규칙](../../../src/taxonomy/job-id-classifier.ts), [예외·더미 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [ ] `3001`, 듀얼블레이드 1.5차·2.5차, 접두어 `19`의 fixture와 판정 근거를 검토한다.
  - 코드 fixture는 `3001`의 모호성 및 듀얼블레이드 1.5차·2.5차를 검사한다. `1.2.419` 원본에서 레테의 접두어 `19` ID는 확인했으나 taxonomy 매핑, `3001` 판정 문맥과 다른 실제 fixture는 미확정이다. 근거: [예외 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 정확한 스킬 그룹 ID를 직업 코드와 다른 결과 범주로 분류한다.
  - 근거: [정확 ID 조회 규칙](../../../src/taxonomy/job-id-classifier.ts), [스킬 그룹과 인접 미등록 ID 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] Electron 기존 직업 데이터 검증기가 공유 규칙을 소비하도록 연결한다.
  - 근거: [Electron 직업 검증기](../../../../../../apps/electron/src/main/services/class-data-validator.ts), [통합 테스트](../../../../../../apps/electron/src/main/services/class-data-validator.test.ts)

## 검증

- [x] 알려진 일반 직업의 접두어, 직업군, 분기, 전직 단계 fixture를 검사한다.
  - 근거: [일반 직업 분류 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 루미너스와 에반을 포함한 명시적 예외 fixture를 검사한다.
  - 근거: [명시적 예외 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] `7000`~`9999` 더미와 문서화되지 않은 ID가 직업으로 오인되거나 폐기되지 않는지 검사한다.
  - 근거: [더미·미분류 테스트](../../../src/taxonomy/job-id-classifier.test.ts), [Electron 원본 보존 테스트](../../../../../../apps/electron/src/main/services/class-data-validator.test.ts)
- [x] `40000`, `40001`~`40005`, `50000`, `50006`, `50007`만 정확한 스킬 그룹으로 분류되는지 검사한다.
  - 근거: [정확 스킬 그룹 테스트](../../../src/taxonomy/job-id-classifier.test.ts)
- [x] 6자리 시스템 ID가 사용자 직업 분류에서 제외되고 원본이 보존되는지 검사한다.
  - 근거: [시스템 ID 단위 테스트](../../../src/taxonomy/job-id-classifier.test.ts), [Electron 원본 보존 테스트](../../../../../../apps/electron/src/main/services/class-data-validator.test.ts)
- [ ] 모든 검증에서 원본 레코드와 DB가 변경되지 않는지 검사한다.
  - Electron 테스트에서 입력 레코드 보존은 확인했다. 검증 경로에 DB 쓰기는 없지만 실제 DB 무변경 검증은 수행하지 않았다. 근거: [Electron 통합 테스트](../../../../../../apps/electron/src/main/services/class-data-validator.test.ts)
- [ ] 결과 보고서가 정상, 예외, 더미, 알 수 없는 값, 스킬 그룹, 사용자 분류 제외를 구분하는지 검사한다.
  - Electron 경고는 더미, 미분류, 스킬 그룹, 시스템, 모호한 ID, 에반 빈 이름을 구분한다. 실제 원본 데이터셋 audit 및 사용자 검토는 남아 있다. 근거: [Electron 직업 검증기](../../../../../../apps/electron/src/main/services/class-data-validator.ts)

## 후속 범위

- [ ] 생성기와 DB 연동은 별도 요구사항으로 계획한다.
- [ ] 스킬 그룹과 개별 스킬의 정확한 연결 정책은 별도 요구사항으로 확정한다.
